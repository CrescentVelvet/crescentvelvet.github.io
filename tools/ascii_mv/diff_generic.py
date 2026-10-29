# -*- coding: utf-8 -*-
"""通用全帧对比：新格式参考帧（plain+styles 数组）vs node_extract 提取网格。
用法: python diff_generic.py <ref.json> <t1> [t2 ...]
提取网格从 <AMV_TMP>/grid2_<t>.json 读取；AMV_TMP 环境变量默认仓库 .workbuddy/tmp。"""
import json
import os
import sys
from pathlib import Path

BASE = Path(os.environ.get('AMV_TMP',
         r'C:\code\crescentvelvet.github.io\.workbuddy\tmp'))
ref_path = Path(sys.argv[1])
ts = [float(x) for x in sys.argv[2:]]
refs = {f['t']: f for f in json.loads(ref_path.read_text(encoding='utf-8'))}

total_bad = 0
for t in ts:
    ref = refs.get(t)
    if ref is None:
        print(f't={t} no ref'); total_bad += 1; continue
    mp = BASE / f'grid2_{t}.json'
    if not mp.exists():
        print(f't={t} MISSING extract'); total_bad += 1; continue
    mine = json.loads(mp.read_text(encoding='utf-8'))
    char_diff = style_diff = 0
    first = None
    rows = []
    for y in range(ref['h']):
        for x in range(ref['w']):
            rc = ref['plain'][y][x]
            mc = mine['plain'][y][x]
            rs = int(ref['styles'][y][x])
            ms = int(mine['styles'][y][x])
            if rc != mc:
                char_diff += 1
                if len(rows) < 12: rows.append((y, x, repr(rc), repr(mc), rs, ms))
                if first is None: first = (y, x, repr(rc), repr(mc))
            if rs != ms:
                style_diff += 1
                if first is None: first = (y, x, 'style', rs, ms)
    ok = char_diff == 0 and style_diff == 0
    if not ok: total_bad += 1
    print(f't={t:<6} {"OK  " if ok else "DIFF"} char={char_diff} style={style_diff} {first or ""}')
    for r in rows:
        print(f'    y{r[0]} x{r[1]} ref={r[2]} mine={r[3]} (st {r[4]}/{r[5]})')
print('---')
print('ALL MATCH' if total_bad == 0 else f'{total_bad} frame(s) differ')
