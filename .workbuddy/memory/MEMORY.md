# 项目长期记忆

> 详细过程/教训在 `.workbuddy/memory/YYYY-MM-DD.md`（09-12 高斯语义、09-14 翻转+平移、09-15 站点）。

## 通用约定
- commit 前缀 = 子网页名（`沙盘战争: ` / `高斯对比: ` / `主页: `），**必须**与当日 memory 日志同一提交；中文、一行标题 + ≤2 行正文。
- 只 `git add` 明确路径，**禁止 `git add -A`**（`assets/data/todo_list.json` 长期脏）。**AI 不得 push**。
- **同一文件禁止在同一条消息里并发多个 Edit**（read-modify-write 互相覆盖，曾 5 处丢 3 处）；串行改，改完立即 Grep 确认。
- 托管 Node：`C:/Users/wangyufeng/.workbuddy/binaries/node/versions/22.22.2-3/node.exe`（`-2` 已删，调用即 127）。
- ⚠️ 本机 Shell **无 coreutils**（grep/head/tail/ls/cp → 127）⇒ 用 Glob/Read/Grep/Node。⚠️ **PowerShell 工具当前不回传 stdout**（多条命令空输出）⇒ 取数据一律走 Node。

## 无头验证（唯一可行路线）
- playwright / puppeteer 未装；Edge `--headless --screenshot` 静默失败。
- **CDP 直驱系统 Edge，零 npm 依赖**：`msedge --headless=new --enable-unsafe-swiftshader --remote-debugging-port=N`
  （`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`），Node 内置 `WebSocket` 手写客户端
  （`Target.createTarget` → `attachToTarget(flatten)` → `Runtime.evaluate(returnByValue+awaitPromise)` →
  `Input.dispatchMouseEvent` → `Page.captureScreenshot`）。参考 `.workbuddy/tmp/e2e_adjust_cdp.js`（自带静态服务）。
- 大文件注入：page 内 `fetch → new File → new DataTransfer → dispatchEvent('drop')`（284MB 走 0.5s）。
- 错误收集 `Runtime.exceptionThrown` + `Log.entryAdded`；**favicon 404 要白名单**。
- `pngstat.js`：纯 `zlib` 手写 PNG 解码 + 逐像素 diff + 16×16 粗格签名（不装 PIL）。
- ⚠️ JS 合成的 `PointerEvent` 不被 OrbitControls 接受 ⇒ 交互必须用 CDP `Input.dispatchMouseEvent`。
- ⚠️ CDP `mouseWheel` 对某些面板不可靠 ⇒ 量级验证走状态钩子，真实事件只验"派发通不通"。
- ⚠️ **断言禁"非零即过"**：交互量级 bug 必须拿对照实现（OrbitControls 原生推拉）的实测值当期望，每条通道独立断言。
- ⚠️ 测量前必须 `settle()`：轮询 `__debugCameras()` 直到连续两次返回值相同（或超时）再读，否则 damping 下读到不同帧。
- ⚠️ oracle 必须与"性质的成立条件"**同帧**：用原子注入单帧变化的钩子把条件做定；禁用"整段累积量 ÷ 变化前基"。

## 沙盘战争（_pages/sandbox_war_game.html）
- 单位是 **DOM+CSS**（非 canvas）：`.unit`（定位/旋转）→ `.unit-body`（`scale(var(--scale))`）→ 配件 div。
  配件 HTML 由 `GameObject.getDisplayMarkup()` 按 `this.type` 拼；`Artillery`/`RocketLauncher` 各自重写。
  两层都**没有 `overflow:hidden`**，配件可伸出包围盒。
- 换算：1 个 `.unit-body` CSS 单位 = `--scale` 屏幕像素（士兵 0.636 / 坦克 0.611）；可辨识下限 ~2px ≈ 容器单位 3。
- 视觉语言：坦克 = 八边形倒角立体小棋子（三级明度 dark/color/light + 伸出包围盒的炮管 + 椭圆柔影）；步兵同语法对齐，不符号化。
- `.projectile`（border-box）按 `visual` 定尺寸：missile `6×14` / drone `4×12` / bullet `3×(size+4)`；
  **配件坐标相对 padding box**（减 1px 边框）。弹道导弹 = 火箭语汇（橙红双层焰 + 浓密烟团），
  巡航导弹 = 喷气语汇（蓝白涡扇 + 细长冷凝线 + 红绿翼尖灯），**刻意不同别合并**。
- 地形配色跨度大（草 `#7a8a3a` / 沙 `#c4a46a` / 雪 `#e8e8e8` / 废墟 `#6b6660` / 水 `#2c5f7c`）
  ⇒ 移动物一律**暗色轮廓**，禁纯浅色镶边。
- 无朝向载具：`this.fixedHeading = true`（基类 false），生效 3 处：`updateVisual()` 锁 `--angle:0deg`、
  `moveTowardTarget()` 跳过对准分支、`handleSeparation()` 跳过轴向推斥；**必须保留 `isTracked = true`**（承载停车开火）。
  目前仅 `BallisticMissile`/`CruiseMissile`。
- 验证：① 几何断言（从 CSS 文本解析声明，按 padding box 反算像素框；修饰规则与基类层叠合并取最后一次声明）
  ② 类驱动（抽 `Projectile`/单位类 + DOM stub 走真实 specs 分支）。
  脚本 `missile_geometry.js` / `trail_harness.js` / `heading_harness.js` / `build_missile_preview.js`；
  回归 = CSS 括号平衡 + `node --check` + 27 个单位类实例化。**改单位渲染/行为必跑 `heading_harness.js`**。

## 高斯对比（_pages/splat-compare.html）
### 库级硬约束（gaussian-splats-3d v0.4.7 + three r185，均已定案）
- **必须 `gpuAcceleratedSort: false`**：开启后主线程不发 centers 消息（库 L13338）→ worker `uploadedSplatCount` 恒 0
  → `renderCount=0` → **黑屏**。`halfPrecisionCovariancesOnGPU: true` 无害可留。
- **变换必须放 splatGroup（THREE.Group）级**，改 scene0 无效（`dynamicScene=false` 时 `applySceneTransform=true`，build 时烘焙进数据纹理）。
- 渲染循环每帧 `controls.update()`，末行 `camera.lookAt(target)`（库 L5018）+ `camera.up=(0,1,0)`
  ⇒ **相机横滚恒 0**，直接写 `camera.quaternion` 都是临时的；只有 `position/target/up` 能持久。
- 朝向变化必须强制重排（否则复用旧 view-space 深度 → 串色）：`applyGroupTransform` 里 `g.updateMatrixWorld(true)`；
  `runSplatSort` 在排序中直接 `return true`（库 L14071，静默丢弃）⇒ 用 `panel.sortDirty` 由渲染循环补跑，
  **`tryResort` 放在 `render()` 之后**。
- 滚轮要挡住 OrbitControls 必须挂**捕获阶段**（canvas 是 canvasWrap 子节点，冒泡监听排在其后 ⇒ 静默失效）。
- 缩放抄 OrbitControls `getZoomScale()=pow(0.95,zoomSpeed)`：滚轮一格 ×1/0.95=+5.26%；中键拖 40px/档。
- 顶层标识符**不要命名 `zf`**（vendor 里有 `let zf`，TDZ 坑）。
- **必须 `antialiased: true`**（2026-09-12 A/B 定案）：关掉时 kernel2DSize=0.3px 加粗但不减 vColor.a（vendor L8169）
  → 薄层高斯叠出随视角漂移的深色侵蚀斑；开启实测亮区暗斑个数/面积降 30~45%。
  SH0/SH2、协方差 fp16/fp32、dpr1/dpr2 对黑斑**均无影响**。⚠️ 只对训练带 gsplat 补偿的模型正确。工具 `tmp/blob_scan.js`。

### 现行交互架构（三条定案，别回退）
1. **单独调整 = 共同基准 ⊕ 私有偏移**（09-12 第九轮）：`mainCameraState{target,azimuth,elevation,distance}` 为基准，
   `panel.camOffset{dTarget,dAz,dEl,distRatio}` 为私有，本面板实际机位 = 基准 ⊕ 偏移。
   查看模式写基准并广播 `applyBaseToPanel`；单独调整模式 `recordPrivateOffset` 反算写偏移、不广播。
   **退出单独调整 = 无操作**（反算幂等 ⇒ 不可能累加/漂移）。`dEl` 私有 ⇒ "只能绕 Y" 限制已取消。
   `applyGroupTransform` 只剩本面板翻转 + 居中（`t = -R·c`），模型侧调正变换已全删（约 320 行）。
   历史第 1–8 轮的模型侧变换/退出折算/账本（distFactor/yawDelta/targetDelta）**全部作废**。
2. **上下翻转 = 每面板 `panel.flipped`**（09-14 第十一轮）：模型侧状态（`splatGroup.quaternion` 绕 X 180°），
   不是全局布尔。理由 = 相机表达不出"物体自己倒没倒"。入口：面板标题栏「翻转」(`setPanelFlipped`) +
   顶部「**全部翻转**」(`setAllFlipped`，混态时点一次 = 全翻；`allPanelsFlipped()` 决定 active)。
   必须 `forceResort` + `setPanelFlipped` 内 `syncFlipButton()`（否则顶部按钮滞后）。角标 `.panel-canvas-wrap.flipped::after`。
   钩子 `window.__flip = {set,all,state,allFlipped}`。
3. **平移广播「屏幕像素意图」**（09-14 第十轮）：`Δt_world = right·(−2·dx·td/H) + up·(2·dy·td/H)`，`td=dist·tan(fov/2)`，
   右/上轴取 `camera.matrixWorld` 列 0/1 ⇒ 广播**世界位移**会让朝向/距离不同的面板走偏。
   故广播 (dx,dy)，各面板按自身相机换回世界位移并演化私有 `dTarget_new = st_p.target + dOwn − base_new.target`（绝对值 ⇒ 不漂移）。
   函数 `panScale` / `worldToPanPixels` / `panPixelsToWorld`；左键旋转、滚轮缩放不受影响。
   **不判据化**：`base.target` 变化非零就走（判据猜不了混合帧：旋转余波 + 平移同帧）。
   ⚠️ 世界→像素必须用源面板**变化前**的基 `sourcePanel.panBasis`（广播末尾刷新各面板 panBasis）；接收面板侧用实时基。
- 探针 `window.__project(x,y,z)` / `__debugCameras`（含 fov/panBasis）/ `__lastBroadcast` /
  `__mixChange(i,{dx,dy,dAz})`（原子注入单帧混合变化）。
- 回归：`unify_semantics.js`（26 项）、`pan_sync.js`（12 项，P3/P5/P6 屏幕或像素意图差须 ~0）、
  `flip_panel.js`（17 项）、重写版 `check_splat_compare.js`（51+11 项）。旧 link_sync / adjust_isolation / adjust_freeze 作废。

### 调试资产
- 已入库：`_pages/splat-test-matrix.html`（URL 参数 gpusort/halfprec/manual/nooffset/forceall）、`splat-test-inner.html`、`splat-test-dropin.html`。
- **仅本机、未入库**：`.workbuddy/tmp/` **整个目录被 `.gitignore` 忽略** —— 探针脚本与 `real.ply`(284MB) 工作区一清就丢，
  **别把长期依赖放这里**。

## 日志时间轴（_pages/diary_tree.html）
- **定案规格见 `_design/diary_tree_redesign.md`**（含 11 条被否决方案及依据，改版前必读）。
  `_design/tree_mock.html` 是设计评审快照（不维护，权威实现是页面本身），
  `?v=O|A|B|C|H1|H2|H3|F|D` + 对照开关（`scale=sqrt` / `tone=plain` / `vcal=1` / `bf=sans` / `filter=`），
  用 `.workbuddy/tmp/shot_mock.js` 复现证据（变体列表用 `;` 分隔，`~x,y,w,h` 可裁切做 1:1 验证）。
- 病根：**静止视图不承载信息** —— 1440×900 四列时 `fitAllYears` 得 scale≈1.0，
  正好卡在「月表头阈值 0.52」与「日节点阈值 1.08」之间，只剩 48 个同色浅橙卡。
- 已定案：分段堆叠柱（柱高 ∝ 字数 · 线性 · 分母 = 全局单日最大 × 0.35 · 超出截平）
  \+ 当月累计字数包络 · `k = scale/fitScale` 驱动 LOD（≥1.30 圆角格 / ≥1.60 日序号 + 装得下才画护栏）
  \+ 单击月份卡进**原位浮层**（左真月历 7×6 + 右当月目录）· 日详情**单栏长文**（宋体 16 / 行高 1.95 / 段首缩进 2 字 / 禁则折行）
  \+ **paper 基调**（纸纹 + 朱印替金环）· **36px 全宽顶栏 HUD**（修掉压盖第一年）· 图例变分类筛选。搜索放二期。
- ⚠️ 两个必须记住的坑：① **中文正文字体栈必须 ≥2 个候选**（`"Songti SC","SimSun",…`）——
  本机 `Songti SC` 不存在，只写一个会静默退到通用字体，连 A/B 都看不出差别（用 `window.__fonts` 量宽度验证）；
  ② **柱顶装饰必须与「分段」语义区分**——截平曾用"柱顶深色横线"，被误读成"这一天又多了一篇"，
  改成"柱体缩短 1.6px + 上方浮一条窄线"。
- 页面需密码解密 `assets/data/*.txt`，**本机无法直接端到端跑**；验证走
  「复制页面到 `.workbuddy/tmp/` + 把鉴权块换成合成数据注入」的 dev 副本，渲染代码保持与线上一致。

## 站点 crescentvelvet.github.io（Jekyll + minimal-mistakes 分支）
- **主题内联在仓库里**：`_config.yml` 里**没有** `theme:`/`remote_theme:`/`minimal_mistakes_skin:`，
  `_sass/`+`_includes/`+`_layouts/` 全是本地文件可直接改；**颜色唯一来源 = `_sass/_variables.scss`**。
- **资产引用分两种，别混**：`href`/图片/`og:image`/社交分享 → `{{ base_path }}`（绝对，必需）；
  **本地加载的 CSS/JS → `{{ '...' | relative_url }}`**（根相对带 baseurl）。`scripts.html` 的 main.min.js 曾误用 base_path
  （症状：本地预览脚本走线上、断网挂住首页），09-15 已改。
- `_config.yml` 的 `defaults:` 按 scope 生效，`type: pages` 默认 `author_profile: true`
  ⇒ 页面不显式写 `author_profile: false` 会渲染空作者侧栏。
- **`classes: wide`**（front matter → `_layouts/default.html` 落到 `<body>`）＝ 放宽正文容器；该分支原本不支持，09-15 新加。
- 首页 `_pages/about.md` 走 `single` 布局，整段 CSS/JS 内联在正文 ⇒ **正文必须从第 0 列开始**（否则 kramdown 当缩进代码块转义）。
- **布局底账（改容器尺寸前必读）**：`.page` 在 `>=925px` 时 `width:83.051%` + `float:right` +
  `padding-left:4.237%` + `padding-right:16.949%`；`#main` 顶层 `max-width:925px`（`>=80em` → 1280px）
  ⇒ **925~1279px 视口正文只有 549.98px**（比 900px 窗口的 864px 还窄，非单调）。
  `classes: wide` 把 `#main` 提到 `$page-wide-max:1112px`、`.page` 放到 100% ⇒ `>=1024px` 正文 988~1076px。
  首页卡片网格 `minmax(122px,1fr)` + `gap:18px`，**两个数绑死**（内容盒需 106px）；
  **加 1px 描边要同步把 padding 减 1**（`13px 7px`+`border:1px` ≡ `14px 8px`），否则掉列。
- ⚠️ `assets/js/main.min.js` 的 greedy-nav 不能碰的前提：`updateNav()` 无条件调用，末尾
  `$vlinks.width()>e && updateNav()` 递归。`#site-nav` 缺席或 `display:none` ⇒ 两个 `.width()` 取 0 ⇒ `e=-30`、
  `0>-30` 恒真 ⇒ 每次加载必 `RangeError: Maximum call stack size exceeded`。
  **做法**：保留 `#site-nav`，用 `height:0;overflow:hidden` 折叠页头。
- 站点验证资产（仅本机 `.workbuddy/tmp/`）：`icons_e2e.js`(29) / `ripple_card.js`(17) / `fx_card.js`(33) /
  `site_smoke.js`(21 URL) / `check_card_css.js`(12) / `probe_js_error.js` / `diag_grid.js` / `measure_parts.js` /
  `glyph_width.js` / `variants_card.js` / `shot_home.js` / `shot_hover.js`；均支持 `E2E_SITE` 指向独立构建目录。
