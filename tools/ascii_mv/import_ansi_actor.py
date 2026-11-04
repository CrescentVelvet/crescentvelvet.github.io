"""Convert a true-color ANSI half-block actor to compact indexed cell data.

Usage: python import_ansi_actor.py INPUT.txt OUTPUT.js [--preview OUTPUT.png]
Requires Pillow. SGR is parsed as data; no terminal commands are executed.
Black outside the silhouette becomes transparent; enclosed dark clothing stays
opaque. The output preserves both halves of every ANSI cell (no coarse resize).
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def decode_ansi(text):
    foreground, background = (255, 255, 255), (0, 0, 0)
    rows, row = [], []
    tokens = re.findall(r"\x1b\[[0-9;]*m|[^\x1b]", text.replace('\r', ''))
    for token in tokens:
        if token.startswith('\x1b['):
            args = [int(v or 0) for v in token[2:-1].split(';')]
            i = 0
            while i < len(args):
                if args[i] == 0:
                    foreground, background = (255, 255, 255), (0, 0, 0)
                elif args[i] in (38, 48) and args[i + 1:i + 2] == [2]:
                    rgb = tuple(args[i + 2:i + 5])
                    if len(rgb) != 3 or any(v < 0 or v > 255 for v in rgb):
                        raise ValueError('Invalid true-color SGR')
                    if args[i] == 38:
                        foreground = rgb
                    else:
                        background = rgb
                    i += 4
                i += 1
        elif token == '\n':
            if row:
                rows.append(row)
                row = []
        elif token == '▀':
            row.append((foreground, background))
        elif token == '▄':
            row.append((background, foreground))
        elif token == '█':
            row.append((foreground, foreground))
        elif token == ' ':
            row.append((background, background))
        else:
            raise ValueError('Unsupported ANSI character: ' + repr(token))
    if row:
        rows.append(row)
    if not rows or len({len(row) for row in rows}) != 1:
        raise ValueError('Actor must have rectangular cell rows')
    im = Image.new('RGB', (len(rows[0]), len(rows) * 2))
    for y, row in enumerate(rows):
        for x, (top, bottom) in enumerate(row):
            im.putpixel((x, y * 2), top)
            im.putpixel((x, y * 2 + 1), bottom)
    return im


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('input', type=Path)
    ap.add_argument('output', type=Path)
    ap.add_argument('--preview', type=Path)
    ap.add_argument('--exposure', type=float, default=1.0, help='Foreground brightness multiplier')
    ap.add_argument('--drop-cool', type=float, default=0.0, metavar='RATIO',
                    help='Treat dark pixels whose blue exceeds red*RATIO as backdrop '
                         '(strips a baked-in cold ground glow); 0 disables')
    args = ap.parse_args()
    raw = args.input.read_bytes()
    im = decode_ansi(raw.decode('utf-8-sig'))
    if not 0.5 <= args.exposure <= 2:
        raise ValueError('Exposure must be between 0.5 and 2')
    w, h = im.size
    ink = Image.new('L', im.size)
    ink.putdata([255 if max(p) >= 48 else 0 for p in im.getdata()])
    # Close one-cell antialias gaps before finding enclosed dark areas.
    closed = ink.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    outside = Image.new('L', (w + 2, h + 2))
    outside.paste(closed, (1, 1))
    ImageDraw.floodfill(outside, (0, 0), 128)
    outside = outside.crop((1, 1, w + 1, h + 1))
    opaque = [ink.getpixel((x, y)) > 0 or outside.getpixel((x, y)) != 128
              for y in range(h) for x in range(w)]
    # 有些 ANSI 立绘自带一块冷色地面/环境光（B 明显高于 R）。直接搬进暖色场景，
    # 人物脚下会多出一块蓝灰板子。--drop-cool 把这类暗冷色并回背景。
    if args.drop_cool > 0:
        for i, p in enumerate(im.getdata()):
            if opaque[i] and max(p) < 120 and p[2] > p[0] * args.drop_cool:
                opaque[i] = False
    im.putdata([tuple(min(255, round(v * args.exposure)) for v in p) if max(p) >= 48 else p
                for p in im.getdata()])
    # Quantize foreground only, so the near-black source backdrop does not
    # consume the palette. Index 0 is transparent; index 1 is dark interior.
    colors = [p for p, ok in zip(im.getdata(), opaque) if ok]
    strip = Image.new('RGB', (len(colors), 1)); strip.putdata(colors)
    quant = strip.quantize(colors=22, method=Image.Quantize.MEDIANCUT)
    palette = [(0, 0, 0), (9, 9, 11)]
    rawpal = quant.getpalette()
    palette += [tuple(rawpal[i:i + 3]) for i in range(0, 66, 3)]
    alphabet = '.0123456789ABCDEFGHIJKLMN'
    rows = []
    preview = Image.new('RGBA', im.size)
    for y in range(h):
        row = ''
        for x in range(w):
            p = im.getpixel((x, y))
            if not opaque[y * w + x]:
                index = 0
            elif max(p) < 48:
                index = 1
            else:
                index = min(range(2, len(palette)), key=lambda i: sum((p[k] - palette[i][k]) ** 2 for k in range(3)))
            row += alphabet[index]
            preview.putpixel((x, y), (*palette[index], 255 if index else 0))
        rows.append(row)
    data = dict(width=w, height=h, ansiRows=h // 2, alphabet=alphabet,
                palette=['#%02x%02x%02x' % p for p in palette], rows=rows,
                sourceSha256=hashlib.sha256(raw).hexdigest(), exposure=args.exposure)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text('// User-supplied ANSI actor; generated by tools/ascii_mv/import_ansi_actor.py\n'
                           + 'window.__LU_QUEEN_ANSI=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8')
    if args.preview:
        preview.resize((w * 6, h * 6), Image.Resampling.NEAREST).save(args.preview)
    print(json.dumps(dict(width=w, ansiRows=h // 2, colors=len(palette), bytes=args.output.stat().st_size)))


if __name__ == '__main__':
    main()
