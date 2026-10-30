# 项目长期记忆

> 只留硬约束与定案；过程在 `YYYY-MM-DD.md`，旧版存档于其 10-23 末尾。

## 通用约定
- commit 前缀 = 子网页名；中文一行标题 + ≤2 行正文；**AI 不得 push**；memory 日志与改动同一提交。
- ⚠️ ascii_mv.html 网页名/前缀已改 **字符演歌**（2026-10-28 定案，URL 不变；此前已提交的 `ascii_mv:` 前缀不改）。
- 只 `git add` 明确路径，**禁止 `git add -A`**；**同文件禁同消息并发多 Edit**。
- 托管 Node：`.../node/versions/<先 ls>/node.exe`；无 coreutils ⇒ 用 Glob/Read/Grep/Node。
- ⚠️ **禁 PowerShell 管道取 git 对象/UTF-8**（cp936 乱码）：`execSync('git show …',{encoding:'utf8'})`；commit message 用 `-F <UTF-8 文件>`。
- 重构 memory 前确认 git 干净。

## 无头验证（skill `cdp-browser-e2e`）
- 错误收集必须含 `Runtime.consoleAPICalled`（shader 错误走 console.error）；favicon 404 白名单。
- 交互必须 `Input.dispatchMouseEvent`（合成 PointerEvent 无效）；断言用对照实测值。

## 高斯对比（_pages/splat-compare.html）
- 库 v0.4.7 + three r185：**`gpuAcceleratedSort:false`**（否则黑屏）、**`antialiased:false`**（true⇒侧视蓝绿雾块，10-23 定案）、**`sphericalHarmonicsDegree:3`**、**`splatSortDistanceMapPrecision:20`**、fov **60**、背景 `#222233`、变换必须放 **splatGroup 级**。
- ⚠️ vendor 本地补丁：degree 3 **16 处** + sort gate（8.11°→0.5°）**1 处** + eigen clamp（下限加在 λ2 本身）**1 处** + fdc range（DC 编码区间 [−0.5,1.5]，含 KSplat 版本 0.1→0.2）**11 处** + sh range（SH min/max 统计上界改 `splat.length`）**2 处** + sh convert（8-bit SH 出口转换 2→0/2→1）**2 处**；升级必须全部重打（`grep -c "LOCAL PATCH"` 校验）。GLSL 注释**禁反引号**。
- 朝向/变换变化须 `updateMatrixWorld(true)` + `sortDirty` 补排；每帧 `controls.update()`+`lookAt` ⇒ 横滚恒 0；滚轮拦截挂捕获阶段；顶层标识符**禁 `zf`**（vendor TDZ）。
- 释放链（10-23）：`removePanel`/`loadPlyToPanel`/加载 catch 均 `renderer.dispose()`+**`forceContextLoss()`**（否则 context 等 GC、撞 Chrome 单域 ~16 上限）；blob URL try 外创建、catch 也 revoke。⚠️ catch **禁引用 try 块内 const**（ReferenceError 静默吞清理）——一律 `panel.*`。
- 超时兜底（10-23，治上游缺陷 loadPromise 只 resolve 不 reject ⇒ 坏文件永停 loading）：`Promise.race` 默认 120s（`window.__LOAD_TIMEOUT_MS` 每次加载读，供 E2E）；超时 `abort()`+清 `panel.*`+错误 UI+重试按钮。
- 进度条：`addSplatScene` 的 `onProgress(percent,label,status)`（status 0/1/2）：Downloading=真实字节进度，Processing=「解析中…」，**Done 仅 splat 数组解析完**（finalize+建树在后）⇒「构建场景中…」不确定态。⚠️ 卡死样本用**纯文本**（ascii PLY 合法会 ready；纯文本在 delayedExecute setTimeout 抛 TypeError⇒promise 永 pending）。
- 探针 `__project/__debugCameras/__flip/__perfState/__panelState`；回归 `.workbuddy/tmp/splat_mem/e2e.js`（22 断言）。
- DC 基色（10-23）：上游把 `0.5+SH_C0·f_dc` clamp 进 [0,1] 存 uint8 ⇒ 越界信息不可逆丢失；PlayCanvas 用 **RGBA16F** + 顶点只 `max(clr,0)`。已改 8bit 区间 **[−0.5,1.5]**（精度 2/255），shader 侧 `vColor.rgb*2-0.5` 解码。⚠️ `fillSplatColorArray` 是纹理数据源，**不得解码**（解两次 ⇒ 对比度爆炸、满屏青品红，踩过）；`getSplatColor` 同理只返回编码值。

## 算法框图（flow_chart.html）
- line-art：无衬线标注（中文 ≥2 候选）、白底 1px、颜色仅 10% 淡染、线稿默认；测量字体=渲染字体。探针 `window.__flow`。

## 沙盘战争（sandbox_war_game.html）
- DOM+CSS 单位两层均无 overflow:hidden；移动物一律暗色轮廓；改单位渲染必跑 `heading_harness.js`。

## 日志时间轴（diary_tree.html）
- 规格必读 `_design/diary_tree_redesign.md`；月相章 `drawMoonSeal()` 蜜色 `#e3b34e`；中文字体栈 ≥2 候选；dev 副本 `make_dev.js`。

## 日志工具页（text_processor.html · enc_reader.html）
- 共享样式唯一来源 `assets/css/diary-tools.css`；语义色唯一来源 diary_tree `categoryColor()`（高亮类两处定义，**改色两处同改**）；正文宋体 16px/行高 1.95/段距 8px/缩进 2 字。

## 待办清单（todo_list.html）
- 四态含 dropped（仅叶子可逆、空心虚线）；父节点无状态。密文 `assets/data/todo_list.enc`，明文不进 git；权威迁移 `tools/encrypt_todo.js`；回归 `todo_enc_e2e.js`。⚠️ 取 `.bubble`/`.lbl` 必须 `:scope >`。

## 站点（Jekyll + minimal-mistakes 内联）
- 颜色唯一来源 `_sass/_variables.scss`；本地资源 `relative_url`；front matter `author_profile: false`+`classes: wide`；about.md 内联代码从第 0 列起；`#site-nav` 必须保留（折叠），否则 greedy-nav 栈溢出。
- ⚠️ **本机 Ruby 3.4.10 装在 `D:\Ruby34-x64`，被 Windows 智能应用控制（SAC，`VerifiedAndReputablePolicyState=1`）按「完整路径」误拦部分 `.so`** ⇒ `[BUG] vm_call_super` / `WinError 4551`，Jekyll 起不来。**症状会伪装成别的错**（如 `etc.so` 被拦报「tzinfo 未安装」）。修复跑 `tools/fix_sac_blocked_ruby.py`（原地重建文件即可解除，无需重装/改注册表）；排查用 `ctypes.WinDLL` 逐个试加载 + 查 CodeIntegrity/Operational 日志。`chcp 65001` 无效。

## 字符演歌（ascii_mv.html，全曲已移植完毕 0–211.933s，2026-10-29）
- ⚠️ **必须 `layout: null` 独立页**：站点默认链 default→compress（jekyll-compress-html
  只保护 pre）会把内联脚本换行压平 ⇒ `//` 行注释吞掉全部后续 JS ⇒ 线上整页 JS 静默全灭
  （2026-10-29 之前本页一直如此）。**全站 app 页（text_processor/splat-compare/diary_tree…）
  都用 layout: null**，新 app 页照抄。
- ⚠️ 核对线上必须验「脚本可执行」（`window.__amv` 探针），grep 源码内容一致不算数；
  本地 E2E 跑的是未压缩 HTML，通过 ≠ 线上可用。
- `hidden` 属性会被作者样式 `display:flex` 覆盖 ⇒ 需显式 `.amv-load[hidden]{display:none}`。
- 数据走 jsDelivr 镜像优先（github.io 本机 ~10KB/s）、同源兜底、15s 无字节进展看门狗切换。
- **再做一首/移植另一部 ASCII MV 必先读两份指南**：`_design/ascii_mv_porting_guide.md`
  （有官方 pyz 参考 → 全帧 0.0% 对拍流程）+ `_design/ascii_mv_authoring_guide.md`
  （无参考自己写 → lyrics.js/spectrum.js 构建、分段、场景美学公式）。
- 工具链入库 `tools/ascii_mv/`（node_extract.js / diff_generic.py / dump_ref_template.py，
  均支持 AMV_* 环境变量换歌）；设计规格 `_design/ascii_mv_design.md`（版面契约必读）。
- 核心定案：参考帧必须 WSL/glibc 导出（UCRT 与 V8 浮点行为不同）；提取用 Node+DOM 桩
  （headless Edge 已废）；逐行移植禁「理解后重写」；随机全走 hash16 确定性伪随机。
- **多曲架构（2026-10-30 定案，作废旧指南「每歌一页」）**：单页 `?song=key`，SONGS
  注册表每歌一份配置（dur/dir/chrome/scenes/chapters…），新歌曲=注册表加项+前缀场景
  函数+`assets/data/ascii_mv/<key>/` 数据+页头 button；歌相关禁再硬编码全局常量。
  第二首《Link Up 血火相连》（绝区零 EP，188s）数据已备，场景按 B 站 MV BV1C9b76cEks 移植中。
- ⚠️ **场景绘制字集仅 ASCII 32–126 + EXTRA 符号，无中文**（centerW('中文') 渲染成 '?'）：
  中文只能走 DOM 字幕层；'◎' 也不在 EXTRA（用 '◉'）。B 站截帧 shot_mv.js v2：
  video position:fixed 拽出容器铺满视口+白名单 display:none（body visibility:hidden 会白屏；
  顶栏 z-index 压过 fixed 视频只能 display:none；#app>div:not 宽匹配会误杀播放器祖先）。

## 论文调研（paper_retrieval.html）
- 深色 token 抄 media_paper 报告页，**不引入 diary-tools.css**，自声明 box-sizing；隐藏 `#page-last-modified`；目录解析自索引页链接；镜像 raw→jsdelivr 单试 8s。
