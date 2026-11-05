"""Render an exported ANSI actor sprite (the .js produced by import_ansi_actor.py)
to a PNG with a coordinate grid, so face / limbs can be located in source pixels.

Usage:
    python render_sprite.py <sprite.js> <out.png> [zoom=6] [grid=10]
        [--crop x0,y0,x1,y1] [--tint i,j,k]

The grid is drawn *after* cropping, so every grid line inside the crop keeps its
label. --tint dims every colour that is not in the list, which is how a single
"is this the face?" question gets answered without guessing.
"""
import json
import re
import sys

from PIL import Image, ImageDraw


def load(path):
    text = open(path, encoding='utf-8').read()
    m = re.search(r'=(\{.*\});', text, re.S)
    return json.loads(m.group(1))


def arg(name, default=None):
    if name in sys.argv:
        return sys.argv[sys.argv.index(name) + 1]
    return default


def main():
    src, out = sys.argv[1], sys.argv[2]
    zoom = int(sys.argv[3]) if len(sys.argv) > 3 else 6
    grid = int(sys.argv[4]) if len(sys.argv) > 4 else 10
    tint = None
    if arg('--tint'):
        tint = {int(v) for v in arg('--tint').split(',')}

    d = load(src)
    W, H = d['width'], d['height']
    im = Image.new('RGB', (W, H))
    for y in range(H):
        for x in range(W):
            i = d['alphabet'].index(d['rows'][y][x])
            if i <= 0:
                continue
            c = d['palette'][i]
            rgb = (int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16))
            im.putpixel((x, y), rgb if (not tint or i in tint) else tuple(v // 4 for v in rgb))

    x0, y0, x1, y1 = 0, 0, W, H
    crop = arg('--crop')
    if crop:
        x0, y0, x1, y1 = [int(v) for v in crop.split(',')]

    big = im.crop((x0, y0, x1, y1)).resize(((x1 - x0) * zoom, (y1 - y0) * zoom), Image.NEAREST)
    dr = ImageDraw.Draw(big)
    for gy in range(y0 - y0 % grid, y1 + 1, grid):
        py = (gy - y0) * zoom
        if py < 0:
            continue
        dr.line([(0, py), (big.width, py)], fill=(0, 110, 235), width=1)
        dr.text((1, py + 1), str(gy), fill=(120, 230, 255))
    for gx in range(x0 - x0 % grid, x1 + 1, grid):
        px = (gx - x0) * zoom
        if px < 0:
            continue
        dr.line([(px, 0), (px, big.height)], fill=(0, 110, 235), width=1)
        dr.text((px + 1, 1), str(gx), fill=(120, 230, 255))
    big.save(out)
    print({'out': out, 'size': big.size, 'crop': [x0, y0, x1, y1]})


if __name__ == '__main__':
    main()
