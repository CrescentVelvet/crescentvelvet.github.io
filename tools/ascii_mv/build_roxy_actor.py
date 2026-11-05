"""Turn the imported Roxy ANSI actor into a layered actor.

Input is the JS produced by import_ansi_actor.py; output keeps the same rows but
adds a `parts` field plus a few cleanup passes that belong to this sheet only:

  * the sheet ships with a baked-in red ground line under the feet;
  * three strands stick up above the hair mass and are separated into their own
    layers (1 left tuft / 2 top spike / 3 right sweep) so each can sway about its
    own root -- rotating the whole top-of-head as one slab reads as the skull
    itself wobbling, which is what the first version did;
  * the warhammer hangs off the right hand, so it can breathe on its own.

Usage:
  python build_roxy_actor.py IN.js OUT.js [--preview OUT.png]

The parts must stay mutually exclusive: the renderer draws them as separate
canvases, and any pixel claimed by two layers would show up as a double image
(each layer is displaced independently). The renderer adds a 1px halo of body
pixels around every moving layer, which is what closes the seam at the root
where the strand leaves the mass.
"""
import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

# Palette groups, resolved from the sheet itself (see import output).
STEEL = {7, 11, 12}      # cold blue-grey plates
LIGHT = {2}              # bone-white rim light / skin highlight
GEM = {14, 15}           # the bright red gems in the hammer head
OUTLINE = {1}            # the near-black ink line that wraps every shape
RED = {14, 15, 16, 17, 18, 19}

# Strand masks, in source pixels (110x110), one row -> (x0, x1) inclusive.
# Hand-traced from the sheet: the hair mass (the thick mint cap that sits on the
# skull) stays with the body, only the bits that stick out above it move. The
# bottom row of each mask is deliberately 1px *inside* the cap so the strand has
# a root to pivot on instead of a free-floating cut.
STRANDS = {
    1: {  # left tuft, tip at (46, 15), rooted on the side hair
        15: (44, 48),
        16: (44, 49),
        17: (44, 49),
        18: (46, 49),
    },
    2: {  # top spike, tip at (60, 9), rooted on the crown of the cap
        9: (59, 64),
        10: (58, 64),
        11: (57, 63),
        12: (57, 62),
    },
    3: {  # right sweep, tip at (70, 17), rooted where it leaves the cap
        12: (64, 67),
        13: (64, 68),
        14: (65, 69),
        15: (67, 70),
        16: (68, 70),
        17: (68, 71),
        18: (69, 71),
    },
}
WEAPON_BOX = (74, 40, 110, 93)
WEAPON_PART = 4
GROUND_SIDE = (98, 40, 77)      # y from, x < 40 or x > 77 -> remote ground line


def load(path):
    text = Path(path).read_text(encoding='utf-8')
    m = re.search(r'=(\{.*\});', text, re.S)
    if not m:
        raise SystemExit('cannot find the data object in ' + str(path))
    return json.loads(m.group(1))


def boxes(x, y, box):
    return box[0] <= x < box[2] and box[1] <= y < box[3]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('input', type=Path)
    ap.add_argument('output', type=Path)
    ap.add_argument('--preview', type=Path)
    ap.add_argument('--var', default='__LU_ROXY_ANSI')
    args = ap.parse_args()

    data = load(args.input)
    W, H = data['width'], data['height']
    alpha = data['alphabet']
    idx = [[alpha.index(data['rows'][y][x]) for x in range(W)] for y in range(H)]

    # 1) drop the baked-in ground line. The sheet paints a dashed red horizon at
    #    y>=98 that runs far to both sides of the boots; in a scene it reads as a
    #    short plank under the character.
    gy, gx0, gx1 = GROUND_SIDE
    for y in range(gy, H):
        for x in range(W):
            if (x < gx0 or x > gx1) and idx[y][x] in RED:
                idx[y][x] = 0

    # 2) part maps. Each strand takes *every* opaque cell inside its window (ink
    #    line and rim light included): leaving the outline behind with the body
    #    shows up as a ghost edge the moment the strand sways.
    part = [[0] * W for _ in range(H)]
    for pid, rows in STRANDS.items():
        for y, (x0, x1) in rows.items():
            for x in range(x0, x1 + 1):
                if idx[y][x]:
                    part[y][x] = pid

    # 3) hammer: plates + gems -> close -> fill holes -> grow 1px onto the ink line.
    #    Colour alone leaves the gems floating (they never touch the plates) and
    #    leaves the ink outline behind, so the mask is built geometrically and only
    #    then re-checked against colours (dark red skirt is *not* part of it).
    core = Image.new('L', (W, H))
    core.putdata([255 if idx[y][x] in (STEEL | LIGHT | GEM) and boxes(x, y, WEAPON_BOX)
                  else 0 for y in range(H) for x in range(W)])
    solid = core.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    hole = solid.copy()
    ImageDraw.floodfill(hole, (0, 0), 128)          # outside becomes 128
    hp = hole.load()
    for y in range(WEAPON_BOX[1], WEAPON_BOX[3]):
        for x in range(WEAPON_BOX[0], WEAPON_BOX[2]):
            if idx[y][x] and hp[x, y] != 128:
                part[y][x] = WEAPON_PART           # enclosed cavity -> hammer
    grown = solid.filter(ImageFilter.MaxFilter(3)).load()
    keep = STEEL | LIGHT | GEM | OUTLINE
    for y in range(WEAPON_BOX[1], WEAPON_BOX[3]):
        for x in range(WEAPON_BOX[0], WEAPON_BOX[2]):
            if idx[y][x] and grown[x, y] and part[y][x] == 0 and idx[y][x] in keep:
                part[y][x] = WEAPON_PART

    # 4) serialise. Anything outside a part falls back to body.
    rows = []
    parts = []
    for y in range(H):
        row = ''.join(alpha[idx[y][x]] for x in range(W))
        rows.append(row)
        parts.append(''.join(str(part[y][x]) for x in range(W)))

    data['rows'] = rows
    data['parts'] = parts
    data['partsOf'] = {'body': 0, 'hairLeft': 1, 'hairTop': 2, 'hairRight': 3,
                       'weapon': WEAPON_PART}
    data['groundTrimmed'] = {'y': GROUND_SIDE[0], 'keepX': GROUND_SIDE[1:]}
    out = ('// Layered Roxy actor; generated by tools/ascii_mv/build_roxy_actor.py\n'
           'window.%s=%s;\n' % (args.var, json.dumps(data, separators=(',', ':'))))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(out, encoding='utf-8')

    counts = [sum(1 for y in range(H) for x in range(W) if idx[y][x] and part[y][x] == k)
              for k in range(WEAPON_PART + 1)]
    if args.preview:
        colors = {0: (235, 235, 235), 1: (0, 220, 220), 2: (120, 255, 120),
                  3: (255, 220, 0), 4: (255, 0, 220)}
        im = Image.new('RGB', (W, H))
        im.putdata([colors[part[y][x]] if idx[y][x] else (0, 0, 0)
                    for y in range(H) for x in range(W)])
        im.resize((W * 6, H * 6), Image.Resampling.NEAREST).save(args.preview)
    print(json.dumps(dict(width=W, height=H, body=counts[0], hairLeft=counts[1],
                          hairTop=counts[2], hairRight=counts[3], weapon=counts[4],
                          bytes=args.output.stat().st_size)))


if __name__ == '__main__':
    main()
