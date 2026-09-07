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

## 3DGS 对比查看器（_pages/splat-compare.html）

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

### 调试资产（都还在仓库里）
- `_pages/splat-test-matrix.html`：变体矩阵测试页（URL 参数 gpusort/halfprec/manual/nooffset/forceall）。
- `_pages/splat-test-inner.html` 标准 Viewer / `splat-test-dropin.html` DropInViewer 1:1 复刻探针页。
- `.workbuddy/tmp/`：pxstat.py（截图非背景像素统计）、matrix_probe.js、e2e_compare_probe.js（DataTransfer 模拟拖放注入 File 到产品页）、8896/8897 Range 文件服务器。
- 无头验证方法：Playwright `channel:'msedge'` + `--enable-unsafe-swiftshader`，PIL 像素统计代替看图。
