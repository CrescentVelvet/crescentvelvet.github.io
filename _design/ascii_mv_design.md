# 字符演歌（ASCII MV）编排设计规格

> 逆向对象：`https://github.com/yym8224961/world.execute-me-ascii`（main，2026-10）
> 逆向方式：通读 `player.py`(322 行) 全文 + `scenes.py`(3074 行 / 59 个函数) 的调度层与 6 个代表场景
> 原始载体：Python + 终端 ANSI（macOS 独占）
> **本规格目标载体：浏览器（页面内播放，canvas 字符网格）**
> 参考素材本地副本：`C:\code\ascii-mv\ref\`（他人源码与截图，**不入库**）

---

## 0. 结论先行：它的"精细"到底是什么

不是笔画更细，是**每一格字符都被分配了角色**。三层证据：

| 证据 | 数值 |
|---|---|
| 场景函数 | 59 个 `def`，其中 36 个 `lyric_*` 逐句专属；平均 **52 行/场景** |
| 绘制调用 | `c.put()` 297 次、`c.center()` 93 次、`c.line()` 35 次、`c.box()` 18 次、`c.big()` 10 次 |
| 编排变量 | `progress` 113 处、`phase` 130 处、`clamp(` 54 处、`hash16(` **121 处** |
| 全局后处理 | `glitch` 相关 25 处，另有 `phosphor()` 扫描线 |

`hash16` 用了 121 次是关键信号：**所有"随机"都是确定性伪随机**（同一 t 渲染结果可复现），所以噪点会像纹理一样稳定地抖动，而不是每帧重掷导致雪花点乱炸。这是视觉质感的来源，也是能出静帧截图的前提。

初版失败的根因就在这：**只画了"一句话"，没有画"一整套系统"**——没有背景层、没有深度分层、没有阶段递进、没有伴随文字。

---

## 1. 版面契约（最该直接照搬的部分）

`player.py:126-179` 的 `render()` 把屏幕切成固定的带，**场景永远不能越界**（`c.clip=(top,bottom)`，`Canvas.put` 在 `player.py:70` 强制裁剪）。

设画布 `w × h` 格（终端渲染时传 `w-1`，见 §10）：

| 行 | 内容 | 颜色 |
|---|---|---|
| `y=0` | 左：标题　右：`00:52.4 / 03:32  RUNNING` | 左 BRIGHT、右 DIM |
| `y=1` | `'-' * (w-4)` 分隔线，从 `x=2` 起 | DIM |
| `y=2` | 章节名 `01 / CREATION` | NORMAL |
| `y=4 … h-8` | **场景画布**（`top=4`, `bottom=h-8`） | 场景自定 |
| `y=h-6` | 频谱条，居中 80 列，字符 `._:=\|` 五级 | DIM |
| `y=h-5, h-4` | 英文字幕，最多 2 行 | WHITE |
| `y=h-3, h-2` | 中文字幕，最多 2 行 | BRIGHT |
| `y=h-1` | 操作提示 | DIM |

三条隐含规则，全是踩过坑的痕迹：

1. **每种语言固定预留 2 行**（`player.py:167` 原注释：*Two reserved lines per language prevent changes in caption position*）——字幕长短变化时位置不跳，这是"专业感"的一半。
2. **中文比英文更亮**（中文 BRIGHT 亮黄，英文 WHITE 近白）：中文是母语读者的主阅读对象，层级不能反。
3. **间奏不留白**：`cue()` 在句间返回 `None`，此时显示 `[ instrumental ] / [ 间奏 ]`（`player.py:173-174`）。空白 = 掉帧感。

---

## 2. 网页承载层（终端 → 浏览器映射）

这一节是原作品没有的，换到浏览器后**必须重做的部分**。

### 2.1 渲染：canvas 字符网格 + DOM 字幕双层

| 方案 | 结论 |
|---|---|
| `<span>` 逐格 DOM | ✗ 120×40 = 4800 节点，60fps 布局必崩 |
| `canvas` + 逐格 `fillText` | △ 可用，但 4800 次 `fillText` 会吃满 CPU |
| **`canvas` + 字符图集（atlas）** | ✓ 预渲染「字符 × 颜色」小图到 offscreen canvas，帧内只做 `drawImage` |

做法：
- 启动时把 7 档颜色 × 需要的 60 余个字符预渲染成图集（一格里画一次）
- 每帧清屏 → 按行遍历网格 → `drawImage(atlas, sx, sy, cw, ch, x*cw, y*ch, cw, ch)`
- 同色连续格可以合并成一次 `fillText`，作为次优路径的兜底
- **`cw`/`ch` 必须整数**，否则字符边缘发虚

**字幕不画进 canvas**，用 DOM 层叠在上面：
- 中文排版、折行、字体回退交给浏览器，不用手算 CJK 宽度
- 可选中、可无障碍
- 固定高度（每语言 2 行）防跳位

### 2.2 时钟：`AudioContext` 才是唯一真相

```js
// 暂停/恢复必须换 source node —— AudioBufferSourceNode 是一次性的
let startedAt = 0, offset = 0;
function play()  { src = ctx.createBufferSource(); src.buffer = buf;
                   src.connect(gain).connect(ctx.destination);
                   src.start(0, offset); startedAt = ctx.currentTime; }
function pause() { const t = audioTime(); src.stop(); src.disconnect();
                   offset = t; }
function audioTime() { return ctx.state === 'running' ? offset + ctx.currentTime - startedAt : offset; }
function seek(t) { const wasPlaying = ctx.state === 'running';
                   if (wasPlaying) pause(); offset = t; if (wasPlaying) play(); }
```

四条硬规则：
1. **`ctx.currentTime` 不能直接当进度**——暂停时它照样走。
2. **seek 必须走 `offset` + 重建 source**，不能改已有 source 的时间。
3. 渲染用 `requestAnimationFrame`，但**画面内容按 `audioTime()` 查表**，不按 rAF 时间戳。音频准、画面跟。
4. 首帧要 `await ctx.resume()`（浏览器自动播放策略），用一次用户手势触发（点击播放按钮）。

### 2.3 频谱：实时与预计算分工

| 用途 | 来源 |
|---|---|
| 背景律动 / 呼吸 / 脉冲 | `AnalyserNode.getByteFrequencyData()`，`fftSize=1024`，48 个对数分箱 |
| 决定"哪一拍转场" | **预计算 JSON**（离线算好随页面加载） |

原因：analyser 有 `smoothingTimeConstant` 带来的约 80–100ms 滞后，做视觉律动反而更自然，但用来定位转场会晚一拍。两者分工，别混用。

### 2.4 转场：canvas 让 §5 的三招变简单

- **源帧搬运**：上一帧 `offscreen.getContext('2d').drawImage(mainCanvas)`，再按极坐标重采样贴回。不需要像终端那样逐格搬运。
- **像素裂解**：`getImageData` 取一行带，覆盖成大字后按概率 `putImageData` 回撒。
- **粒子组装**：标题点阵预计算一次（`title_pixels()` 的等价物），每个点带 `delay` 与三次缓出，普通 2D 粒子系统即可。

### 2.5 音频文件不进仓库（版权）

站点是公开的 GitHub Pages。合规做法：

- 仓库只放**帧数据、歌词时间轴、场景表**（无版权风险）
- 音频由用户在页面里 `<input type="file" accept="audio/*">` 自选本地文件 → `decodeAudioData`
- 或者只在本地 dev 副本里放音频，`.gitignore` 排除

**这条是硬约束，不是建议。** 参考作品把 mp3 内嵌进 Release 分发，那个做法不能照搬。

---

## 3. 时间骨架：五幕 + 硬路由

`player.py:109` 的章节表就是全片的情绪弧：

```python
CHAPTERS = [(0,       '01 / CREATION',  '创建'),
            (29.709,  '02 / DEVOTION',  '献出自我'),
            (110.9,   '03 / ISOLATION', '离开'),
            (125.708, '04 / EXECUTION', '失控'),
            (177.246, '05 / LOVE',      '困于爱')]
```

章节边界**不是均匀切分**，而是踩在音乐的结构变化上（第三幕从 110.9s 起，正是 "Though you have left"）。

`scenes.py:2921` 的 `draw_scene()` 是 if/elif 硬路由表。三条路由经验：

- **一句一场景，但允许两句共用**：`lyric_lay_pieces` 覆盖 3.873–6.38（吞掉两句），`lyric_data_parameters` 覆盖 7.446–11.095（4.6 秒）。**切换太密会碎，宁可让一个画面吃两句。**
- **传给场景的是 `t - 段起点`**：场景内部只关心"本句唱了多久"，`progress = clamp(elapsed / 本段时长)`。这让每个场景函数可以独立测试。
- **器乐长段单独设计**：`lyric_illegal_arguments` 有 16 秒器乐，`progress = clamp(elapsed/16.0)`，分 4 个 4 秒阶段。

网页版改为**表驱动**（见 §9），但上面三条语义不变。

---

## 4. 场景范式（三种，换歌直接套）

### A. 阶段递进型 —— 最出彩，优先用
代表：`lyric_points_dimension`（`scenes.py:434`），歌词 "If I'm a set of points / then I will give you my DIMENSION"。

一句话拆成四个概念阶段，每阶段一套独立几何：

| 进度 | 阶段 | 机制 | 字符 |
|---|---|---|---|
| 0–25% | 0D POINTS | `count=int(phase*120)` 个散点，`hash16` 定位置 | `·` `+` `*` 三级 |
| 25–50% | 1D LINES | 随机端点连线，带 `reveal` 逐段生长（`reveal=clamp(phase*3-line_i*0.08)`，每条线错开出场） | `─` `\|` `/` 按斜率选 |
| 50–75% | 2D SURFACE | 12×12 网格 + 双正弦位移 | `█▓▒░` 四级密度 |
| 75–100% | 3D VOLUME | 8 顶点立方体，三次旋转 + 透视投影 | 按深度 `.` `=`，近处 `=` 白、远处 `:` 暗 |

配套细节（**这些才是"精细"**）：
- 每阶段底部有阶段标签 `'2D: SURFACE'`，颜色随 `phase>0.7` 由 B 升到 W —— **连标签文字都有渐强**
- 顶部常驻总进度标签 `'DIMENSIONAL PROGRESSION: 3D'`
- 3D 部分做了**隐线消除**：`style = N if avg_z<0 else B if avg_z<0.5 else W`，字符同步从 `:` → `.` → `=`
- 深度投影做了**宽高比修正**：`py = cy + y*scale/depth*1.5`（终端字符高宽比约 2:1）

可迁移到任何"递进"语义：数量→集合、暗→亮、远→近、碎片→整体。

### B. 仪表盘型 —— 用于"过程/等待/执行"
代表：`lyric_outro_wait`（`scenes.py:2732`）。

- 进度条永远停在 **99%**：`progress=min(99, int(99*(1-(1-clamp(elapsed/5))**3)))`（三次缓出，卡死）
- 扫描高光：`sweep=int(t*18)%filled`，`(col-sweep)%filled<3` 的格子换色
- 假日志：`RETRY 0004 / ACK: -- / REMAINING: 01%`、`EXIT CODE: EXECUTION`
- 旋转光标用**离散跳变** `'|/-\\'[int(t*8)%4]`，不做渐变
- 数字一律补零：`{progress:02d}%`

**"系统在做事"的感觉，八成来自这些无意义的假数据。**

### C. 数据流型 —— 用于"循环/无限/被困"
代表：`lyric_infinity_limit`（`scenes.py:789`）。

- 左右各一条 `rail` 宽的寄存器栏，滚 `2^04d` 和十六进制，每 7 行亮一档
- 主体用**双纽线**参数方程 `x=cx+rx*cos/(1+sin²)`，叠 `strand=-2..2` 五条错位丝带
- 加两圈 `scale=(.80,1.10)` 的暗色残影（模拟 CRT 余晖）
- 十几个 `@/*/.` 数据包沿曲线双向跑，带 7 段拖尾
- 中心挖空一处放 `[ME]`

---

## 5. 转场：它是"状态变换"，不是"切换"

95% 的场景之间是硬切，靠场景自身的 `elapsed` reveal（从空白长出来）就够。但有三个重手法，是全片最值钱的部分：

### 5.1 源帧搬运（`title_takeover`，`scenes.py:2796`）
把**上一帧的完整画面**当素材，按极坐标旋转 + 外扩，字符逐格被字母表替换：

```python
source = self.render(15.799, ...)   # 递归渲染前一刻
angle  = atan2((yy-cy)*2, xx-cx) + e*(1+k%7*0.13)
radius = hypot(xx-cx, (yy-cy)*2) * (1+e*0.9)
if e>.3 and k%5 < int(e*5): ch = alphabet[(k+frame)%len(alphabet)]
```
旧画面**被吸进**新标题。转场有两帧之间的连续性，不是闪断。

### 5.2 像素裂解（`lyric_outro_wait`，`scenes.py:2762`）
```python
before = [c.cells[y][:] for y in range(cy-2, cy+3)]   # 快照 5 行
clear(...); c.big(cy-2, 'EXECUTION', R)                # 画大字
if u<1:
    if hash16(x*71+dy*313)/65535 > u:                 # 概率回撒旧像素
        c.cells[cy-2+dy][x] = (before[dy][x][0], R)
```
进度条**原地碎成红色大字**。同一个位置，前一刻和后一刻是同一批像素。

### 5.3 粒子组装（`scenes.py:2889`）
标题的像素点列表（`title_pixels()`，5×5 点阵按 `(w,h)` 缓存）——
- 起点随机，终点是字里的位置
- 各自有 `delay=(k%1000)/1000*0.95` 的错峰
- 路径用三次缓出 `ease=1-(1-u)**3`
- 飞行中叠 `swirl=sin(u*pi)*(1-u)` 螺旋扰动，拖尾 `.`
- 落定后不静止：`'01'[k%2]` 闪烁，扫光 `sweep` 处换 `#`

**标题不是"显示"出来的，是"锁存"出来的。**

全片这样的重转场**只有 3 次**。密度一高就廉价。

---

## 6. 视觉语法

### 6.1 七级明暗阶梯（`player.py:12`）

| 索引 | 256 色 | 观感 | 用途 |
|---|---|---|---|
| 0 DIM | `38;5;137` | 暗橄榄 | 边框、提示、**背景噪点** |
| 1 NORMAL | `38;5;215` | 浅橙 | 次级标签 |
| 2 BRIGHT | `1;38;5;221` | 亮黄 | 中文字幕、强调 |
| 3 WHITE | `1;38;5;230` | 近白 | 英文字幕、主结构 |
| 4 RED | `1;38;5;203` | 亮红 | **仅 EXECUTION** |
| 5 G | `38;5;94` | 棕绿 | 辅助网格、残影 |
| 6 K | `38;5;58` | 暗棕 | 最底噪点 |

**色彩纪律：全片只有一个色相（琥珀磷光），红色是唯一例外且专用于"执行/死亡"。** 配色一散，MV 就变 PPT。网页版可以换成任意 hex，但阶梯数量和用法保持不变。

### 6.2 字集
- 曲线：`~ = - . ' / \ |`（按斜率选：`abs(slope)<0.3` 用 `-`，正斜 `/`，负斜 `\`）
- 密度：`█ ▓ ▒ ░`
- 点：`· + * ● @ #`
- 噪声：`0-9 A-F`（十六进制，最像"数据"）、`0 1`
- 框：`+ - |`
- 大字：5×5 点阵，`#` 填充，字间距 6 列（`player.py:89-97`）

### 6.3 深度暗示三要素
1. 字符密度（近 `=` 远 `:`）
2. 颜色明度（近 W 远 N）
3. 抖动频率（远处 `hash16` 变化更快）

---

## 7. 情绪曲线：全局累积，局部豁免

`scenes.py:18` 的 `glitch_intensity(t)` 是全片唯一的时间叙事：

```
0.05 (0-60s) → 0.25 (110s) → 0.26~1.0 (十个人为锚点阶梯上升) → 1.0 (177.2s 后)
```
锚点对的是"离别"那几句歌词的时间（110.9 / 112.22 / 113.1 / 114.18 …），原注释写得很直白：

> *Each departure accumulates damage; later execution never resets it.*

**画面损伤只累积、不恢复**——这是"叙事"，不是"特效"。

两处**豁免**（`scenes.py:3058`）：`74.045≤t<85.078`（温柔段）和 `103.489≤t<110.9`（vibration 段）不加 glitch，`192.5` 之后彻底静止。

`phosphor()`（`scenes.py:3060`）同理：扫描线出现概率 `hash16(int(t*10))%100 < intensity*50`，只把低频等级的字符提亮一档，模拟余晖。

**换歌时先画一条情绪曲线，再写场景。** 顺序反了，36 个场景会变成 36 个平行小品。

---

## 8. 数据管线

```
lyrics.json  [{"time":0.1,"end":1.74,"en":"Switch on the power line","zh":"接通电源"}, ...]
             精度 0.001s，逐句。end 用于判断"是否正在唱"，句间 → 间奏态
spectrum.json {"fps":30,"bands":48,"frames":[[48 个 0-1 浮点] × N]}   393KB
config.json  {"audio":"media/song.mp3","duration":211.906667,"subtitle_offset":0.0}
```

- `pulse = sum(spec[:10])/10` —— **只取前 10 个低频段**做场景脉冲（`player.py:151`）。低频才是心跳，高频只配做频谱条。
- `energy(t) = frames[int(t*fps)]` 按音频时钟索引，不按 wall clock。
- 频谱条把 48 band 映射到 80 列：`amp=spec[int(i*48/cols)]`，字符 `._:=|`。
- 词级时间戳内嵌在场景里（`scenes.py:2156` 的 `cues=((158.9,'EIN'),(159.321,'DOS'),...)`，间隔 0.3–0.5s）——**一句歌词里有多个词单独发音时，必须下沉到词级。**

网页版：`spectrum.json` 393KB 可压成 `Uint8Array` 的 base64 或直接 `fetch` JSON（gzip 后约 60KB）。

---

## 9. 照搬 / 要改

### 照搬（已验证有效）
- 版面契约（§1）与"每种语言固定 2 行"
- 七级明暗 + 单色相纪律
- `hash16` 确定性伪随机
- 场景内 `progress = clamp(elapsed/本段时长)` 的独立时间轴
- 一句一场景、允许两句共用
- 情绪曲线先行、转场用状态变换
- 静帧导出能力（原作品 `--snapshot <t>`，网页版做成 `?t=52.4` 参数）—— **调试命脉**

### 要改（它的短板）
| 问题 | 它的做法 | 我的做法 |
|---|---|---|
| 平台 | `os.open('/dev/tty')`、`termios`、Swift `audio-clock`，macOS 独占 | 浏览器 + `AudioContext`，全平台 |
| 路由 | 3074 行 if/elif 树，改一段要翻 200 行 | `scenes.json` 表驱动：`[{t0,t1,fn,params}]` |
| 字幕对齐 | 逐句 0.001s 人肉对齐 | 音频起音检测出初稿 + 局部修正 |
| 中文宽度 | `unicodedata.east_asian_width` 判 W/F，手算列宽 | 字幕走 DOM，浏览器排版 |
| 文件组织 | 单文件 3074 行 | 按场景族拆模块 + 注册表 |
| 分发 | 每个终端尺寸都要重排 | 自适应网格（列数由画布宽度和字号算出），加最小尺寸保护 |

---

## 10. 坑（终端时代 + 网页对应）

1. **渲染时传 `w-1`**（`player.py:260`）：原注释 *Leave the last column unused. This avoids terminal autowrap artifacts.*
   → 网页版无自动换行问题，但**画布宽高要是 `cw`/`ch` 的整数倍**，否则最后一列被裁半。
2. **尺寸从 stdin fd 取**（`player.py:256`），因为 shell 的 `COLUMNS/LINES` 全屏后会过期。
   → 网页版用 `ResizeObserver`，不要用 `window.innerWidth`（含滚动条）。
3. **CJK 占两格，第二格存空串**（`player.py:76`）。
   → 网页字幕走 DOM 后此坑消失；但若 canvas 里要画中文，仍需 `measureText` 或固定双宽假设。
4. **最小 64×24**，不足时整屏显示提示而非硬画（`player.py:128`）。
   → 网页版：`cols < 64 || rows < 24` 时降级为"请放大窗口"提示层。
5. **音频时钟 2 秒不更新就报错退出**（`player.py:249`）：宁可崩，不要挂着不动。
   → 网页版：`audioTime()` 与 `rAF` 时间戳偏差超过 500ms 判定失步，重同步。
6. **只在情绪豁免区间外施加 glitch**（`scenes.py:3058`）。
7. **终端交替屏**（`player.py:240,299`）：进入 `\x1b[?1049h`，退出恢复。
   → 网页版无对应，但要处理页面切换标签页时 `rAF` 暂停 → 回来时按 `audioTime()` 重新定位，不要累积跳帧。
8. **`clip` 裁剪必须包住场景绘制**（`player.py:152,156`），否则场景画到字幕区。
   → 网页版用 `ctx.save() / ctx.beginPath(); ctx.rect(...); ctx.clip() / ctx.restore()`。

---

## 11. 单帧自检表（画完一帧必过）

对着截图逐条问，任何一条"否"就回去补：

- [ ] 背景层有没有东西？（噪点/网格/残影，不能是纯黑）
- [ ] 主体有没有**至少两档**深度或明度区分？
- [ ] 有没有**正在发生**的动势？（相位、脉冲、生长方向）
- [ ] 顶部有没有状态行/进度标签？
- [ ] 底部有没有一行"系统日志"式的假数据？
- [ ] 画面里有没有一个**非几何**的语义锚点？（`[ME]`、`EXIT CODE`、`YOU.LIMIT`）
- [ ] 空白占比是否 < 30%？
- [ ] 所有颜色是否都在同一色相族内（红除外）？
- [ ] 中文/英文字幕位置是否固定、不随文字长短跳动？

---

## 12. 换歌时的执行顺序

1. 拿到音频 → 算 `duration`、`spectrum.json`（fps 24/30、48 band）
2. 拿到歌词 → 逐句 `{time, end, en, zh}`；重复段（副歌）**每条独立时间戳**
3. 画**情绪曲线**：哪几段冷、哪几段炸、哪段彻底静止
4. 切**五幕**（或四幕/三幕），边界踩在编曲结构变化上
5. 逐句分配场景范式（A 递进 / B 仪表盘 / C 数据流），**两句可共用一个场景**
6. 标出 2–3 个"重转场"位置，全片不超过 3 次
7. 先做骨架版（每场景 20–30 行）跑通全片，再逐段加密
8. 每段完成出静帧（`?t=秒`），过 §11 自检表
