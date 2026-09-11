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

### 沙盘视觉改动的验证方法（2026-09-11 定）
**本机没有可用的无头截图**：Edge CLI `--headless --screenshot` 静默退出且不产文件，
playwright / agent-browser 均未安装（装 Chromium 约 500MB，别为单次验证装）。
改用两步静态验证，都能真正抓出错误：
1. **几何断言**：从 CSS 文本解析声明，按 padding box 反算页面坐标像素框，
   断言"居中 / 与弹尾衔接无断缝 / 配件层级尺寸关系"。
   解析修饰规则（如 `.boosting`）必须**与基类做层叠合并、且取最后一次声明**。
2. **类驱动**：抽出 `Projectile` / 单位类 + DOM stub，按 `source.type` 走真实 specs 分支，
   驱动 `updateVisual` / `emitTrail` / `getDisplayMarkup`，断言生成的类名与内联样式值。
脚本在 `.workbuddy/tmp/`：`missile_geometry.js`、`trail_harness.js`、`build_missile_preview.js`。
回归清单：CSS 括号平衡 + `node --check` + 27 个单位类实例化。

### 环境
- 托管 Node 路径：`C:/Users/wangyufeng/.workbuddy/binaries/node/versions/22.22.2-3/node.exe`
  （早期记录里的 `22.22.2-2` 已删除，调用会直接 127）。

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
