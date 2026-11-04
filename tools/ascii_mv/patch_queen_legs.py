"""Fill the hollow between the queen's back-leg highlights so both legs read white.

The source ANSI actor (assets/data/ascii_mv/link_up/queen_ansi.js) draws her front
(image-left) leg as one solid cream band, while the back leg is a black leg edged by
two pale lines. At gameplay scale the edged leg reads as "one white leg, one black
leg", and mirroring a single edge onto the other side (the previous approach) put the
cream in the wrong place and made that leg look thicker.

The leg is what sits *between* the two pale edges, so this patch fills only the dark
pixels inside that pair and leaves both edges intact: the back leg becomes a single
continuous cream band of the same width and slope as the front one, with no internal
seam. Nothing outside the pair is touched, so the silhouette, the red accents and the
front leg stay exactly as drawn.

Usage: python patch_queen_legs.py [FILE]   (default: the actor asset)
Idempotent: the applied marker "legFill" is stored next to the data.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / 'assets/data/ascii_mv/link_up/queen_ansi.js'
MARK = 'fill-gap-v1'

Y_RANGE = (70, 82)    # back-leg band, stops above the boot highlight
X_RANGE = (66, 79)    # columns that can hold the back leg
LIT = 110             # brightness above this is a highlight edge, not the hollow
CREAM = 3             # #fdf3c2, the same tone as the front leg
GAP = (2, 4)          # edge spacing that identifies one leg's two outlines


def load(path):
    text = path.read_text(encoding='utf-8')
    body = re.search(r'window\.__LU_QUEEN_ANSI=(\{.*\});', text, re.S).group(1)
    return text[:text.index(body)], json.loads(body), text[text.index(body) + len(body):]


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else TARGET
    head, data, tail = load(path)
    if data.get('legFill') == MARK:
        print('already patched')
        return

    alpha = data['alphabet']
    palette = [tuple(int(p.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
               for p in data['palette']]
    grid = [[alpha.index(c) for c in row] for row in data['rows']]
    bright = lambda v: v > 0 and max(palette[v]) > LIT

    written = 0
    rows = 0
    for y in range(*Y_RANGE):
        edges = [x for x in range(*X_RANGE) if bright(grid[y][x])]
        pair = next(((edges[i], edges[i + 1]) for i in range(len(edges) - 1)
                     if GAP[0] <= edges[i + 1] - edges[i] <= GAP[1]), None)
        if pair is None:
            continue
        lo, hi = pair
        filled = 0
        for x in range(lo + 1, hi):          # keep both edges, fill the hollow
            if not bright(grid[y][x]) and grid[y][x] != CREAM:
                grid[y][x] = CREAM
                filled += 1
        if filled:
            rows += 1
            written += filled

    data['rows'] = [''.join(alpha[v] for v in row) for row in grid]
    data['legFill'] = MARK
    path.write_text(head + 'window.__LU_QUEEN_ANSI='
                    + json.dumps(data, separators=(',', ':')) + ';' + tail,
                    encoding='utf-8', newline='\n')
    print('patched pixels: %d across %d rows' % (written, rows))


if __name__ == '__main__':
    main()
