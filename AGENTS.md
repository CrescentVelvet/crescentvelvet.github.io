# 仓库协作规范

本文件适用于 `C:\code\crescentvelvet.github.io` 及其子目录。这里是 Jekyll 站点，页面大量使用单文件 HTML、内联 CSS/JS 和本地数据。

## 开始工作前

- 先阅读本文件、`.workbuddy/memory/MEMORY.md`，再阅读与当前任务最近的 `.workbuddy/memory/YYYY-MM-DD.md`。
- 先运行 `git status --short`，确认基线和已有未提交改动；不要覆盖、回滚或顺手提交与当前任务无关的改动。
- 需要查看历史或 Git 对象中的中文时，使用 Node 的 `execSync(..., { encoding: 'utf8' })`，不要让 PowerShell 管道经过系统代码页重新解码。仓库环境没有稳定的 GNU coreutils，优先使用 `rg`、文件读取工具或 Node。

## 修改、记录与提交

- 每次修改完成后，将本次改动、验证结果和未解决事项追加到当天的 `.workbuddy/memory/YYYY-MM-DD.md`；继续使用现有 `.workbuddy/memory/`，不要新建其他日志目录。
- 代码/文档改动与对应 memory 日志必须在同一个本地 commit 中。只提交明确路径，禁止 `git add -A`，也不要把无关的 `_design`、密文明文或临时文件带入提交。
- AI 不得 push。提交前再次检查 `git status --short`、`git diff --check` 和 staged diff。
- commit message 使用中文，格式为 `子网页名: 一行标题`，正文最多两行；子网页名例如 `高斯对比`、`沙盘战争`、`日志时间轴`、`主页`。为避免 BOM 或编码损坏，优先把 UTF-8 message 写入临时文件后用 `git commit -F`。
- 同一文件在同一条消息中不要并发多个 Edit；修改后立即重新读取或检索关键片段确认实际落盘。
- 重构或压缩 memory 前必须先确认工作区干净，并保留旧记录可追溯性。

## 验证原则

- 按改动范围运行最相关的静态检查和回归脚本；不要用“某个数非零”代替真实断言。断言应使用对照实现或稳定的实测值，并在同一帧完成 oracle 与条件检查。
- 浏览器回归使用现有 CDP/E2E 工具和 `.workbuddy/tmp/` 临时脚本；临时脚本、截图和探针不应进入提交，除非任务明确要求。
- 错误收集必须同时监听 `Runtime.exceptionThrown`、`Log.entryAdded` 和 `Runtime.consoleAPICalled`；three.js shader 编译错误常走 `console.error`，只监听前两者会产生假通过。favicon 404 可按既有白名单处理。
- 真实交互使用 CDP `Input.dispatchMouseEvent` 等输入事件；合成 `PointerEvent` 不一定会被 OrbitControls 接受。测量前等待页面稳定，记录页面异常、断言数量和关键数值。
- Node 运行时使用托管版本：先列出 `.../node/versions/`，再调用其中的 `node.exe`，不要假定版本号。

## 页面和数据约定

### 站点与 Jekyll

- 主题以内联 minimal-mistakes 为主，颜色的唯一来源是 `_sass/_variables.scss`。
- 本地链接、图片和 `og:image` 使用 `{{ base_path }}`；本地 CSS/JS 使用 `relative_url`。
- 页面 front matter 默认包含 `author_profile: false` 和 `classes: wide`。`_pages/about.md` 的内联代码必须从第 0 列开始。
- 保留 `#site-nav`；若页面需要折叠页头，用 `height: 0; overflow: hidden`，不要删除它，否则 greedy-nav 可能栈溢出。
- 本机 Ruby 3.4.10 可能被 Windows SAC 按完整路径拦截 `.so`，表现为 `vm_call_super`、WinError 4551 或伪装成依赖缺失。优先使用 `bundle exec`；必要时运行 `tools/fix_sac_blocked_ruby.py`，不要关闭 SAC 或改注册表。

### 高斯对比页 `_pages/splat-compare.html`

- 基线：gaussian-splats-3d v0.4.7、three r185、`gpuAcceleratedSort: false`、`antialiased: false`、`sphericalHarmonicsDegree: 3`、`splatSortDistanceMapPrecision: 20`、FOV 60、背景 `#222233`。
- renderer 保持 `depth: false`、`stencil: false`、`antialias: false`、高性能电源偏好、`NoToneMapping`、exposure 1、设备像素比渲染；显式输出 `THREE.SRGBColorSpace`。相机 near/far 按模型包围盒动态更新。
- 变换放在 `splatGroup` 级；变换变化后调用 `updateMatrixWorld(true)` 并标记排序脏。每帧先 `controls.update()`，再 `lookAt`，保持横滚为 0；拦截滚轮时挂捕获阶段；顶层标识符不要命名为 `zf`。
- vendor 的 degree-3、sort gate、eigen clamp、DC/SH range 和 SH convert 都是本地补丁。升级 vendor 后必须重新应用并核对 `LOCAL PATCH` 标记数量；GLSL 模板注释中禁止反引号。
- 释放面板、替换模型和加载失败路径都要 dispose renderer、`forceContextLoss()` 并撤销 blob URL；catch 块不要引用 try 块内的局部常量。加载应有超时、abort、错误 UI 和重试入口。
- 保留探针 `__project`、`__debugCameras`、`__flip`、`__perfState`、`__panelState` 等及现有回归脚本；排序、内存和进度条行为改变时优先跑对应回归。

### 沙盘战争 `_pages/sandbox_war_game.html`

- 当前保持单文件。按关键词、类名和 section 边界定向读取；修改共享 token、层级、坐标、全局状态或初始化顺序时回读上下游。只有在模块频繁修改、协作冲突、依赖问题或命名空间问题出现时，才设计渐进式拆分。
- 单位结构为 `.unit` → `.unit-body` → 配件 div；两层均不得 `overflow: hidden`，配件坐标相对 padding box，移动单位使用暗色轮廓。
- 修改单位渲染或行为必须运行 CSS 括号平衡、`node --check`、单位类实例化和 `heading_harness.js` 回归。

### 算法框图 `_pages/flow_chart.html`

- 遵循 line-art：白底、1px 细线、无衬线标注且中文至少两个候选字体；颜色只作淡染冗余编码，语义由形状承载，默认线稿。
- 测量字体必须与渲染字体一致；保留 `window.__flow` 和现有规格检查探针。

### 日志时间轴 `_pages/diary_tree.html`

- 改版前先读 `_design/diary_tree_redesign.md`。月相章使用 `drawMoonSeal()` 和蜜色 `#e3b34e`；中文字体栈至少两个候选。
- 页面需要密码解密时用 `.workbuddy/tmp/dev/make_dev.js` 生成开发副本；注意 CRLF 的 `\r` 处理。

### 日志工具页 `_pages/text_processor.html`、`_pages/enc_reader.html`

- 共享样式唯一来源是 `assets/css/diary-tools.css`；语义色唯一来源是 `diary_tree` 的 `categoryColor()`，高亮类在两处定义时必须同步修改。
- 正文统一宋体 16px、行高 1.95、段距 8px、首行缩进 2 字；窄屏 flex 布局要显式切列。避免用 `el.className = ...` 覆盖后续追加的类。

### 待办清单 `_pages/todo_list.html`

- 状态为 `todo`、`doing`、`done`、`dropped`；`dropped` 仅叶子可逆，使用空心虚线；父节点不附状态。
- 密文是 `assets/data/todo_list.enc`，明文不进 Git；迁移以 `tools/encrypt_todo.js` 为准，使用同一 envelope/key，并做解密回读逐字校验。
- 回归使用 `todo_enc_e2e.js`、`test_encrypt_tool.js`、`check_enc_file.js` 等现有脚本；测试前按脚本要求屏蔽外部字体。访问节点的 `.bubble`、`.lbl` 必须使用 `:scope >`，避免误命中子树。

### 论文调研页 `_pages/paper_retrieval.html`

- 使用页面自有深色 token，不引入 `diary-tools.css`；自声明 `box-sizing`。目录从索引页站内 `.html` 链接解析，镜像 raw→jsdelivr 依次尝试，单次超时 8 秒。
- `#page-last-modified` 需要隐藏并将时间移入状态栏；shell 应铺满视口，不要写死 `calc(100vh - N)`。

## 安全与数据边界

- 不把密码、密钥、解密后的待办明文、用户私有数据或一次性诊断输出写入 Git。
- 变更第三方 vendor 前先记录版本和补丁锚点；升级后重新运行补丁计数和端到端回归。
- 预览效果图、截图和一次性探针默认留在 `.workbuddy/tmp/` 或被 `.gitignore` 忽略；只有用户明确要求定稿时才纳入版本管理。
