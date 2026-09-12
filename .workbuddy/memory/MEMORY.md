# 项目长期记忆

## 沙盘战争（_pages/sandbox_war_game.html）

### 单位渲染体系
- 单位用 **DOM + CSS** 绘制，不是 canvas。结构：`.unit`（尺寸 `--unit-size`，负责定位与旋转）
  → `.unit-body`（尺寸 `--body-size`，`scale(var(--scale))`）→ 若干配件 div。
- 配件由 `GameObject.getDisplayMarkup()` 按 `this.type` 分支拼 HTML 字符串；
  `Artillery` / `RocketLauncher` 各自重写该方法。
- `.unit` 与 `.unit-body` **都没有 `overflow:hidden`**，配件可以伸出包围盒。

### 像素换算（做视觉调整前必算）
- `1 个 .unit-body CSS 单位 = --scale 屏幕像素`。士兵 --scale 0.636，坦克 0.611。
- 屏幕可辨识下限约 2px，对应容器单位 **约 3**（0.64px/单位时）。
  低于这个值的细节会糊掉，加细节前先算。

### 单位视觉语言约定（2026-09-02 定）
坦克已确立"**带倒角的立体小棋子**"语言：八边形倒角车体 + 三级明度
（暗车体 `--color-dark` / 主色 `--color` / 亮炮塔 `--color-light`）+ 伸出包围盒的炮管 +
椭圆柔影。步兵改版按此同一套语法对齐，不做符号化、不做具象小人。

### 弹丸视觉（2026-09-11 定）
- 弹丸是 `.projectile`（`box-sizing:border-box`），尺寸按 `visual` 分：
  missile `6×14`、drone `4×12`、bullet `3×(size+4)`、其余 `size×size`。
  配件坐标全部相对 **padding box**（要减掉 1px 边框）——反算像素框时别按 border box 算。
- **弹道导弹 = 火箭语汇**：橙红双层焰（`.missile-plume` 外层羽流 + `::after` 内焰）+
  白心灰边浓密烟团尾迹（`.smoke-puff.dense`）+ 抛物线顶点缩到 72% 做纵深。
- **巡航导弹 = 喷气语汇**：蓝白涡扇尾焰 + 细长冷凝尾迹线（`.contrail`，`--tr = angle-90`）+
  红绿翼尖航行灯（`.drone-wl.left/.right`，注意 `left:50%` + `margin-left` 定位）。
  两者刻意用不同颜色与不同尾迹形态区分，别合并。
- **地形配色跨度很大**（草地 `#7a8a3a`、沙地 `#c4a46a`、雪地 `#e8e8e8`、
  废墟 `#6b6660`、水面 `#2c5f7c`）。移动物一律要有**暗色轮廓**，
  禁止用纯浅色/白色镶边——在雪地和沙地上会直接糊掉。

### 无朝向载具（2026-09-11 定）
- **载具是否需要转向，取决于它的主体是不是"贴地物体"**：坦克炮管贴地、细线，随车体转是对的；
  甲板导弹是**立在车上的垂直物体**，车体朝南时弹头指着地面，语义就崩了。
- 这类单位用 `this.fixedHeading = true` 标记（基类默认 `false`）。生效 3 处：
  `updateVisual()` 把 `--angle` 锁死 `0deg`、`moveTowardTarget()` 跳过 `isTracked` 的对准分支、
  `handleSeparation()` 跳过轴向推斥投影。
- **必须保留 `isTracked = true`**——它同时承载"停车开火、不做步兵式走位"的行为；
  光关视觉旋转会让"先对准再走"退化成看不见的原地停顿，看起来像卡住。
- 目前仅 `BallisticMissile` / `CruiseMissile` 享有。它们的 `tryAttack` 无 `isFacing` 门禁，开火不受影响。

### 沙盘视觉改动的验证方法（2026-09-11 定；2026-09-12 修订）
**Edge CLI `--headless --screenshot` 不可用**（静默退出且不产文件），playwright 也未安装。
但**不要因此放弃无头验证**——CDP 直驱系统 Edge 是可行的（见本文档
「无头验证方法（2026-09-12 更新）」，零依赖，已跑通 37 项断言 + 截图）。
本页（DOM+CSS 渲染）目前仍以两步静态验证为主，都能真正抓出错误：
1. **几何断言**：从 CSS 文本解析声明，按 padding box 反算页面坐标像素框，
   断言"居中 / 与弹尾衔接无断缝 / 配件层级尺寸关系"。
   解析修饰规则（如 `.boosting`）必须**与基类做层叠合并、且取最后一次声明**。
2. **类驱动**：抽出 `Projectile` / 单位类 + DOM stub，按 `source.type` 走真实 specs 分支，
   驱动 `updateVisual` / `emitTrail` / `getDisplayMarkup`，断言生成的类名与内联样式值。
脚本在 `.workbuddy/tmp/`：`missile_geometry.js`、`trail_harness.js`、`heading_harness.js`、
`build_missile_preview.js`。
回归清单：CSS 括号平衡 + `node --check` + 27 个单位类实例化。
**改动单位渲染/行为时，`heading_harness.js` 的全类 `--angle` 断言必须跑**——
它按 `fixedHeading` 分支双向校验（无朝向载具恒 `0deg`，其余跟随 `angle`），漏改和误伤都能抓到。

### 仓库提交约定（2026-09-11 峰哥明确）
- commit message 带**子网页名前缀**：`沙盘战争: <简短描述>`（中英文冒号+空格，与全局的项目名前缀约定同源）。
- commit **必须带上对应日期的 memory 日志**，与代码同一提交，不拆开。
- `assets/data/todo_list.json` 长期有未提交改动，**不属于本项目**，别顺手带上；
  提交只写明确路径，禁止 `git add -A`。

### 工具坑
**同一文件禁止在同一条消息里并发多个 Edit**：read-modify-write 会互相覆盖，
静默丢改动（曾 5 处丢 3 处）。改同一文件必须串行，改完立即 grep 确认。

### 环境
- 托管 Node 路径：`C:/Users/wangyufeng/.workbuddy/binaries/node/versions/22.22.2-3/node.exe`
  （早期记录里的 `22.22.2-2` 已删除，调用会直接 127）。

## 高斯对比 / 3DGS 对比查看器（_pages/splat-compare.html，页名已改为「高斯对比」）

### gaussian-splats-3d v0.4.7 的 gpuAcceleratedSort 黑屏 bug（2026-09-07 定案）
- **必须保持 `gpuAcceleratedSort: false`**（产品页 L321 有长注释，勿改回）。
- 根因：开启后主线程 `addSplatBuffers` 不向排序 worker 发 centers 消息（库 L13338），
  而 worker 端 `renderCount = min(splatRenderCount, uploadedSplatCount)`、
  `uploadedSplatCount` 只随 centers 消息更新（库 L11580/11578）→ 恒 0
  → 回信 splatRenderCount=0 → `instanceCount=0` → 黑屏。
- DropInViewer 模式无关此 bug 的表现，任何模式开启都黑屏。
- `halfPrecisionCovariancesOnGPU: true` 无害（矩阵已验证），可保留。

### scene 级变换被烘焙（2026-09-07 定案）
- **必须把翻转/居中变换放在 splatGroup（THREE.Group）级，改 scene0 无效**。
- 原因：`dynamicScene=false` 时 `fillSplatDataArrays` 的 `applySceneTransform=true`，
  scene 变换在 build 时烘焙进数据纹理；build 后 scene0 的 position/rotation 不参与渲染
  （截图像素 diff=0 实证）。splatMesh.matrixWorld 含 group 变换，排序+渲染都吃。
- 相机同步必须全量含 target（右键平移改 controls.target），只同步球面坐标会丢平移。

### 单模型「调正」（每模型独立朝向，2026-09-12 定；同日三轮迭代）
- 场景：不同模型坐标系不同（COLMAP Y-down vs Y-up），必须**先各自转到同一角度**再开相机联动比对。
- 数据模型：每面板 `panel.userQuat`（**世界空间**累积旋转），最终朝向 **`R = flip · userQuat`**。
  `flip` 在**左**（世界空间）⇒ 点「上下翻转」时所有模型整体一起翻，**相对朝向不被打乱**。
- 居中不变式：`t = -R·(c·S) + userOffset`（含缩放与平移）。**任一项变了 t 必须重算**，
  统一走 `applyGroupTransform`。模型恒居中 ⇒ 绕世界原点转 == 绕模型自身中心转，构图不漂。
- **必守：世界增量 → 内层 `userQuat` 的共轭换算**，统一走 `applyWorldDelta(panel, D)`：
  `R0 = flip·userQuat; userQuat ← userQuat·(R0⁻¹·D·R0)`。
  不要"直接右乘裸轴向四元数"——只在 D 与当前 R 共轴时才对，flip 下必错（曾 179° 误差）。
  旧的 `toUserSpace` 已无人使用（`applyWorldDelta` 是等价且更明确的写法）。
- **朝向变化必须强制重排**（否则复用旧 view-space 深度 → 串色）：
  `applyGroupTransform` 里补 `g.updateMatrixWorld(true)`（排序读 `splatMesh.matrixWorld`，库 L14102，
  不刷会读到上一帧旧矩阵）；`runSplatSort(force, forceSortAll)` 在排序中直接 `return true`
  （库 L14071，静默丢弃）⇒ 用 `panel.sortDirty` 由渲染循环补跑，**`tryResort` 放在 `render()` 之后**
  （此时 camera/splatMesh 的 matrixWorld 才都是本帧最新）。`tick()` 里
  `anyPending = sortDirty || viewer.sortRunning`，有它就不挂起循环，防止停在旧排序上。
- 用户已明确：调正结果**不按文件名记住**。

#### 第四轮（2026-09-12，峰哥报回归后定案 —— **当前生效语义**）
峰哥报的 bug：「按调正按键时，左键会让**所有**模型一起旋转，中键会让**所有**模型一起缩放，
右键只移动当前模型；**退出调正时，所有模型的缩放与视角都会变**。」
澄清本意：调正**只控制当前这一个模型**；方式与查看模型一致（可共用函数）；
**退出时把控制加到相机修正里**；**不要联动（各面板独立机位）**。

- **根因**：第三轮删掉了 `controls.enabled=false`，改用原生 OrbitControls 环绕 ⇒
  调正面板自己发 `change` → `broadcastCameraState` → 所有面板一起动；
  `commitAdjustRotation` 还调 `applyCameraState(panel, inState)` + 写 `mainCameraState`，
  退出时污染全局相机。
- **硬约束（决定方案）**：渲染循环每帧 `controls.update()` 末行是 `camera.lookAt(target)`（库 L5018），
  且 `camera.up=(0,1,0)` ⇒ **相机横滚恒为 0、无法自由设定**。
  把模型旋转折算进相机要求相机转 `R⁻¹`，只有**绕世界 Y** 时横滚仍为 0：
  纯 Y = **0.000°**（精确）；X = 10.5°、Z = 14.0°、Y+X = 5.1°（lookAt 无法表示 → 退出必跳）。
  ⇒ 峰哥拍板：**「如果 XZ 旋转有问题那就只改 Y 轴吧」**。
- **当前语义**：
  - 调正中 `controls.enabled = false`（本面板相机完全冻结）+ `pointerdown` 按 `e.button` 分派
    **模型侧**操作：左键**水平**拖 = 绕世界 Y 转模型；中键/滚轮 = 缩放模型；右键 = 平移模型。
  - **只提供 Y 轴旋转**（X/Z 的 ±90° 按钮与图纸俯仰已全部删除），只留 `Y−90° / Y+90° / 复原尺寸 / 重置`。
  - 退出 ⇒ `commitAdjustToCamera`：`C' = R_y⁻¹·C`、`eye' = (eye−T)·R_y⁻¹/S`，
    模型回到**纯单位变换**（`userQuat=I / userScale=1 / userOffset=0`）。
  - **禁止广播**：`commitAdjustToCamera` 全程 `panel.suppressBroadcast = true`（try/finally），
    且 `change` 处理器加 `if (panel.adjusting || panel.suppressBroadcast) return;`。
    注意 `setPanelAdjusting(panel,false)` 会**先**把 `panel.adjusting=false` **再**调 commit，
    所以单靠 `panel.adjusting` 挡不住 —— 这个显式标志是必需的。
- **⚠️ 任何对 `camera.quaternion` 的直接写入都是临时的**：每帧 `controls.update()` 都会用
  `pos + target + up` 重算（`lookAt`），横滚被抹平。`applyCameraState` 能生效只是因为它写的是
  这套参数。别指望写 `camera.quaternion` 能持久。
- **像素残差的正确认识（第四轮更新）**：折算前后是「模型带 R/S/T」与「相机带 R_y/S/T」
  两种**等价表示**，几何完全一致（`eye_predict.mjs` 实测位置差 1.1e-4、朝向差 0.0039°），
  残差 4.72%（均值 2.98/255，集中边缘）来自 `splatMesh.matrixWorld` 变化引起的深度排序次序微变。
  **本轮同机位强制重排对照 = 0%**（渲染是确定性的），所以不能用 no-op 当基线，
  只能拿**同一等价类的另一种表示**来比。
- **`__adjust` 钩子（当前）**：`toggle / rotate(i,dx) / axis / translate / zoom / commit /
  quat / cursor / restoreCamera / reset / resetCommit / forceResort(i)`。
  `rotate` 现在只吃 `dx`（绕 Y），与 UI 左键水平拖同一套。
- **验证（全绿）**：`check_splat_compare.js` **61 OK**；
  `adjust_isolation.js` **25 OK**（含 10 项**真实鼠标事件路径**：CDP 注入左/中/右键+滚轮，
  断言另一面板相机与模型全程不动）；
  `adjust_freeze.js` 定格 **60.5% → 4.72%**（均值 2.98）；
  `eye_predict.mjs` 相机会数值吻合；`roll_check.mjs` 复现 Y=0°/X=10.5°/Z=14.0°。

### 调试资产
- **已入库（在 Git 里）**：`_pages/splat-test-matrix.html`（变体矩阵测试页，URL 参数
  gpusort/halfprec/manual/nooffset/forceall）、`_pages/splat-test-inner.html`（标准 Viewer）、
  `_pages/splat-test-dropin.html`（DropInViewer 1:1 复刻）。
- **仅在本机、未入库**：`.workbuddy/tmp/` **整个目录被 `.gitignore` 忽略**——
  里面的探针脚本（pxstat.py、matrix_probe.js、e2e_compare_probe.js、
  check_splat_compare.js、adjust_math_harness.mjs、e2e_adjust_cdp.js、pngstat.js…）
  以及 `real.ply`(284MB) 只要工作区被清就会丢，别把长期依赖放在这里。

### 无头验证方法（2026-09-12 更新 —— 旧记录的 Playwright 路线已不可用）
**playwright / puppeteer 本机都没装，但可以 CDP 直驱系统 Edge，零依赖。**
脚本 `.workbuddy/tmp/e2e_adjust_cdp.js`（自带 `http.createServer` 静态服务）：
启 `msedge --headless=new --enable-unsafe-swiftshader --remote-debugging-port=N`
（路径 `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`），
用 **Node 内置 WebSocket** 手写极简 CDP 客户端
（`Target.createTarget` → `attachToTarget(flatten)` → `Runtime.evaluate(returnByValue+awaitPromise)`
→ `Input.dispatchMouseEvent` → `Page.captureScreenshot`；`/json/version` 取 browser 级 ws 端点）。
- 真实拖放注入：page 内 `fetch(PLY) → new File → new DataTransfer → dispatchEvent('drop')`
  （284MB 走这条路 0.5s，比 base64 稳得多）。
- 页面错误收集：`Runtime.exceptionThrown` + `Log.entryAdded`；**favicon.ico 的 404 要白名单掉**。
- 产品页新增诊断钩子：`__pixelStats(i)`（render 后**同一任务内** `gl.readPixels`，
  否则默认帧缓冲已被合成清空）、`__splatCounts(i)`、
  `__adjust{toggle,rotate,axis,translate,zoom,commit,quat,cursor,restoreCamera,reset,resetCommit,forceResort}`。
- **调正专用探针（2026-09-12 第四轮）**：
  `adjust_isolation.js`（多面板隔离性，含**真实 CDP 鼠标事件路径**——
  这是唯一能覆盖 `pointerdown` 按键分派与指针捕获的层，别只用 `__adjust` 钩子自证）、
  `adjust_freeze.js`（退出折算定格，用 PNG 差异判定）、
  `eye_predict.mjs`（把实测相机与 `C'=R⁻¹C / eye'=(eye−T)R⁻¹/S` 逐项对齐）、
  `roll_check.mjs`（证明只有纯 Y 轴折算的横滚为 0）、
  `adjust_commit_math.mjs`（自由相机的折算恒等式）、`swing_twist.mjs`（分解方案对比）。
- `.workbuddy/tmp/pngstat.js`：**纯 `zlib` 手写 PNG 解码** + 逐像素差异 + 16×16 粗格签名（不装 PIL）。
- **像素基线必须先等渲染收敛**：刚 ready 时 `splatRenderCount` 未达全量，此时取的"基线"是残缺渲染
  （曾导致误判"重置没回到基线"）。**任何像素级断言前先断言 `splatRenderCount == getSplatCount()`**。
- **`freeze_probe.js`（定格根因探针，2026-09-12 新增）**：不只截图，还从
  `__debugGroupXform` / `__debugCameras` 取 `quat`/`position`/`camPos`/`target`，
  本地重组 **视图矩阵 `camera⁻¹·splatMesh`** 逐元素比对 —— 这是把"朝向对不对"
  和"像素差多少"分开判定的关键手段（前者数值，后者视觉）。
  同机位往返+固化作为**排序地板**对照组。
  滚动校验和不适合判"有没有变"（排序顺序微调就整体翻转），要用 PNG 变化像素占比/粗格签名。
