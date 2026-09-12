# 项目长期记忆

## 通用约定
- commit 前缀 = 子网页名：`沙盘战争: xxx` / `高斯对比: xxx`；**必须**与当日 memory 日志同一提交。
- 只 `git add` 明确路径，**禁止 `git add -A`**（`assets/data/todo_list.json` 长期脏，不属于本项目）。
- **AI 不得 push**（用户手动 push）。
- **同一文件禁止在同一条消息里并发多个 Edit**（read-modify-write 互相覆盖，曾 5 处丢 3 处）；串行改，改完立即 grep 确认。
- 托管 Node：`C:/Users/wangyufeng/.workbuddy/binaries/node/versions/22.22.2-3/node.exe`
  （`22.22.2-2` 已删，调用直接 127）。Shell **无 coreutils**（grep/head/tail/ls/cp → 127），用 Glob/Read/Node/PowerShell。

## 无头验证方法（唯一可行路线）
playwright / puppeteer 本机都没装，Edge CLI `--headless --screenshot` 静默失败。
**用 CDP 直驱系统 Edge，零 npm 依赖**：`msedge --headless=new --enable-unsafe-swiftshader
--remote-debugging-port=N`（`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`），
Node 内置 `WebSocket` 手写极简客户端（`Target.createTarget` → `attachToTarget(flatten)` →
`Runtime.evaluate(returnByValue+awaitPromise)` → `Input.dispatchMouseEvent` → `Page.captureScreenshot`）。
参考实现 `.workbuddy/tmp/e2e_adjust_cdp.js`（自带 `http.createServer` 静态服务）。
- 大文件注入：page 内 `fetch(PLY) → new File → new DataTransfer → dispatchEvent('drop')`（284MB 走 0.5s）。
- 错误收集：`Runtime.exceptionThrown` + `Log.entryAdded`；**favicon 404 要白名单**。
- `pngstat.js`：纯 `zlib` 手写 PNG 解码 + 逐像素差异 + 16×16 粗格签名（不装 PIL）。
- **像素断言前先断言 `splatRenderCount == getSplatCount()`**，否则基线是残缺渲染。
- ⚠️ **JS 合成的 `PointerEvent` 不被 OrbitControls 接受** ⇒ 交互必须用 CDP `Input.dispatchMouseEvent`。
- ⚠️ CDP `mouseWheel` 对某些面板不可靠 ⇒ 量级验证走状态钩子，真实事件只验"派发通不通"。
- ⚠️ **断言禁止"非零即过"**：交互量级 bug 必须拿对照实现（OrbitControls 原生推拉）的实测数值当期望值，
  且每条事件通道独立断言。静默劫持（事件被原生消费）用"非零即过"永远查不出来。

## 沙盘战争（_pages/sandbox_war_game.html）
- 单位是 **DOM+CSS**（非 canvas）：`.unit`（定位/旋转）→ `.unit-body`（`scale(var(--scale))`）→ 配件 div。
  配件 HTML 由 `GameObject.getDisplayMarkup()` 按 `this.type` 拼；`Artillery`/`RocketLauncher` 各自重写。
  两层都**没有 `overflow:hidden`**，配件可伸出包围盒。
- 像素换算：`1 个 .unit-body CSS 单位 = --scale 屏幕像素`（士兵 0.636 / 坦克 0.611）。
  可辨识下限约 2px ≈ 容器单位 **3**；加细节前先算。
- 视觉语言：坦克 = "带倒角的立体小棋子"（八边形倒角 + 三级明度 dark/color/light + 伸出包围盒的炮管 + 椭圆柔影）；
  步兵按同一语法对齐，不做符号化/具象小人。
- 弹丸 `.projectile`（`border-box`），尺寸按 `visual`：missile `6×14`、drone `4×12`、bullet `3×(size+4)`。
  **配件坐标相对 padding box**（减 1px 边框）。弹道导弹=火箭语汇（橙红双层焰+浓密烟团），
  巡航导弹=喷气语汇（蓝白涡扇+细长冷凝线+红绿翼尖灯），**刻意不同，别合并**。
- 地形配色跨度大（草 `#7a8a3a`/沙 `#c4a46a`/雪 `#e8e8e8`/废墟 `#6b6660`/水 `#2c5f7c`）⇒
  移动物一律**暗色轮廓**，禁止纯浅色镶边（雪地/沙地会糊）。
- 无朝向载具：判据是"主体是否贴地物体"。用 `this.fixedHeading = true`（基类 false），生效 3 处：
  `updateVisual()` 锁 `--angle:0deg`、`moveTowardTarget()` 跳过对准分支、`handleSeparation()` 跳过轴向推斥。
  **必须保留 `isTracked = true`**（承载"停车开火"），光关视觉旋转会退化成看不见的原地停顿。
  目前仅 `BallisticMissile`/`CruiseMissile`。
- 验证：① 几何断言（从 CSS 文本解析声明，按 padding box 反算像素框；修饰规则要与基类层叠合并、取最后一次声明）
  ② 类驱动（抽 `Projectile`/单位类 + DOM stub，走真实 specs 分支）。
  脚本：`missile_geometry.js`、`trail_harness.js`、`heading_harness.js`、`build_missile_preview.js`。
  回归清单：CSS 括号平衡 + `node --check` + 27 个单位类实例化。
  **改单位渲染/行为必跑 `heading_harness.js`**（按 `fixedHeading` 分支双向校验全类 `--angle`）。

## 高斯对比（_pages/splat-compare.html）
### 库级硬约束（gaussian-splats-3d v0.4.7 + three r185，均已定案）
- **必须 `gpuAcceleratedSort: false`**（产品页 L321 有长注释，勿改回）。开启后主线程不发 centers 消息（库 L13338），
  worker 端 `uploadedSplatCount` 恒 0 → `renderCount=0` → `instanceCount=0` → **黑屏**。任何模式都黑。
  `halfPrecisionCovariancesOnGPU: true` 无害，可保留。
- **变换必须放 splatGroup（THREE.Group）级，改 scene0 无效**：`dynamicScene=false` 时
  `fillSplatDataArrays` 的 `applySceneTransform=true`，scene 变换 build 时烘焙进数据纹理（像素 diff=0 实证）。
- **渲染循环每帧 `controls.update()`，末行是 `camera.lookAt(target)`（库 L5018）+ `camera.up=(0,1,0)`
  ⇒ 相机横滚恒为 0，任何对 `camera.quaternion` 的直接写入都是临时的。**
  能持久生效的只有 `position / target / up` 这套参数。
- 朝向变化必须强制重排（否则复用旧 view-space 深度 → 串色）：`applyGroupTransform` 里 `g.updateMatrixWorld(true)`
  （排序读 `splatMesh.matrixWorld`，库 L14102）；`runSplatSort` 在排序中直接 `return true`（库 L14071，静默丢弃）
  ⇒ 用 `panel.sortDirty` 由渲染循环补跑，**`tryResort` 放在 `render()` 之后**。
- 滚轮要挡住 OrbitControls 必须挂**捕获阶段**（canvas 是 canvasWrap 子节点，冒泡监听排在它之后 ⇒ 静默失效）。
- 缩放手感抄 OrbitControls `getZoomScale()=pow(0.95,zoomSpeed)`：滚轮一格 ×1/0.95=+5.26%；中键拖 40px/档。
- TDZ 坑：顶层标识符**不要命名 `zf`**（vendor 里有 `let zf`）。

### 调正（adjust）语义演进 —— 详见当日日志
- 模型变换：`R = flip · userQuat`（flip 在左/世界空间 ⇒ 整体翻转不打乱相对朝向），
  居中不变式 `t = -R·(c·S) + userOffset`，任一项变了必须走 `applyGroupTransform` 重算。
- 世界增量 → 内层 `userQuat` 必须走共轭换算 `applyWorldDelta(panel, D)`：
  `R0 = flip·userQuat; userQuat ← userQuat·(R0⁻¹·D·R0)`。直接右乘裸轴向四元数在 flip 下必错（曾 179° 误差）。
- 把模型旋转折算进相机要求相机转 `R⁻¹`，**只有绕世界 Y 横滚仍为 0**（纯 Y=0.000°；X=10.5°、Z=14.0°）
  ⇒ 峰哥拍板"只改 Y 轴"。
- 调正结果**不按文件名记住**。
- ⚠️ 已踩两次的坑：① 把"折算产生的私有量"与"用户主动缩放/平移"混为一谈 ⇒ 联动整体失灵
  （区分标准是**谁发起的**）；② 把折算后的 `azimuth/elevation` 写进共同基准 `mainCameraState`
  ⇒ 其他面板不当场跟转，下次任意面板一广播就二次跳转。
- 像素残差正确认识：折算前后是两种**等价表示**（`eye_predict.mjs` 位置差 1.1e-4、朝向差 0.0039°），
  残差 4.72%（均值 2.98/255，集中边缘）来自 `splatMesh.matrixWorld` 变化引起的深度排序次序微变。
  **同机位强制重排对照 = 0%**（渲染确定性）⇒ 不能用 no-op 当基线。

### 调试资产
- **已入库**：`_pages/splat-test-matrix.html`（变体矩阵，URL 参数 gpusort/halfprec/manual/nooffset/forceall）、
  `splat-test-inner.html`、`splat-test-dropin.html`。
- **仅本机、未入库**：`.workbuddy/tmp/` **整个目录被 `.gitignore` 忽略** —— 探针脚本与 `real.ply`(284MB)
  工作区一清就丢，**别把长期依赖放这里**。
