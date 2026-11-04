"""Mirror the lit highlight of the queen's front leg onto the back leg.

The source ANSI actor (assets/data/ascii_mv/link_up/queen_ansi.js) paints a pale
cream highlight down her front (image-left) leg only; the back leg is left flat
black, which reads as "one white leg, one black leg" at gameplay scale. This
patch copies the cream/grey pixels of the front leg onto the mirrored position
of the back leg, overwriting only near-black interior pixels, so both legs carry
the same highlight without touching silhouette, outline or red accents.

Usage: python patch_queen_legs.py [FILE]   (default: the actor asset)
Idempotent: the applied marker "legHighlight" is stored next to the data.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / 'assets/data/ascii_mv/link_up/queen_ansi.js'
MARK = 'mirror-v1'

AXIS = 61          # mirror axis between the two legs
SRC_X = (49, 59)   # columns holding the front leg's highlight
YRANGE = (69, 93)  # highlight span, stops above the shin/boot
LIT = range(2, 13)  # cream + grey ramp; index 1 is the near-black interior
DARK = (1, 18, 19, 20)


def load(path):
    text = path.read_text(encoding='utf-8')
    body = re.search(r'window\.__LU_QUEEN_ANSI=(\{.*\});', text, re.S).group(1)
    return text[:text.index(body)], json.loads(body), text[text.index(body) + len(body):]


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else TARGET
    head, data, tail = load(path)
    if data.get('legHighlight') == MARK:
        print('already patched')
        return
    alpha = data['alphabet']
    grid = [[alpha.index(c) for c in row] for row in data['rows']]
    written = 0
    for y in range(*YRANGE):
        for x in range(*SRC_X):
            v = grid[y][x]
            if v not in LIT:
                continue
            tx = 2 * AXIS - x
            for t in (tx, tx + 1):  # widen by 1px: the canvas downsamples ~0.4x
                if 0 <= t < data['width'] and grid[y][t] in DARK:
                    grid[y][t] = v
                    written += 1
    data['rows'] = [''.join(alpha[v] for v in row) for row in grid]
    data['legHighlight'] = MARK
    path.write_text(head + 'window.__LU_QUEEN_ANSI='
                    + json.dumps(data, separators=(',', ':')) + ';' + tail,
                    encoding='utf-8', newline='\n')
    print('patched pixels:', written)


if __name__ == '__main__':
    main()
