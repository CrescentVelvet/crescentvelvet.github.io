# 项目长期记忆

> 只留「硬约束 + 已定案」。过程与教训在 `.workbuddy/memory/YYYY-MM-DD.md`。
> 2026-10-23 大精简（15.8KB→本版），旧版全文存档于 `2026-10-23.md` 末尾。

## 通用约定
- commit 前缀 = 子网页名；中文一行标题 + ≤2 行正文；**AI 不得 push**；memory 日志与改动同一提交。
- 只 `git add` 明确路径，**禁止 `git add -A`**；**同一文件禁止同消息并发多个 Edit**（串行改，改完 Grep 确认）。
- 托管 Node：`.../node/versions/<先 ls 查版本>/node.exe`；本机无 coreutils ⇒ 用 Glob/Read/Grep/Node。
- ⚠️ **禁止 PowerShell 管道取 git 对象/UTF-8 内容**（cp936 乱码）：`execSync('git show …',{encoding:'utf8'})`；commit message 用 `-F <UTF-8 文件>`。
- 重构 memory 文件前确认 `git status --porcelain` 干净。

## 无头验证（skill `cdp-browser-e2e`）
- 错误收集必须含 `Runtime.consoleAPICalled`（three shader 错误走 console.error、不进 Log.entryAdded）；favicon 404 白名单。
- 交互必须 `Input.dispatchMouseEvent`（合成 PointerEvent 不被 OrbitControls 接受）；断言用对照实测值，测量前 settle。

## 高斯对比（_pages/splat-compare.html）
- 库 v0.4.7 + three r185：**`gpuAcceleratedSort:false`**（否则黑屏）、**`antialiased:false`**（true 压低薄 splat 不透明度 ⇒ 侧视角头发/眼睛蓝绿雾块，10-23 定案）、**`sphericalHarmonicsDegree:3`**、**`splatSortDistanceMapPrecision:20`**、fov **60**、背景 `#222233`、变换必须放 **splatGroup 级**。
- ⚠️ vendor 本地补丁：degree 3 **15 处** + sort gate（8.11°→0.5°）**1 处** + eigen clamp（下限加在 λ2 本身）**1 处**；升级 vendor 必须全部重打（`grep -c "LOCAL PATCH"` 校验）。GLSL 注释**禁反引号**。
- 朝向/变换变化须 `updateMatrixWorld(true)` + `sortDirty` 补排；每帧 `controls.update()`+`lookAt` ⇒ 横滚恒 0；滚轮拦截挂捕获阶段；顶层标识符**禁 `zf`**（vendor TDZ）。
- 复现渲染问题先把相机拉到真实观察距离（脸 d≈1.2），近景 A/B diff 恒 0 会误导。
- 释放链（10-23 已修）：`removePanel`/`loadPlyToPanel` 均 `renderer.dispose()`+**`forceContextLoss()`**（否则 context 等 canvas GC、易撞 Chrome 单域 ~16 上限）；blob URL 在 try 外创建、catch 也 revoke。⚠️ 上游缺陷未修：loader `loadPromise` 只有 resolve 没有 reject ⇒ 坏文件面板**永远停 loading**（待页面侧超时兜底）。回归 `.workbuddy/tmp/splat_mem/e2e.js`（19 断言）。
- 探针 `__project/__debugCameras/__flip/__perfState`；回归 `check_splat_compare.js`/`unify_semantics.js`/`pan_sync.js`/`flip_panel.js`。

## 算法框图（flow_chart.html）
- line-art：无衬线标注（中文 ≥2 候选）、白底 1px、颜色仅 10% 淡染、线稿默认；测量字体必须与渲染字体一致。探针 `window.__flow`。

## 沙盘战争（sandbox_war_game.html）
- DOM+CSS 单位两层均无 overflow:hidden；移动物一律暗色轮廓；改单位渲染必跑 `heading_harness.js`。

## 日志时间轴（diary_tree.html）
- 规格必读 `_design/diary_tree_redesign.md`（含 11 条否决案）；月相章 `drawMoonSeal()` 蜜色 `#e3b34e`；中文字体栈 ≥2 候选；dev 副本 `make_dev.js`。

## 日志工具页（text_processor.html · enc_reader.html）
- 共享样式唯一来源 `assets/css/diary-tools.css`；语义色唯一来源 diary_tree `categoryColor()`（高亮类全站两处定义，**改色两处同改**）；正文宋体 16px/行高 1.95/段距 8px/缩进 2 字。

## 待办清单（todo_list.html）
- 四态含 dropped（仅叶子可逆、空心虚线）；父节点无状态。密文 `assets/data/todo_list.enc`，明文不进 git；权威迁移 `tools/encrypt_todo.js`；回归 `todo_enc_e2e.js`。⚠️ 取 `.bubble`/`.lbl` 必须 `:scope >`。

## 站点（Jekyll + minimal-mistakes 内联）
- 颜色唯一来源 `_sass/_variables.scss`；本地资源 `relative_url`；页面 front matter `author_profile: false` + `classes: wide`；about.md 内联代码从第 0 列起；`#site-nav` 必须保留（折叠），否则 greedy-nav 栈溢出。

## 论文调研（paper_retrieval.html）
- 深色 token 抄 media_paper 报告页，**不引入 diary-tools.css**，自声明 box-sizing；隐藏 `#page-last-modified`（adoptStamp 挂 DOMContentLoaded+load）；目录解析自索引页链接；镜像 raw→jsdelivr 单试 8s。
