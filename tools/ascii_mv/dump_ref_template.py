# -*- coding: utf-8 -*-
"""参考帧导出模板：从原作（pyz 解包目录）导出 plain+styles 定宽数组参考帧。

⚠️ 必须在 WSL/glibc 下运行（Windows UCRT 的浮点行为与目标浏览器 V8 不同，
   mesh 类 3D 场景会在 ~1ULP 深度竞争处翻转赢家——见移植指南「平台 ULP 噪声」一节）。

用法：
  1. 把原作 pyz 解包到本脚本同目录下的 pyz/（含 player.py，**不入库**）
  2. 改 PYZ / TS / dest 三处
  3. wsl -d Ubuntu2404 -- bash -lc "cd /mnt/c/.../ref && python3 dump_ref_template.py"
"""
import json, sys
from pathlib import Path
# player.py 在 Windows 下 import 会因 termios/tty 崩，预占位
sys.modules.setdefault('termios', type(sys)('termios'))
sys.modules.setdefault('tty', type(sys)('tty'))
PYZ = Path(__file__).resolve().parent / 'pyz'
sys.path.insert(0, str(PYZ))
sys.dont_write_bytecode = True
import player  # noqa: E402

TS = [0.0, 1.0]  # ← 按场景段内时间点 + 段内边界起点填；下段起点不验（属下段）

film = player.Film()
out = []
for t in TS:
    # render(t, 宽, 高, paused=True) —— 尺寸/暂停态须与网页侧 __amv.frameAt 约定一致
    c = film.render(t, 120, 40, True)
    plain = [''.join(ch if ch else ' ' for ch, _ in row) for row in c.cells]
    styles = []
    for row in c.cells:
        styles.append(''.join(str(st) for _, st in row))
    out.append({'t': t, 'w': c.w, 'h': c.h, 'plain': plain, 'styles': styles})
    print('t=%-7s ok' % t, file=sys.stderr)
dest = Path(__file__).resolve().parent / 'frames_ref_SEGMENT.json'  # ← 改名
dest.write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
print('written', dest, dest.stat().st_size, file=sys.stderr)
