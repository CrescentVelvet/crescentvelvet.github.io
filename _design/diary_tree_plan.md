# 日记时间轴 — 设计方案

## 1. 概述

在 `_pages/diary_tree.html` 新建一个独立子网页，用蜿蜒的曲线时间轴展示加密日记。用户一次性输入主密码，全部解密后按年→月→日绘制成一条灵巧的曲线树状图，支持缩放、平移、点击查看详情。

**访问路径:** `/diary_tree.html`

## 2. 数据流

```
assets/data/*.txt (17个加密文件)
        ↓ fetch + AES 解密
   解密后的文本内容
        ↓ 正则解析日期（YYYY-MM-DD）
   树结构: Year { Month { Day[] } }
        ↓
   Canvas 渲染曲线时间轴
```

### 2.1 文件列表

通过 Jekyll Liquid 模板获取（与 enc_reader.html 相同方式）：

```
window.files = [
    {% for file in site.static_files %}
    {% if file.path contains '/assets/data/' and file.extname == '.txt' and file.name != 'encrypted_log.txt' %}
        '{{ file.name }}',
    {% endif %}
    {% endfor %}
];
```

### 2.2 解密

复用 CryptoJS（`/assets/js/crypto-js.min.js`）：

```js
const bytes = CryptoJS.AES.decrypt(ciphertext, password);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);
```

- 一次性解密所有文件
- 全部解密后界面才从"密码面板"切换到"时间轴视图"
- 解密失败则提示密码错误

### 2.3 日期解析

从解密文本中提取日期行。格式示例：

```
2024-01-15
2024-02-03
```

解析逻辑：
1. 匹配 `\b\d{4}-\d{1,2}-\d{1,2}\b` 格式的日期
2. 日期后面的内容归入该日
3. 当日内容前 200 字作为摘要预览
4. 统计当日字数、段落数

## 3. 布局设计——蜿蜒曲线时间轴

### 3.1 核心思路

使用 **Canvas** 绘制一条蜿蜒的蛇形（S形）曲线，左侧为时间起点（最早的年份），右侧为终点（最新的年份）。

```
视觉布局（约6:1宽高比的画布）：

  年2024                          年2025                          年2026
  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
  │ 2024-01 ● ● ●        │  │ 2025-01 ● ● ●        │  │ 2026-01 ● ● ●        │  ← 同月份对齐
  │ 2024-02 ● ● ● ●     │  │ 2025-02 ● ● ●        │  │                      │
  │ 2024-03 ● ●          │  │ 2025-03 ● ● ● ●     │  │                      │
  │ ...                   │  │ ...                   │  │                      │
  │ 2024-12 ● ● ● ●     │  │ 2025-12 ● ● ●         │  │                      │
  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
         ↑                            ↑                          ↑
    年份色带                    年份色带                   年份色带
```

**关键点：**

- **年份**为列：从2018到2025，每列宽度 = 画布宽度 / 年份数
- **月份**为行：一列内从上到下排列12个月，每月高度 = 画布可用高度 / 12
- **日期**为小圆点：在同一个月区域内水平散布
- **同月份跨年对齐**：比如所有1月都在各列最顶部，方便跨年对比
- **蛇形连接**：在年份之间用贝塞尔曲线蜿蜒连接，形成贯穿全图的时间线

### 3.2 节点视觉

| 类型 | 表现形式 | 大小 |
|------|---------|------|
| **年份节点** | 年份数字 + 半透明色带毛玻璃背景 | 整列范围 |
| **月份节点** | 月份数字 + 暖色渐变圆角矩形 | 60x24px |
| **日期节点** | 半透明小圆点 | 6-12px（按字数动态） |
| **曲线连接** | 贝塞尔曲线，半透明渐变描边 | 线条宽度 2px |

- **日期节点大小**：当日字数越多，圆点越大
- **月份节点颜色深浅**：当月日记总数越多，颜色越饱和
- **年份色带**：`hsla(year * 30, 40%, 80%, 0.15)` 逐年渐变

### 3.3 整体曲线

一颗 **蛇形蜿蜒曲线** 串起所有年份列：
- 从画面左侧中间进入
- 依次穿过每年的中间位置
- 用贝塞尔曲线 `quadraticCurveTo` 或 `bezierCurveTo` 平滑连接
- 在每年列内呈细微波纹，按月起伏
- 最终收尾于画面右侧

## 4. 交互方式

### 4.1 缩放（Zoom）

| 触发方式 | 行为 |
|---------|------|
| 鼠标滚轮 | 以鼠标位置为中心缩放 |
| 手机双指捏合 | 缩放（Canvas 原生 touch 事件） |
| 缩放范围 | 0.5x ~ 8x |
| 缩放下限 | 只看年份柱状图，月份数字隐藏 |
| 缩放上限 | 日期圆点清晰可见，可点击 |

实现：维护 `transform = { x, y, scale }`，用 Canvas `ctx.setTransform()` 渲染。

### 4.2 平移（Pan）

| 触发方式 | 行为 |
|---------|------|
| 鼠标拖拽 | 按住拖拽平移 |
| 手机单指滑动 | 滑动平移 |
| 边界弹性 | 超过边界有弹性回弹效果 |

### 4.3 点击日期节点

- 点击一个日期小圆点 → 弹出浮动详情卡片
- 卡片包含：
  - **日期标题**（如 2024年1月15日）
  - **内容预览**（前200字，保留文本，无需HTML标签）
  - **统计**：当日字数、段落数、分类标签（闲情逸致/梦幻空花/视频想法/回顾）
- 点击空白处或关闭按钮 → 收起卡片

### 4.4 手机优化

| 功能 | 实现方式 |
|------|---------|
| 双指缩放 | `touchstart` → 记录两指距离，`touchmove` → 计算缩放比例 |
| 单指滑动 | 同上，单指时平移 |
| 点击节点 | `touchend` 判断是否点击（如移动距离 < 5px）触发点击事件 |
| 长按提示 | 节点上加"缩放提示"或初次访问提示 |

## 5. 视觉风格

### 5.1 配色

- **背景**：`#f8f9fa` 浅灰（与 enc_reader 一致）
- **年份色带**：`hsla(各年色相, 30%, 85%, 0.2)` 微弱渐变
  - 色相循环：210(蓝) → 270(紫) → 330(粉) → 30(橙) → 90(绿) ...
- **月份条**：`hsla(20, 80%, 60%, 0.3)` 暖橙，月份数字白色
- **日期圆点**：按分类着色
  - 闲情逸致 → `#d35f05`（橙）
  - 梦幻空花 → `#8A2BE2`（紫）
  - 视频想法 → `#0056b3`（蓝）
  - 其他 → `#4a90e2`（默认蓝）
- **曲线**：`rgba(74, 144, 226, 0.4)` 淡蓝半透明，渐变为 `rgba(138, 43, 226, 0.4)` 紫色
- **光晕效果**：曲线下方用 `shadowBlur` 或 `createRadialGradient` 做微弱光晕

### 5.2 排版

- 年份数字：24px 粗体，深灰色
- 月份数字：14px 正常，白色或浅色
- 日期提示：鼠标悬停时显示日期文本，10px 浅灰
- 中文显示：`"Microsoft YaHei", "Segoe UI", Arial, sans-serif`

### 5.3 响应式

- 画布填满窗口（`canvas.width = window.innerWidth`, `height = window.innerHeight`）
- 元素尺寸根据 scale 缩放
- 手机端缩放按钮（+/-）放在角落
- 最小字号限制（防止缩太小看不清）

## 6. 页面结构

```
┌─────────────────────────────────────────┐
│  #auth-overlay  (密码遮罩层)             │
│  ┌──────┐                              │
│  │ 密码  │                              │
│  │ 输入  │  → 解密全部文件 (显示进度)    │
│  └──────┘                              │
├─────────────────────────────────────────┤
│  #tree-container  (时间轴容器)           │
│  ┌──────────────────────────────────┐   │
│  │  Canvas 曲线时间轴 (全屏)         │   │
│  │  · 左右平移 / 缩放               │   │
│  │  · 点击节点弹出详情               │   │
│  └──────────────────────────────────┘   │
│  ┌──缩放控制──────┐                     │
│  │  [-] [重置] [+] │                     │
│  └────────────────┘                     │
└─────────────────────────────────────────┘
```

### 6.1 HTML 结构

```html
<!-- 密码遮罩 -->
<div id="auth-overlay">
    <div class="auth-card">
        <h1>日记时间轴</h1>
        <p class="subtitle">输入密码查看日记时间线</p>
        <input type="password" id="password" placeholder="请输入解密密码">
        <button id="unlockBtn">解锁时间轴</button>
        <div id="auth-status"></div>
    </div>
</div>

<!-- 时间轴画布 -->
<canvas id="treeCanvas"></canvas>

<!-- 缩放控制 -->
<div class="zoom-controls">
    <button id="zoomOut">−</button>
    <button id="zoomReset">⊙</button>
    <button id="zoomIn">+</button>
</div>

<!-- 详情弹窗 -->
<div id="detail-popup" class="hidden">
    <div class="popup-content">
        <span class="close-btn">×</span>
        <h2 id="popup-date"></h2>
        <div id="popup-stats"></div>
        <div id="popup-preview"></div>
    </div>
</div>
```

## 7. JavaScript 模块

### 模块清单

| 模块 | 职责 |
|------|------|
| **1. AuthModule** | 密码输入、文件获取、解密、数据解析 |
| **2. DataModule** | 日期解析、树结构构建、统计计算 |
| **3. TreeRenderer** | Canvas 渲染曲线时间轴 |
| **4. InteractionHandler** | 缩放、平移、点击事件处理 |
| **5. DetailPopup** | 详情弹窗显示 |

### 7.1 AuthModule

```javascript
async function unlockAll(password) {
    // 1. 遍历 window.files
    // 2. fetch 每个 .txt 文件
    // 3. CryptoJS.AES.decrypt 解密
    // 4. 收集所有解密文本
    // 5. 解析日期构建树结构
    // 6. 隐藏密码遮罩，显示时间轴
}
```

### 7.2 DataModule

```javascript
function buildTree(decryptedContents) {
    // 每个月每篇内容 = { date, text, wordCount, categories }
    // 按 year → month → day[] 组织
}

function parseEntries(text) {
    // 正则提取 YYYY-MM-DD
    // 每条 = { date, content }
    // 统计字数
    // 识别分类标签（闲情逸致/梦幻空花/视频想法等）
}
```

### 7.3 TreeRenderer（核心）

```javascript
class TreeRenderer {
    constructor(canvas) { ... }
    
    setData(tree) { ... }
    
    render(transform) {
        // 1. 清空画布
        // 2. 绘制年份色带
        // 3. 绘制月份标签
        // 4. 绘制蛇形曲线
        // 5. 绘制日期节点
    }
    
    // 布局计算
    getYearColumn(year) { /* 年份对应列位置 */ }
    getMonthRow(month) { /* 月份对应行位置 */ }
    getDayPosition(year, month, day) { /* 日期对应坐标 */ }
}
```

### 7.4 InteractionHandler

```javascript
class InteractionHandler {
    constructor(canvas, renderer) {
        // mousewheel → zoom
        // mousedown+mousemove → pan
        // click → hitTest → showDetail
        // touchstart+touchmove → zoom/pan
    }
    
    hitTest(x, y) {
        // 检查点击位置是否在某个日期节点上
    }
}
```

## 8. 实现步骤

### Step 1: 创建 HTML 页面骨架
- Jekyll front matter
- 密码遮罩层
- Canvas 容器
- 缩放控件
- 详情弹窗
- 加载 CSS

### Step 2: 实现密码认证和数据加载
- 扫描文件列表（Liquid）
- 一次性输入密码 + 进度提示
- 解密全部文件
- 构建树数据结构

### Step 3: 实现基本 Canvas 时间轴渲染
- 年份列布局
- 月份行布局
- 日期节点渲染
- 蛇形曲线绘制

### Step 4: 实现缩放和平移
- 鼠标滚轮缩放
- 鼠标拖拽平移
- 触屏双指缩放 / 单指平移
- 缩放按钮

### Step 5: 实现节点交互
- 点击日期弹出详情
- 详情卡片样式和内容
- 关闭按钮

### Step 6: 响应式优化
- 手机端测试
- 触摸事件完善
- 字号和节点大小自适应

### Step 7: 测试和调优
- 所有文件解密是否正常
- 日期解析是否完整（特别注意跨年、只有月份没有日期的行）
- 曲线是否流畅美观
- 缩放平移是否自然

## 9. 技术限制

- **纯前端**：无 Node.js 后端依赖
- **CryptoJS**：使用现有 `/assets/js/crypto-js.min.js`
- **文件大小**：全部解密后约 5-6 MB 文本，在内存中一次性加载
- **性能优化**：Canvas 使用 `requestAnimationFrame` 渲染，离屏 Canvas 缓存静态元素

## 10. 未定（后续可以增加）

- 搜索功能（在当前页面搜索日记内容）
- 分类筛选（只显示"闲情逸致"或"梦幻空花"的日期节点）
- 导出选定范围的时间轴截图
- 动画入场效果
