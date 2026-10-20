# 项目长期记忆

> 只留「硬约束 + 已定案」。过程与教训在 `.workbuddy/memory/YYYY-MM-DD.md`。
> 2026-10-20 精简过一轮；之前各版全文见 `git log -- .workbuddy/memory/MEMORY.md`。

## 通用约定
- commit 前缀 = 子网页名（`日志时间轴: ` / `高斯对比: ` / `主页: `），**须与当日 memory 日志同一提交**；中文，一行标题 + ≤2 行正文。**AI 不得 push**。
- 只 `git add` 明确路径，**禁止 `git add -A`**（`assets/data/todo_list.json` 长期脏）。
- **同一文件禁止在同一条消息里并发多个 Edit**（互相覆盖）；串行改，改完 Grep 确认。
- 托管 Node：`.../node/versions/22.22.2-6/node.exe`（版本号会变，先 `ls .../versions/`）。
- ⚠️ 本机无 coreutils（grep/head/ls/cp → 127）⇒ 用 Glob/Read/Grep/Node。⚠️ **PowerShell 工具不回传 stdout** ⇒ 让 Node 写文件再 Read。⚠️ **取 git 对象/任何 UTF-8 内容禁止经 PowerShell 管道**（cp936 解码再重编码 ⇒ 中文全乱）：一律 `execSync('git show …',{encoding:'utf8'})`；commit message 用 `-F <UTF-8 文件>`（PS `-Encoding UTF8` 会加 BOM）。
- 重构 memory 文件前先确认 `git status --porcelain` 为空（`.workbuddy/memory/` 被 git 跟踪，旧版即 HEAD）。

## 无头验证
- ★ 已沉淀为 skill **`cdp-browser-e2e`**（CDP 直驱系统 Edge、零 npm 依赖、含静态服务）。Edge = `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`；`--headless --screenshot` 静默失败 ⇒ 用 `Page.captureScreenshot`。
- 大文件注入 `fetch → File → DataTransfer → drop`；错误收集 `Runtime.exceptionThrown` + `Log.entryAdded` + **必须加 `Runtime.consoleAPICalled`**，**favicon 404 白名单**。⚠️ three.js shader 错误走 `console.error`、**不进 `Log.entryAdded`** —— 只听后者会得到「零异常」假通过。
- ⚠️ 合成 `PointerEvent` 不被 OrbitControls 接受 ⇒ 交互必须 `Input.dispatchMouseEvent`；`mouseWheel` 对部分面板不可靠 ⇒ 走状态钩子。
- ⚠️ **断言禁「非零即过」**：拿对照实现的实测值当期望；测量前 `settle()`，oracle 与成立条件**同帧**。像素自证（`getImageData`）比截图 diff 便宜。

## 算法框图（_pages/flow_chart.html）
- 风格按 paper-framework-figure-studio-pro v3.2.15f 规范：line-art schematic——标注**无衬线**（中文 ≥2 候选）、白底 1px 细线、**颜色只作 10% 淡染的亮度冗余编码、语义由形状承载**、线稿默认（`btn-ink` 切彩色描边）。
- 画布与导出共用真值源常量 `FIG_FONT/FIG_INK/FIG_LINE/FIG_TINT`；⚠️ **测量字体必须与渲染字体一致**（改 `--font-fig` 必同步 `getTextMeasureCtx()`），否则换行错判文字溢出。
- 数据模型 `state.nodes/conns/groups` + `capNo/capText` + `inkMode`；分组 = containment 细实线边界 + `(A)/(B)/(C)`（GROUP_PAD 20）；`runSpecCheck()` 7 条门禁进右侧面板。
- ⚠️ `add-group` 每次按下画布都新建分组，改尺寸/移动前先切回 `select`。连线 = 正交 elbow（STUB 18 / R 6）；节点吸附 24px（Alt 微调）。探针 `window.__flow`；回归 `.workbuddy/tmp/paperify/verify_spec.js`+`_part2.js`+`raster.js`。
- ⚠️ 响应被截断 ≠ 改动未落盘：续作前先 `git status --porcelain` + diff 摸清真实基线。

## 沙盘战争（_pages/sandbox_war_game.html）
- 单位是 DOM+CSS：`.unit` → `.unit-body`（`scale(var(--scale))`）→ 配件 div，两层均无 `overflow:hidden`；1 个 body 单位 = `--scale` 屏幕像素（士兵 .636 / 坦克 .611）；配件坐标相对 **padding box**。
- 地形配色跨度大 ⇒ 移动物一律**暗色轮廓**。无朝向载具 `fixedHeading=true` 生效 3 处，**保留 `isTracked=true`**。
- 回归 = CSS 括号平衡 + `node --check` + 27 单位类实例化；**改单位渲染/行为必跑 `heading_harness.js`**。

## 高斯对比（_pages/splat-compare.html）
- 库级（gaussian-splats-3d v0.4.7 + three r185）：**必须 `gpuAcceleratedSort:false`**（否则黑屏）、**`antialiased:true`**、**`sphericalHarmonicsDegree:3`**（0 = 丢视角相关色；band3 占 SH 能量 54.68%、色差 RMS 9.7%，代价 +1.6s/百万 splat、+48MB）；**变换必须放 splatGroup 级**（改 scene0 无效）。
- ⚠️ **degree 3 靠本地补丁**（上游 shader 只有 degree 1/2）：**15 处 `LOCAL PATCH (degree 3)`**（`grep -c` 应为 15），7 个逻辑点：`decode…SectionHeader`（补 `>=15 → 3`，最隐蔽）/ `INRIAV1PlyParser` 两路径 / `fillSphericalHarmonicsArray` / **`writeSplatDataToSectionBuffer` 两分支**（最易漏：buffer 按 45 分配但后段不写、零报错）/ GLSL（`SH_C3`+`sh9..15`+采样，须用 `maxSphericalHarmonicsDegree>=3` 编译期开关包住并留在 degree-2 作用域内）/ 纹理打包（45→**48**，不是 46）。**升级 vendor 必须全部重新应用**。
- 相机 **fov = 60**（峰哥 2026-10-20 拍板，故意不跟 SuperSplat 默认 85）。
- **`splatSortDistanceMapPrecision: 20`**（默认 16）+ **重排门限补丁**（`LOCAL PATCH (sort gate)`：上游 `angleDiff<=0.99`=8.11° → `0.9999619`=0.5°；SuperSplat 是 eps 0.001≈0.06°）。二者分别是「随视角漂移的黑斑/白点」与「每 8° 跳一下」的根因。
- **为什么是 20、为什么不学密度分位**（2026-10-20 量化定案，`.workbuddy/tmp/sortkv.js` 可复跑）：PlayCanvas 也是 `Math.min(20, round(log2(n/4)))`，**20 是双方共同上限**；712k splat 时它用 17 bit（131k 桶），本库 20 = 1.05M 桶（8 倍）。实测「桶内深度跨度/splat 尺度」：均匀 16 = 0.574、17 = 0.281、**20 = 0.030**、canvas 17 分位 = 0.059 ⇒ **20 均匀比 SuperSplat 实际配置细一倍**。⚠️ 本库排序在 **WASM 二进制**里（`sortIndexes`，无 C 源码），JS 只能传 `1<<precision` 一个标量，**做不了直方图分位**，要做得弃用 vendor 排序自己写。⚠️ 未来 4M+ splat 时 canvas 会自动升到 19–20 bit，本库被钳死 20 ⇒ 差距那时才显出来。
- ⚠️ 复现「远/中景才有」的渲染问题：**先把相机拉到用户实际观察距离**（脸 ~120px，d≈1.2）再测。近景 d≤0.55 时 splat 投影大、深度分布陡，量化误差打不乱可见顺序，**A/B diff 恒为 0**（本轮因此在错误候选上多绕很久）。
- **渲染参数基线 = SuperSplat 默认值**：`antialias:false / depth:false / stencil:false / powerPreference:'high-performance'`、`NoToneMapping + exposure 1`、fov 85（本页取 60）、`far 1000`、`halfPrecisionCovariancesOnGPU:false`、`setPixelRatio(devicePixelRatio)`。**故意不一致**：背景 `#222233`（纯黑糊掉暗部，峰哥拍板）。**库硬限**：SH bands 3→2、WebGPU→WebGL2、无 stochastic alpha。⚠️ `fitAllToFirst` 的固定距离 4 是按 fov 65 调的。
- 朝向/变换变化须 `updateMatrixWorld(true)` + `panel.sortDirty` 补跑重排（`runSplatSort` 会静默丢弃），`tryResort` 放 `render()` 之后；每帧 `controls.update()` + 末行 `lookAt` ⇒ **横滚恒 0**；滚轮挡 OrbitControls 必须挂**捕获阶段**；缩放抄 `getZoomScale()`；顶层标识符**别叫 `zf`**（vendor TDZ）。
- 三条定案：① 单独调整 = 共同基准 ⊕ 私有偏移（退出即无操作、反算幂等）；② 上下翻转 = 每面板 `panel.flipped`；③ 平移广播**屏幕像素意图**(dx,dy)，世界→像素用源面板**变化前**的 `panBasis`。
- 探针 `__project` / `__debugCameras` / `__lastBroadcast` / `__mixChange` / `__flip` / `__perfState`；回归 `unify_semantics.js` / `pan_sync.js` / `flip_panel.js` / `check_splat_compare.js`。

## 日志时间轴（_pages/diary_tree.html）
- **规格见 `_design/diary_tree_redesign.md`**（含 11 条被否决方案，改版前必读）。定案：分段堆叠柱（分母 = 全局单日最大 ×0.35）+ `k=scale/fitScale` 驱动 LOD + 原位浮层（真月历 7×6 + 当月目录）+ 单栏长文 + paper 基调 + 36px 全宽 HUD + 图例即分类筛选。
- **月相章** `drawMoonSeal()`：`stats.dayRatio` 驱动；蜜色 `#e3b34e`（满月盘 `#eaba56`）朝右上 45°，覆盖率 = 双圆透镜面积二分反解 `moonSealSolveX(c)`；浮层题头 `has-moon` + `moonPhaseName(ratio)`。
- ⚠️ 中文正文字体栈**必须 ≥2 候选**（本机无 Songti SC，只写一个会静默退化）。页面需密码解密 ⇒ dev 副本用 `.workbuddy/tmp/dev/make_dev.js`；⚠️ CRLF 下 `indexOf('\n')` 会少吃 `\r`。

## 日志工具页（_pages/text_processor.html · enc_reader.html）
- **共享样式 = `assets/css/diary-tools.css`**（token / 控件 / 卡片 / 状态 / 语义色 / 响应式只此一份）；暖纸 `--accent #b86944` / `--bg #f7f4ee` / `--radius 20px`；页面 `<style>` 只留布局。
- **语义色唯一来源 = diary_tree 的 `categoryColor()`**：leisure `#d35f05` / dream `#8A2BE2` / video `#0056b3` / review `#0d9488` / normal `#4a90e2`。**四个高亮类全站只有两处定义**（`diary-tools.css` + diary_tree 的 `#info-popup .popup-preview`）：字重 600 / 回顾条 `3px solid`+`padding-left:6px` / 背景 `rgba(13,148,136,.10)`；**改色必须两处同改**。
- **正文规格三页统一**：宋体 16px / 行高 1.95 / 段距 8px / 首行缩进 2 字；输入输出区 520px；容器 1000px。语义类 `btn-ghost`/`btn-danger`/`panel`/`surface`/`guide`。
- ⚠️ 三坑：① JS 里 `el.className='...'` 整体覆写会**静默冲掉**后加的类；② 窄屏只写 `min-width:0` 会让两个 `flex:1` 挤一排，必须显式 `flex-direction:column`；③ 正文行高/段距曾被 JS 内联写死，改规格必须一并删。
- 已修 `formatSelection` 的 `createTreeWalker` 不含 root（选区落在单个文本节点内会静默失效）。未修：上色是节点粒度；enc_reader `oneKeyFormat()` 用游离 div 的 `innerText` 分行 ⇒ 多段可能粘成一行。验证脚本 `.workbuddy/tmp/unify/`（`clip.scale` 必须为 1）。

## 待办清单（_pages/todo_list.html）
- **四态** `todo`/`doing`/`done`/`dropped`（已放弃，**仅叶子、可逆**）。dropped 用**空心虚线**而非色相 —— 红绿对色盲不友好，紫会撞父节点渐变。**父节点仍无状态**（父子联动未定义）。
- 加密复用 `assets/js/diary-crypto.js` + 同一个 `assets/data/key.envelope`；密文 `assets/data/todo_list.enc`（单行 `DIARYENC1:iv:ct`），明文 `todo_list.json` **不进 git**。`boot()`：`.enc` 200 → 锁屏（`body.locked`，**解锁前 DOM 无任务文本**）；404 → 回退明文 + 警示条，**该 404 是设计信号，回归须放行**。明文模式**故意不加锁**（内容本已公网可读，加锁 = 安全剧场）。
- ⚠️ 页面「加密迁移」导的是**页面渲染的数据**，可能落后 ⇒ 权威迁移走 `tools/encrypt_todo.js`（读磁盘 + 解密回读逐字自校验；路径可用 `TODO_ENVELOPE`/`TODO_PLAIN`/`TODO_ENC_OUT` 覆盖；非 TTY 从管道读口令）。
- 回归：`.workbuddy/tmp/todo_enc_e2e.js`（27 断言，canary 数据）/ `test_encrypt_tool.js` / `check_enc_file.js`（提交前跑）/ `verify_commit.js`。⚠️ 测前须 `Network.setBlockedURLs` 断 Google Fonts，否则 `readyState` 卡 loading 造成「零异常」假通过。
- 未清理：git 历史中的明文（峰哥选「只保护未来」）。
- **交互**：面板可收成胶囊 `localStorage['todo.panel.collapsed']`（340→116px）；节点快捷键（`1-4` 状态 / `Tab` 加子节点 / `Enter`·`F2` 改名 / `Del` 删 / `空格` 折叠 / `Esc` / `P` 切面板 / `Ctrl+Z` 撤销，快照栈 50）；右键菜单**视图变换即关闭**；双击就地改名（`viewLocked`）。⚠️ `typing` 判断**绝不能含 BUTTON**。⚠️ 取 `.bubble`/`.lbl` **必须用 `:scope >`**（`renderNode` 先渲染子树，后代查询会命中子节点，曾导致输入框偏 1141px）。撤销重建后**不调 `fitView`**。

## 站点 crescentvelvet.github.io（Jekyll + minimal-mistakes 内联）
- 主题内联（`_config.yml` 无 `theme:`），**颜色唯一来源 = `_sass/_variables.scss`**。
- `href`/图片/og:image → `{{ base_path }}`；本地 CSS/JS → `{{ '...' | relative_url }}`。
- 页面 front matter 需 `author_profile: false` + `classes: wide`；`_pages/about.md` 内联代码**必须从第 0 列开始**（kramdown 缩进 = 代码块）。
- 布局底账：`#main` max-width 925px（wide 1112px）；首页卡片网格 `minmax(122px,1fr)` + `gap:18px` 绑死；**加 1px 描边要同步减 1 padding**。
- ⚠️ `main.min.js` greedy-nav：`#site-nav` 缺席 ⇒ 加载必栈溢出。做法：保留节点，`height:0;overflow:hidden` 折叠页头。

## 子页：论文调研（_pages/paper_retrieval.html）
- **深色阅读器** token 抄 media_paper **报告页**的 `:root`（`#0f1419`/`#1a2029`/`#2d3748`/`#60a5fa`/`#e6edf3`），**不是**站点暖纸体系；改色两处同值。
- 结构：HUD + 左栏 240px（搜索 + 固定「总索引」+ 领域分组，窄屏抽屉）+ iframe + 状态栏；`fitShell()` 按文档顶边算高并**铺满视口**，**别写死 `calc(100vh - N)`**（实测被切 24px）。
- **铺满整页**：`.pr-wrap` 无 `max-width`/padding、`.pr-shell` 无 border/radius/shadow。⚠️ token 定义在 `.pr-wrap` 上，**body/footer 在它外层取不到变量** ⇒ 只能写死色值并注明同源。**页头不用管**。⚠️ 本页**不引入** `diary-tools.css`（其 body 规则会改站点页头字体）⇒ 必须自己声明 `box-sizing: border-box`。
- ⚠️ 站点 `assets/js/last-updated.js` 会 fixed 一个 `#page-last-modified` 压住状态栏 ⇒ 本页隐藏该元素、文本搬进状态栏（`adoptStamp()` 须挂 `DOMContentLoaded`+`load`：页面内联脚本比 body 尾部角标脚本**先**执行）。
- **目录数据源 = 解析索引页里的站内 `.html` 链接**（不用 `papers.json`）；领域/日期/标题从文件名 `<领域>-<YYYYMMDD>-<标题>.html` 解析，**领域名可能以数字开头（3D）**。
- **镜像回退**：`MIRRORS=[raw, jsdelivr]` 依次试，单次 **8s 超时**（raw 挂掉是「连接挂起」），成功者记 `localStorage['pr-mirror-idx']`；**base href 必须随实际镜像注入**。内部一律用解码后的相对路径 `file`，URL 只在 fetch 时 `encodeURI(file)` 拼。⚠️ 本机 raw/jsdelivr 时常超时 ⇒ 回归走 `.workbuddy/tmp/dev/verify_mock.js`（离线 mock，33 断言）。
