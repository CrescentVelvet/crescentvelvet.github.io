# 项目长期记忆

> 详细过程/教训在 `.workbuddy/memory/YYYY-MM-DD.md`（09-12 高斯语义、09-14 翻转+平移、09-15 站点+月相章）。

## 通用约定
- commit 前缀 = 子网页名（如 `日志时间轴: ` / `高斯对比: ` / `主页: `），**必须**与当日 memory 日志同一提交；中文、一行标题 + ≤2 行正文。
- 只 `git add` 明确路径，**禁止 `git add -A`**（`assets/data/todo_list.json` 长期脏）。**AI 不得 push**。
- **同一文件禁止在同一条消息里并发多个 Edit**（read-modify-write 互相覆盖，曾 5 处丢 3 处）；串行改，改完立即 Grep 确认。
- 托管 Node：`C:/Users/wangyufeng/.workbuddy/binaries/node/versions/22.22.2-3/node.exe`。
- ⚠️ 本机 Shell **无 coreutils**（grep/head/tail/ls/cp/mkdir → 127）⇒ 用 Glob/Read/Grep/Node。⚠️ **PowerShell 工具当前不回传 stdout** ⇒ 取数据一律走 Node。

## 无头验证（唯一可行路线）
- playwright / puppeteer 未装；Edge `--headless --screenshot` 静默失败。
- **CDP 直驱系统 Edge，零 npm 依赖**：`msedge --headless=new --enable-unsafe-swiftshader --remote-debugging-port=N`
  （`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`），Node 内置 `WebSocket` 手写客户端
  （`/json/list` → `Runtime.evaluate(returnByValue)` → `Input.dispatchMouseEvent` → `Page.captureScreenshot`）。
  参考 `.workbuddy/tmp/e2e_adjust_cdp.js`、`.workbuddy/tmp/dev/cdp_moon_dev.js`（均自带静态服务）。
- 大文件注入：page 内 `fetch → new File → new DataTransfer → dispatchEvent('drop')`。
- 错误收集 `Runtime.exceptionThrown` + `Log.entryAdded`；**favicon 404 要白名单**。
- `pngstat.js`：纯 `zlib` 手写 PNG 解码 + 逐像素 diff + 16×16 粗格签名（不装 PIL）。
- ⚠️ JS 合成的 `PointerEvent` 不被 OrbitControls 接受 ⇒ 交互必须用 CDP `Input.dispatchMouseEvent`。
- ⚠️ CDP `mouseWheel` 对某些面板不可靠 ⇒ 量级验证走状态钩子。
- ⚠️ **断言禁"非零即过"**：交互量级 bug 必须拿对照实现实测值当期望，每条通道独立断言。
- ⚠️ 测量前必须 `settle()`（轮询到连续两次返回值相同再读）；oracle 与"性质成立条件"**同帧**。
- 像素级自证比截图 diff 便宜：`ctx.getImageData` 读关键点颜色直接断言（如月相章 #eaba56 → [234,186,86]）。

## 沙盘战争（_pages/sandbox_war_game.html）
- 单位是 **DOM+CSS**（非 canvas）：`.unit` → `.unit-body`（`scale(var(--scale))`）→ 配件 div；
  配件 HTML 由 `GameObject.getDisplayMarkup()` 拼；两层都**无 `overflow:hidden`**。
- 换算：1 个 `.unit-body` CSS 单位 = `--scale` 屏幕像素（士兵 0.636 / 坦克 0.611）。
- `.projectile` 按 `visual` 定尺寸（missile 6×14 / drone 4×12 / bullet 3×(size+4)）；**配件坐标相对 padding box**。
- 地形配色跨度大 ⇒ 移动物一律**暗色轮廓**，禁纯浅色镶边。
- 无朝向载具：`fixedHeading=true` 生效 3 处（锁角度/跳过对准/跳过推斥），**保留 `isTracked=true`**（仅弹道/巡航导弹）。
- 验证脚本：`missile_geometry.js` / `trail_harness.js` / `heading_harness.js` / `build_missile_preview.js`；
  回归 = CSS 括号平衡 + `node --check` + 27 单位类实例化。**改单位渲染/行为必跑 `heading_harness.js`**。

## 高斯对比（_pages/splat-compare.html）
### 库级硬约束（gaussian-splats-3d v0.4.7 + three r185）
- **必须 `gpuAcceleratedSort: false`**（否则 worker uploadedSplatCount=0 → 黑屏）；**必须 `antialiased: true`**（否则薄层高斯出漂移黑斑，09-12 A/B 定案）。
- **变换必须放 splatGroup（THREE.Group）级**，改 scene0 无效。
- 渲染循环每帧 `controls.update()` + 末行 `lookAt` ⇒ **相机横滚恒 0**，只有 position/target/up 能持久。
- 朝向变化必须强制重排：`applyGroupTransform` 里 `updateMatrixWorld(true)`；`runSplatSort` 会静默丢弃（L14071）
  ⇒ 用 `panel.sortDirty` 补跑，`tryResort` 放 `render()` 之后。
- 滚轮挡 OrbitControls 必须挂**捕获阶段**；缩放抄 `getZoomScale()=pow(0.95,zoomSpeed)`。
- 顶层标识符**不要命名 `zf`**（vendor TDZ 坑）。

### 现行交互架构（三条定案，别回退）
1. **单独调整 = 共同基准 ⊕ 私有偏移**（`mainCameraState` ⊕ `panel.camOffset`）；退出单独调整=无操作（反算幂等）。模型侧调正变换已全删。
2. **上下翻转 = 每面板 `panel.flipped`**（模型侧 quaternion 绕 X 180°，非全局布尔）；`forceResort` + `syncFlipButton()`；钩子 `__flip`。
3. **平移广播「屏幕像素意图」**(dx,dy)：各面板按自身相机换回世界位移，私有 dTarget 绝对值演化 ⇒ 不漂移。
   世界→像素必须用源面板**变化前**的 `panBasis`。
- 探针 `__project` / `__debugCameras` / `__lastBroadcast` / `__mixChange`。
- 回归：`unify_semantics.js`(26) / `pan_sync.js`(12) / `flip_panel.js`(17) / `check_splat_compare.js`(51+11)。旧 link_sync / adjust_isolation / adjust_freeze 作废。
- ⚠️ `.workbuddy/tmp/` 被 `.gitignore` 忽略，探针脚本一清就丢，**别把长期依赖放这里**。

## 日志时间轴（_pages/diary_tree.html）
- **定案规格见 `_design/diary_tree_redesign.md`**（含 11 条被否决方案，改版前必读）。
- 已定案：分段堆叠柱（柱高∝字数·线性·分母=全局单日最大×0.35·超出截平：柱体缩短1.6px+上方浮窄线）
  + `k=scale/fitScale` 驱动 LOD + 单击月卡进原位浮层（真月历7×6+当月目录）+ 日详情单栏长文
  + paper 基调 + 36px 全宽 HUD + 图例变分类筛选。搜索放二期。
- **月相章（2026-09-15 定案落地，commit 46f450b）**：替代满月方章。`stats.dayRatio`=有日志天数/当月天数，
  `drawMoonSeal()` 画在月卡右上角（内缩 3px，r=6，章径 12px）：
  蜜色亮面 `#e3b34e`（满月盘 `#eaba56`）朝右上 45°，阴影圆从左下咬入，覆盖率=双圆透镜面积二分反解 `moonSealSolveX(c)`；
  满月加金橙中晕（`rgba(255,196,110,.5)`，2.35r）；新月只画轨道环。统计文字让位 17px（hasEntries 常驻）。
  浮层题头 `has-moon` + `moonPhaseName(ratio)`（新/娥眉/半/凸/满），`.mf-seal i` 圆盘蜜色+光晕。
  设计预览 `.workbuddy/tmp/seal_preview/moon_phases_v2.html`（色板与暖晕档位可复用于调参）。
- ⚠️ 两个坑：① **中文正文字体栈必须 ≥2 候选**（本机无 Songti SC，只写一个静默退化）；② 柱顶装饰必须与「分段」语义区分。
- **dev 验证链路**（页面需密码解密，本机无法端到端）：`make_dev.js` 生成 dev 副本
  （① Liquid `window.files` 块正则替换成空数组——浏览器不认 `{% %}` 且报错会连带主脚本不执行；
  ② unlock handler 整段正则替换为顶层立即执行块）。坑：CRLF 下 `indexOf('\n')` 少吃 `\r`；跨 handler 替换要补闭合 `};`。
  CDP 驱动 `cdp_moon_dev.js`（探针+截图）/ `cdp_moon_deep.js`（像素自证+浮层点击）。
- 遗留：① `DENOM_RATIO=0.35` 拿真实数据核对（控制台/顶栏显示标尺）；② 真月历写死 6 行（redesign 文档第 4 节）。

## 日志工具页（_pages/text_processor.html · enc_reader.html）
- **三页共享样式 = `assets/css/diary-tools.css`**（2026-09-16 立）：token / 控件 / 卡片 / 状态 /
  **内容语义色** / 响应式全在这一个文件；两页 `<link>` 引入，页面 `<style>` 只留各自布局
  （`--page-max`：text_processor 1120 / enc_reader 880）。改配色改这里，三页同步。
- 视觉基调 = diary_tree 暖纸：`--accent #b86944` / `--bg #f7f4ee` / `--radius 20px` / 胶囊按钮。
- **内容语义色唯一来源 = diary_tree 的 `categoryColor()`**：leisure `#d35f05` / dream `#8A2BE2` /
  video `#0056b3` / review `#0d9488` / normal `#4a90e2`。`.date-highlight` 原本三页三色
  （暖褐/蓝/靛蓝），已统一到 `var(--accent)`，enc_reader 的 `.btn-date` 同步。
- **四个高亮类三页逐属性同值**（2026-09-16 实测 7 属性 × 4 类全绿）：字重 `600`、回顾条
  `3px solid` + `padding-left: 6px`、背景 `rgba(13,148,136,.10)`。全站只有两处定义
  （`diary-tools.css` 全局 + `diary_tree` 的 `#info-popup .popup-preview` 作用域），
  **改色必须两处同改**，两处已加注释互相指向。验证脚本 `.workbuddy/tmp/unify/verify_hl.js`
  （往各页容器注入同一段结构，读计算样式逐属性比对）。
- 正文兜底字号三页统一 `14px`（enc_reader 的 `.output` 原 15px 已改）；`.date-highlight`
  字号**有意**不同（工具页 20px / 时间轴继承 14px），不是漏改。
- 共享语义类：`btn-ghost`(次级描边胶囊) / `btn-danger` / `panel`+`panel-accent` / `surface` / `guide`；
  取代各页自造的 step-button / copy-button / reset-button。
- ⚠️ **坑 1**：JS 里 `el.className = '...'` 整体覆写会**静默冲掉**后加的类（text_processor 的
  `outputPreview` 有 3 处，已补 `surface`）；共享 CSS 的 `.surface` 上有注释提醒。
- ⚠️ **坑 2**：窄屏只写 `min-width: 0` 会让 `.content-area` 的两个 `flex:1` 硬挤一排（正文成竖条），
  必须显式 `flex-direction: column`。
- 验证链路 `.workbuddy/tmp/unify/verify.js`：CDP 自带静态服务，**root=仓库根 + `_pages/` 兜底 +
  剥 front matter/Liquid**（否则页面在 `_pages/` 下会 404，且直服源文件会漏出 front matter）。
  两页 19 项计算样式逐项比对 + 桌面/390px 截图。
- **正文规格三页统一**（2026-09-16 定案）：宋体 16px / 行高 1.95 / 段距 8px / 首行缩进 2 字，
  与 diary_tree 的 `#info-popup .dsec-body` + `.dpara` **逐属性同值**。已知代价（用户知情选择）：
  text_processor 「复制结果」复制的是 DOM 选区，粘进 Word 会带 16px 宋体，不再是五号字。
  输入/输出区高度同步 400→520px（行高近翻倍后 400px 只剩 9 行）。
- ⚠️ **坑 3**：正文行高/段距曾被 JS 内联写死（`newP.style.lineHeight='1.0'` + marginTop/Bottom
  `'0.5em'`，两页各 3 行），会盖掉 `.preview-content` 的 CSS —— 改正文规格必须一并删掉，
  否则只有静态注入才"看起来生效"，真跑流程时被打回。
- ⚠️ **既有隐患（未修）**：enc_reader 的 `oneKeyFormat()` 用**游离 div 的 `innerText`** 分行，
  而游离元素 `innerText === textContent` —— p 之间没有字面换行符时多段会被粘成一行。
  真实数据（解密月文件 / 带换行的粘贴）不暴露；text_processor 的同名步骤是分步实现，无此问题。
- 验证脚本（均在 `.workbuddy/tmp/unify/`）：`verify_hl.js`（高亮 7 属性×4 类×3 页）、
  `verify_body.js`（正文 7 属性，**三页各走真实渲染路径**，含真跑 processAll / oneKeyFormat）、
  `capt_hl.js` / `capt_body.js`（对照图）。注：`captureScreenshot` 的 `clip.scale` 必须为 1
  （与 deviceScaleFactor 叠加会错位）；recipe 是模板字符串，**注释里不能出现裸反斜杠 n**（会截断注释）。
- **text_processor 的「1. 字体设置」已删**（2026-09-16）：它实际只做两件事 —— 给输出容器挂
  `.preview-content` + 把输入区文本原样搬进输出区；而「段落格式」给每个 `<p>` 挂同一个类，
  字体表现完全等效，且它写进输出区的内容在 processAll 里会被下一步**从输入区重读**丢弃（空转）。
  现由「段落格式」兼挂容器类；按钮编号重排 1–4，说明同步（并删掉早已不存在的「快速导航」条目）。
  ⚠️ 排查同类冗余的原则：按钮的**字面名 ≠ 实际做的事**（"字体设置"从不设置字体，规格一直在 CSS），
  判断依据 = 它改了哪个状态 + 后续步骤从哪读数据。
- **text_processor 也有一排分类标注按钮**（2026-09-16）：输出区改为 `contenteditable`，移植 enc_reader 的
  `formatSelection()`；工具条 `.mark-tools` 放在「处理结果」标题下（必须紧贴它作用的输出区）。
  样式（`.format-btn` / `.btn-*` / `.mark-tools`）**已从 enc_reader 页面抽到共享 `diary-tools.css`** ——
  两页 6 个按钮配色实测逐属性一致（enc_reader 多一个「一键格式化」，其对应物是 text_processor 步骤区的
  「一键处理全部」，属预期差异）。
- ⚠️ **修掉一个两页共有的既存 bug**：`formatSelection` 用 `createTreeWalker(range.commonAncestorContainer)`
  遍历文本节点，而 **`nextNode()` 只返回 root 之后的节点、不含 root** —— 当选区完全落在**单个文本节点**内
  （"选中几个字"最典型）时 root 就是那个文本节点，遍历结果为空，整个操作**静默失效**。两页均已显式补收 root。
- 未改的行为（与 enc_reader 保持一致）：上色是**节点粒度**（选中几个字会把整个文本节点染色）；清色只在
  选区**包含 span 标签本身**时生效。要精确到选区需重写该函数，本次未做。
- 注：输出区上方多了工具条，比输入区晚 80px 起算（两栏底部不再齐平），有意保留。

## 站点 crescentvelvet.github.io（Jekyll + minimal-mistakes 内联）
- 主题内联（`_config.yml` 无 theme:），**颜色唯一来源 = `_sass/_variables.scss`**。
- 资产引用：`href`/图片/og:image → `{{ base_path }}`；本地加载 CSS/JS → `{{ '...' | relative_url }}`（别混）。
- 页面 front matter 需 `author_profile: false`（否则空侧栏）+ `classes: wide`（放宽容器，自加分支）。
- 首页 `_pages/about.md` 内联代码**必须从第 0 列开始**（kramdown 缩进=代码块）。
- 布局底账：`#main` max-width 925px（wide:1112px），`.page` padding 比例见 09-15 日志；首页卡片网格 `minmax(122px,1fr)`+`gap:18px` 绑死；**加 1px 描边要同步减 1 padding**。
- ⚠️ `main.min.js` greedy-nav：`#site-nav` 缺席 ⇒ 每次加载必栈溢出。**做法**：保留节点，`height:0;overflow:hidden` 折叠页头。
- 站点验证资产（仅本机 tmp）：`icons_e2e.js` / `ripple_card.js` / `fx_card.js` / `site_smoke.js` / `check_card_css.js` / `shot_home.js` 等，均支持 `E2E_SITE`。
