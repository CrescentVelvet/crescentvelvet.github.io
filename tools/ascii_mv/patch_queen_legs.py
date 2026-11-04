"""Make the queen's back leg exactly match her front leg.

The source ANSI actor (assets/data/ascii_mv/link_up/queen_ansi.js) draws her front
(image-left) leg as one clean cream band, while the back leg is a black leg edged by
two pale outlines. At gameplay scale that pair of outlines reads as one thick white
leg, so the back leg looks heavier than the front one no matter how the hollow is
filled.

The front leg is the reference: this patch takes the cream band of the front leg
(the largest cream blob on the left half), mirrors it across the body axis to the
back leg, and copies the one pixel of shading on each side so the two legs share the
same width, slope and outline colour. Everything the back leg had there is cleared
first, which also removes leftovers from earlier patches. Hair, skirt trim, the red
accents and the front leg are never touched.

Usage: python patch_queen_legs.py [FILE]   (default: the actor asset)
Idempotent: the applied marker "legMirror" is stored next to the data.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / 'assets/data/ascii_mv/link_up/queen_ansi.js'
MARK = 'mirror-front-leg-axis62'

AXIS = 62                  # body centre line: back leg = 2*AXIS - x
FRONT_X = (44, AXIS)       # columns that can hold the front leg's cream band
FRONT_Y = (66, 88)
BACK_X = (65, 77)          # columns that can hold the back leg
BACK_Y = (69, 84)
LIT = 90                   # above this the back leg counts as highlight (not body)
CREAM = (2, 3)             # #ffffbf / #fdf3c2, the front leg's band
FILL = 1                   # #09090b, leg body


def load(path):
    text = path.read_text(encoding='utf-8')
    body = re.search(r'window\.__LU_QUEEN_ANSI=(\{.*\});', text, re.S).group(1)
    at = text.index(body)
    return text[:at], json.loads(body), text[at + len(body):]


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else TARGET
    head, data, tail = load(path)

    alpha = data['alphabet']
    palette = [tuple(int(p.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
               for p in data['palette']]
    grid = [[alpha.index(c) for c in row] for row in data['rows']]
    width = data['width']

    def lum(v):
        return max(palette[v]) if v else 0

    def is_red(v):
        r, g, _ = palette[v]
        return r > 110 and g < r * 0.62

    # 1) the front leg = largest cream blob on the left half
    blob = {(x, y) for y in range(*FRONT_Y) for x in range(*FRONT_X)
            if grid[y][x] in CREAM}
    seen, comps = set(), []
    for p in sorted(blob):
        if p in seen:
            continue
        stack, comp = [p], []
        seen.add(p)
        while stack:
            cx, cy = stack.pop()
            comp.append((cx, cy))
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1),
                           (1, 1), (1, -1), (-1, 1), (-1, -1)):
                q = (cx + dx, cy + dy)
                if q in blob and q not in seen:
                    seen.add(q)
                    stack.append(q)
        comps.append(comp)
    if not comps:
        print('no front-leg cream band found')
        return
    leg = max(comps, key=len)
    rows = sorted({p[1] for p in leg})

    # 2) mirror source = the band plus one pixel of shading on each side
    legs = set(leg)
    source = {p: grid[p[1]][p[0]] for p in leg}
    for x, y in leg:
        for nx in (x - 1, x + 1):
            if 0 <= nx < AXIS and (nx, y) not in legs:
                v = grid[y][nx]
                if v not in CREAM and v != 0:
                    source[(nx, y)] = v

    # 3) clear the back leg: highlights and leftover cream go back to leg body
    cleared = 0
    for y in range(*BACK_Y):
        for x in range(*BACK_X):
            v = grid[y][x]
            if v and not is_red(v) and (v in CREAM or lum(v) > LIT):
                grid[y][x] = FILL
                cleared += 1

    # 4) paint the mirrored band
    for (x, y), v in source.items():
        tx = 2 * AXIS - x
        if 0 <= tx < width:
            grid[y][tx] = v

    data['rows'] = [''.join(alpha[v] for v in row) for row in grid]
    data['legMirror'] = MARK
    path.write_text(head + json.dumps(data, separators=(',', ':')) + tail,
                    encoding='utf-8', newline='\n')
    print('front leg: %d px, rows %d-%d; mirrored %d px, cleared %d'
          % (len(leg), rows[0], rows[-1], len(source), cleared))


if __name__ == '__main__':
    main()
