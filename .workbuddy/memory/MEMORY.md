# 项目长期记忆

> 只留「硬约束 + 已定案」。过程与教训在 `.workbuddy/memory/YYYY-MM-DD.md`。
> 2026-09-20 精简过一轮；精简前全文 = `git show a36eb57:.workbuddy/memory/MEMORY.md`。

## 通用约定
- commit 前缀 = 子网页名（`日志时间轴: ` / `高斯对比: ` / `主页: `），**须与当日 memory 日志同一提交**；中文，一行标题 + ≤2 行正文。**AI 不得 push**。
- 只 `git add` 明确路径，**禁止 `git add -A`**（`assets/data/todo_list.json` 长期脏）。
- **同一文件禁止在同一条消息里并发多个 Edit**（会互相覆盖）；串行改，改完 Grep 确认。
- 托管 Node：`C:/Users/wangyufeng/.workbuddy/binaries/node/versions/22.22.2-3/node.exe`。
- ⚠️ 本机无 coreutils（grep/head/ls/cp → 127）⇒ 用 Glob/Read/Grep/Node。⚠️ **PowerShell 工具不回传 stdout** ⇒ 让 Node 自己写文件，或 `| Set-Content <文件>` 后 Read。
- 重构 memory 文件前先确认 `git status --porcelain` 为空（`.workbuddy/memory/` 被 git 跟踪，旧版即 HEAD，不必手工留档）。

## 无头验证
- ★ 已沉淀为 skill **`cdp-browser-e2e`**（CDP 直驱系统 Edge、零 npm 依赖、含静态服务）。本机补充：Edge = `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`；`--headless --screenshot` 静默失败。
- 大文件注入 `fetch → File → DataTransfer → drop`；错误收集 `Runtime.exceptionThrown` + `Log.entryAdded`，**favicon 404 白名单**。
- ⚠️ 合成 `PointerEvent` 不被 OrbitControls 接受 ⇒ 交互必须 `Input.dispatchMouseEvent`；`mouseWheel` 对部分面板不可靠 ⇒ 走状态钩子。
- ⚠️ **断言禁「非零即过」**：拿对照实现的实测值当期望。测量前 `settle()`，oracle 与成立条件**同帧**。像素自证（`getImageData` 读关键点颜色）比截图 diff 便宜。

## 沙盘战争（_pages/sandbox_war_game.html）
- 单位是 DOM+CSS：`.unit` → `.unit-body`（`scale(var(--scale))`）→ 配件 div，两层均无 `overflow:hidden`；1 个 body 单位 = `--scale` 屏幕像素（士兵 .636 / 坦克 .611）；配件坐标相对 **padding box**。
- 地形配色跨度大 ⇒ 移动物一律**暗色轮廓**。无朝向载具 `fixedHeading=true` 生效 3 处，**保留 `isTracked=true`**。
- 回归 = CSS 括号平衡 + `node --check` + 27 单位类实例化；**改单位渲染/行为必跑 `heading_harness.js`**。

## 高斯对比（_pages/splat-compare.html）
- 库级（gaussian-splats-3d v0.4.7 + three r185）：**必须 `gpuAcceleratedSort:false`**（否则黑屏）、**必须 `antialiased:true`**（否则薄层高斯出漂移黑斑）；**变换必须放 splatGroup 级**（改 scene0 无效）。
- 朝向/变换变化须 `updateMatrixWorld(true)` + `panel.sortDirty` 补跑重排（`runSplatSort` 会静默丢弃），`tryResort` 放 `render()` 之后；渲染循环每帧 `controls.update()` + 末行 `lookAt` ⇒ **横滚恒 0**；滚轮挡 OrbitControls 必须挂**捕获阶段**；缩放抄 `getZoomScale()`；顶层标识符**别叫 `zf`**（vendor TDZ）。
- 三条定案（别回退）：① 单独调整 = 共同基准 ⊕ 私有偏移（退出即无操作、反算幂等）；② 上下翻转 = 每面板 `panel.flipped`（非全局布尔）；③ 平移广播**屏幕像素意图**(dx,dy)，世界→像素用源面板**变化前**的 `panBasis`。
- 探针 `__project` / `__debugCameras` / `__lastBroadcast` / `__mixChange` / `__flip`；回归 `unify_semantics.js` / `pan_sync.js` / `flip_panel.js` / `check_splat_compare.js`（旧 link_sync、adjust_isolation、adjust_freeze 作废）。

## 日志时间轴（_pages/diary_tree.html）
- **规格见 `_design/diary_tree_redesign.md`**（含 11 条被否决方案，改版前必读）。定案：分段堆叠柱（分母 = 全局单日最大 ×0.35）+ `k=scale/fitScale` 驱动 LOD + 原位浮层（真月历 7×6 + 当月目录）+ 单栏长文 + paper 基调 + 36px 全宽 HUD + 图例即分类筛选。
- **月相章** `drawMoonSeal()` 画月卡右上角：`stats.dayRatio` 驱动；蜜色亮面 `#e3b34e`（满月盘 `#eaba56`）朝右上 45°，覆盖率 = 双圆透镜面积二分反解 `moonSealSolveX(c)`；浮层题头 `has-moon` + `moonPhaseName(ratio)`。
- ⚠️ 中文正文字体栈**必须 ≥2 候选**（本机无 Songti SC，只写一个会静默退化）；柱顶装饰须与「分段」语义区分。
- 页面需密码解密 ⇒ dev 副本用 `.workbuddy/tmp/dev/make_dev.js`（替掉 Liquid `window.files` 块 + unlock handler 换顶层立即执行）；⚠️ CRLF 下 `indexOf('\n')` 会少吃 `\r`。

## 日志工具页（_pages/text_processor.html · enc_reader.html）
- **共享样式 = `assets/css/diary-tools.css`**（token / 控件 / 卡片 / 状态 / 内容语义色 / 响应式只此一份）；暖纸基调 `--accent #b86944` / `--bg #f7f4ee` / `--radius 20px`；页面 `<style>` 只留各自布局。
- **内容语义色唯一来源 = diary_tree 的 `categoryColor()`**：leisure `#d35f05` / dream `#8A2BE2` / video `#0056b3` / review `#0d9488` / normal `#4a90e2`。
- **四个高亮类全站只有两处定义**（`diary-tools.css` + `diary_tree` 的 `#info-popup .popup-preview`）：字重 600 / 回顾条 `3px solid` + `padding-left:6px` / 背景 `rgba(13,148,136,.10)`；**改色必须两处同改**。
- **正文规格三页统一**：宋体 16px / 行高 1.95 / 段距 8px / 首行缩进 2 字；输入输出区 520px；两页容器 1000px。共享语义类 `btn-ghost` / `btn-danger` / `panel` / `surface` / `guide`。
- ⚠️ 三个坑：① JS 里 `el.className = '...'` 整体覆写会**静默冲掉**后加的类；② 窄屏只写 `min-width:0` 会让两个 `flex:1` 挤一排，必须显式 `flex-direction:column`；③ 正文行高/段距曾被 JS 内联写死，改规格必须一并删（否则只有静态注入生效）。
- 已修：`formatSelection` 的 `createTreeWalker` 不含 root ⇒ 选区落在**单个文本节点**内时静默失效（两页补收 root）。未改：上色是节点粒度。⚠️ 未修隐患：enc_reader `oneKeyFormat()` 用游离 div 的 `innerText` 分行 ⇒ 多段可能粘成一行。
- 验证脚本在 `.workbuddy/tmp/unify/`（`verify.js` / `verify_hl.js` / `verify_body.js`）：CDP 静态服务 root = 仓库根 + `_pages/` 兜底 + 剥 front matter；`captureScreenshot` 的 `clip.scale` 必须为 1。

## 站点 crescentvelvet.github.io（Jekyll + minimal-mistakes 内联）
- 主题内联（`_config.yml` 无 `theme:`），**颜色唯一来源 = `_sass/_variables.scss`**。
- 资产引用：`href`/图片/og:image → `{{ base_path }}`；本地 CSS/JS → `{{ '...' | relative_url }}`。
- 页面 front matter 需 `author_profile: false` + `classes: wide`；`_pages/about.md` 内联代码**必须从第 0 列开始**（kramdown 缩进 = 代码块）。
- 布局底账：`#main` max-width 925px（wide 1112px）；首页卡片网格 `minmax(122px,1fr)` + `gap:18px` 绑死；**加 1px 描边要同步减 1 padding**。
- ⚠️ `main.min.js` greedy-nav：`#site-nav` 缺席 ⇒ 每次加载必栈溢出。做法：保留节点，`height:0;overflow:hidden` 折叠页头。

## 子页：论文调研（_pages/paper_retrieval.html）
- **深色阅读器**：token 抄 media_paper **报告页**的 `:root`（`#0f1419`/`#1a2029`/`#2d3748`/`#60a5fa`/`#e6edf3`），**不是**站点暖纸体系（索引页本身反而是浅色 iOS 风）。改色对着报告页 `:root` 改、两处同值。
- 结构：HUD（面包屑 + 返回/刷新/新窗口）+ 左栏 240px（搜索 + 固定「总索引」条目 + 领域分组列表，窄屏抽屉）+ iframe + 底部状态栏；`fitShell()` 按文档顶边算高，**别写死 `calc(100vh - N)`**（实测会被切 24px）。
- **目录数据源 = 解析索引页里的站内 `.html` 链接**（不用 `papers.json`——它是单页配置不是全库清单）。领域/日期/标题全从文件名 `<领域>-<YYYYMMDD>-<标题>.html` 解析，**领域名可能以数字开头（3D）**。默认落点 = 文件名日期最大者；索引页只是侧栏一个条目。
- ⚠️ 本页**不引入** `diary-tools.css`（其 body 规则会连站点页头字体一起改）⇒ 必须自己声明 `box-sizing: border-box`，否则 1px 边框叠在宽度外（侧栏实测变 241px）。
- ⚠️ **`raw.githubusercontent.com` / `cdn.jsdelivr.net` 在本机时常超时**（`api.github.com` 通），真实链路验证不可靠 ⇒ 回归走 `.workbuddy/tmp/dev/verify_mock.js`（离线 mock，30 断言；`verify_dark.js` 是联网版，网络差时会输出大面积假失败）。
