# 字符演歌移植指南（有官方参考）

> 目标：把一部已有 Python 终端 ASCII MV（pyz 解包的 `player.py`/`scenes.py`）
> 逐场景移植到网页播放器，做到**全帧字符+色号 0.0% 逐格一致**。
> 本指南由 world.execute(me); 的完整移植（0–211.933s，2026-10-28/29）蒸馏而成，
> 配套设计规格见 `ascii_mv_design.md`（版面契约/渲染/数据格式必读）。
> 工具链：`tools/ascii_mv/`（node_extract.js、diff_generic.py、dump_ref_template.py）。

---

## 0. 总工作流（每段循环）

```
读原作场景源码（通读，禁止照抄大意）
  → 逐行移植到 _pages/ascii_mv.html（保持计算表达式形态）
  → WSL/glibc 导出参考帧（dump_ref_template.py 改 TS/dest）
  → 等 Jekyll 重建（grep 构建产物确认生效！）
  → node_extract.js 逐帧提取网页网格
  → diff_generic.py 全帧对比至 0.0%
  → diff_regress 回归 + 相邻段边界抽查
  → 更新当日 memory 日志 → commit（前缀「字符演歌: 」）
```

**一段未全绿前不推进下一段。** 每段覆盖：段内均匀时间点 + 全部状态切换点
（progress/phase 边界、歌词 cue 切换、stage 分支边界）+ **段内边界起点**
（下段起点不验——那是下段的起点帧）。

## 1. 参考帧与提取链（最容易踩坑的环节）

1. **参考帧必须在 WSL/glibc 下导出**。Windows UCRT 与浏览器 V8 的浮点行为不同，
   mesh 类 3D 场景会在 z 最近面竞争（~1ULP 间距）处翻转赢家。V8≈glibc
   （fdlibm 同源），UCRT 是异类。已验证定案：**strict `<` 深度比较 + V8 三角 +
   WSL/glibc 参考帧；mesh 段单帧 ≤6 格单步 ramp 差属 ULP 噪声预算，接受**。
2. **Jekyll 连续编辑会排队重建**，提取前必须 `grep` 构建产物（`curl` dev server
   或 `_site/` 文件）确认新代码已生效，否则拿旧版提取白对半天。
3. 提取用 `node_extract.js`（Node + DOM 桩直跑构建产物，调 `__amv.frameAt(t)`），
   **不要用 headless Edge/Chrome**——本机 Edge headless 静默秒退，已废。
4. 参考帧/提取网格一律 **plain+styles 定宽数组**格式；旧 dump 把 CJK 占位格
   `''` 跳过导致行短、x 移位，会报永远修不完的假 DIFF。
5. 参考帧 diff 报错时先怀疑链路（参考帧格式、构建未生效、提取脚本自身），
   再怀疑移植——本项目的教训比例约一半一半。

## 2. Python → JS 语义对位清单（移植偏差的全集）

每一条都实际修过，写完逐条回查：

| Python | JS | 陷阱 |
|---|---|---|
| `int(x)` 负数截断 | `Math.trunc(x)` | `Math.floor` 负值多减 1 |
| `x // y` 正数整除 | `Math.floor(x / y)` | 中心点 `(l+r)//2` ≠ `Math.round((l+r)/2)`，差 1 格 |
| `a % b`（非负结果） | `mod(a, b)` = `((a%b)+b)%b` | JS `%` 负值保号 |
| `round(x)` 银行家舍入 | 专用 `pyRound` | JS `Math.round` 是四舍五入 |
| `hash16(n)` 确定性伪随机 | 同名移植 | **所有「随机」都是确定性伪随机**，帧内帧间都要可复现 |
| CJK 双宽 put | 次格写 `''` 占位 | 宽度判断用 `cw(ch)`（east_asian_width），中心对齐按显示宽度 |
| `X if cond else Y` 三元 | 按 cond 真值方向直译 | 极易写反（火花/囚笼竖条都反过） |
| `range(a, b)` | `i <= b-1` 含头不含尾 | `range(top, bt+1)` 才是含 bt |
| 字符串切片 `s[a:b]` | `substring(a, b)` | 负数索引语义不同，原作若用到要单独处理 |
| 快照 `c.cells[y][:]` | **深拷贝** `map(cell => [cell[0],cell[1]])` | JS put 原地改 `[ch,st]` 数组，浅拷贝会跟着变 |
| `f'{n:02d}'` / `{n:04d}` | padStart | `'0'.repeat` 手拼注意长度 |

## 3. 移植方法原则

1. **逐行移植，禁止「理解后重写」**。表达式形态保持原作（连 `min`/`max` 嵌套、
   `hash16` 的种子常量 `*31+73` 之类都照抄），只改语言语法。
2. 先跑一遍自审：对照 Python 原文逐段重读自己的 JS，重点查第 2 节的表格——
   本项目约一半的偏差在自审阶段就抓掉了。
3. 差异定位法：
   - 全帧错 → 场景没挂载/没生效/分支没进；
   - 每帧固定几格 → 某表达式算错（截断/取模/种子）；
   - 特定时间点错 → 边界判定（`<` vs `<=`、cue 的 `t<end` 判定）；
   - 双端 put 追踪（Python 记行号 / JS 记 caller）+ 中间量浮点批量对拍，
     可区分「写入序列一致但结果不同」（浮点 ULP）与真移植偏差。
4. **场景以外的全局后处理也要对齐**：`applyGlitch` 排除窗口、
   `phosphor` 的 legacy 分支、`clip` 场景段裁剪、chrome/字幕/频谱——
   这些是全曲共享的，漏一个会让「场景全对但整帧有差」。
5. 字幕系统单独验：`cue()` 的 `t<end` 判定（歌词间隙显示 `⌈instrumental⌋`）、
   CJK 按显示宽度居中。这类全局代码在旧段从不触发时，偏差会潜伏很久。

## 4. 数据文件（新歌必须重做的部分）

| 文件 | 格式 | 来源 |
|---|---|---|
| `lyrics.js` | `window.__LYRICS=[{time,en,zh,end},…]` | 从原作 lyrics.json 转换（字段同名） |
| `spectrum.js` | `window.__SPECTRUM={fps:30,bands:48,frames:[[…],…]}` | 原作 pyz 内的频谱数据/或按音频重算 |

这两文件**入库**（属编排数据，量小）；原作 `scenes.py`/`player.py`/
参考帧 json **不入库**（他人代码与派生帧数据），放 `.workbuddy/tmp/`。

## 5. 提交与记忆

- commit 前缀 `字符演歌:`（本仓历史 `ascii_mv:` 不回改），中文一行标题+≤2 行正文。
- 每段完成即 commit：`git add _pages/ascii_mv.html .workbuddy/memory/当日.md`
  （**禁 `git add -A`**），memory 日志与改动同提交。
- AI 不 push（用户手动）。
