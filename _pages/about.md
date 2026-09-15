---
permalink: /
title: "欢迎来到网站"
excerpt: "个人工具与小游戏合集入口"
author_profile: false
# wide：放宽正文容器。默认 .page 在 >=925px 是 span(10/12)+prefix(0.5/12)+suffix(2/12)，
# 右侧 16.95% 是纯留白，1280px 视口下正文只有 770px。主页是卡片网格，用不上窄栏。
# 取值与推导写在 _sass/_page.scss 的 body.wide 段里（上限在 _variables.scss 的 $page-wide-max）。
classes: wide
redirect_from: 
  - /about/
  - /about.html
---
<style>
    /* 主题色令牌。取值全部来自 _sass/_variables.scss（主题唯一的颜色源），本页是内联 CSS、
       拿不到 SCSS 变量，故集中在这里声明成自定义属性 —— 以后要换肤只改这一处，不用翻样式。
         --accent  = $info-color（同时也是 $link-color）
         --ink     = $text-color（= $dark-gray = mix(#000,$gray,40%)）
         --line    = mix(#fff,$gray,65%)。**不能直接用主题的 $border-color(#f2f2f3)**：
                     那是给 <hr> 这类分隔线用的，白底(#fff)上当卡片描边几乎看不见，卡片立不起来。
                     实测对比过 4 档深浅（.workbuddy/tmp/variants_card.js 出图），65% 这档
                     边界清晰又不显得重；再深会偏"灰旧"，再浅就回到看不见。
                     想让卡片更轻/更重，只改这一个值即可，不影响任何布局。 */
    /* --glow 用 @property 注册成 <number> 类型：
       ① 有了 initial-value，即使 JS 没写过也有确定的 0（未注册的自定义属性在
          calc() 里缺失会让整条 background-image 变成 invalid-at-computed-value-time，
          退回 none —— 那样卡片就没有渐变层了）；
       ② 类型化后浏览器能正确参与插值与计算。
       不支持 @property 的浏览器会忽略这段，由下面 .link-button 里的 --glow: 0 兜底。 */
    @property --glow {
        syntax: '<number>';
        inherits: true;
        initial-value: 0;
    }

    :root {
        --accent: #52adc8;
        --ink: #494e52;
        --line: #d0d3d5;
        --card-bg: #fff;
        --card-bg-hover: #f5fafc;
        --card-bg-active: #edf5f8;
        --card-shadow-hover: 0 3px 10px rgba(73, 78, 82, 0.10);
        --ripple-color: rgba(82, 173, 200, 0.20);
        /* 光效参数。前四个都由 JS 读出来用（见脚本顶部），改这里就能同时改两侧 */
        --spot-alpha: 0.22;                    /* 光标正下方那张卡的高光强度上限 */
        --spot-size: 160px;                    /* 单张卡内高光的渐变半径 */
        --glow-radius: 340px;                  /* 光照衰减半径，超出即完全不亮 */
        --tilt: 4deg;                          /* 最大倾角 */
    }

    /* 入口卡片网格。.link-button 只在本页 .button-grid 内出现（全站范围已确认），
       原来的 a.link-button / a.link-button:hover 基类被下面两条 .button-grid 规则逐属性全覆盖
       （唯一"生效"的 margin: 5px 0 又与 grid 的 gap 语义重复），已删 */
    .button-grid {
        display: grid;
        /* 下限 122px 与列间距 18px 是绑在一起按实测反推的，单独改任一个都会掉列。
           卡片内容盒需要 106px = 图标盒 16 + 图标右距 4 + letter-spacing 1 + 最长标签 5 汉字 85px
           （实测见 .workbuddy/tmp/measure_parts.js；汉字在 16px 字号下步进就是 16px，这个数很稳定）。
           · 列间距 18px（原 24px）：正文栏在 960~1200px 视口只有 549.98px
             （span(10/12)+suffix(2/12) 造成的既有塌缩，实测见 .workbuddy/tmp/diag_grid.js）。
             4 列时每列 (549.98-3×18)/4 = 124px，减 padding 16 ⇒ 内容盒 108px，余量 2px。
             若保持 24px：每列 119.5px ⇒ 内容盒 103.5px < 106px，必然换行。
           （卡片改成描边式后横向 padding 7px + border 1px，合计仍是 16px，故上面这条算式不变）
           · 下限 122px：6×122+5×18 = 822 > 814 ⇒ 850px 视口只有 5 列 —— 这是**有意为之**：
             850px 下若要 6 列，每列仅 120.66px、内容盒 105px < 106px，实测恰好是
             「大模型对话」「数据库解析」这两张 5 字卡换行（见 verify_850.js）。
             宁可该视口用 5 列（卡片 148px，余量 26px）也不要换行。
           下限也不能再往下调：卡片内容本身就要 106px + padding 16 = 122px。
           实测校验：diag_grid.js（逐视口列数与余量）+ icons_e2e.js（换行/溢出断言） */
        grid-template-columns: repeat(auto-fit, minmax(122px, 1fr));
        gap: 18px;
        margin: 30px 0;
        padding: 0;
    }
    /* 卡片本体：白底 + 1px 描边。**不用投影**——页面底色本来就是纯白($background-color:#fff)，
       靠一条描边区分边界比投影更干净，也和主题其它地方（hr / code 边框）的语言一致。
       padding 从 14px 8px 改成 13px 7px 是有意的：补上 1px 描边后，
       横向合计仍是 8px、纵向仍是 14px ⇒ 卡片外框尺寸与内容盒宽度**完全不变**，
       上面那套列数算式不需要重算。
       transition 逐属性列出而不是 all：避免将来新增属性时被意外插值。

       ── 光效模型：一个虚拟光源，不是每张卡自己开关 ──
       渐变写在**基类**而不是 :hover 里，强度由 --glow(0~1) 决定：
       JS 按"卡片中心到光标的距离"给**范围内的每张卡**写 --glow，超出 --glow-radius 的写 0。
       于是光标下的卡最亮、邻卡按距离依次减弱 —— 整片网格像被同一盏灯照亮，
       而不是 19 个各亮各的独立部件。这正是参考 Apple 那种"光洒在整排图标上"的关键：
       **非悬停的邻卡只被点亮，绝不改描边/底色/位移**，否则"我马上要点哪张"的指示就被糊掉了。
       光的局部坐标（--mx/--my）逐卡不同：同一光源在左邻卡上落在其右边、在上邻卡上落在其下边，
       这个差异正是"单一光源"错觉的来源。
       color-mix 从 --accent 派生透明度，避免把 RGB 再抄一遍。
       ↔ 改动须知：background-image 一旦在这里出现，下面其它规则就**只能**用 background-color，
         用 `background:` 简写会把渐变静默重置成 none（按下时高光消失就属这类）。 */
    .button-grid .link-button {
        display: block;
        position: relative;  /* 水波纹的定位父级 */
        overflow: hidden;    /* 把波纹裁在卡片内，不让它溢到白底页面上 */
        --glow: 0;           /* 不依赖 @property 的兜底（老浏览器没有 @property） */
        --mx: 50%;
        --my: 50%;
        text-align: center;
        font-size: 16px;
        font-weight: 500;
        padding: 13px 7px;
        background-color: var(--card-bg);
        background-image: radial-gradient(var(--spot-size) circle at var(--mx) var(--my),
                                          color-mix(in srgb, var(--accent) calc(var(--spot-alpha) * var(--glow) * 100%), transparent),
                                          transparent 70%);
        color: var(--ink);
        border: 1px solid var(--line);
        border-radius: 8px;
        text-decoration: none;
        letter-spacing: 1px;
        /* transform 单独用更短的时长（0.10s）：它同时承载 hover 上浮和 JS 逐帧写的倾斜，
           0.18s 会让倾斜明显滞后于鼠标。短过渡反而形成"阻尼跟随"的手感，比瞬时更耐看。
           其余属性保持 0.18s。 */
        transition: background-color 0.18s ease, border-color 0.18s ease,
                    box-shadow 0.18s ease, transform 0.10s ease-out;
    }
    /* 图标：Font Awesome 5 Free Solid，已随主题 main.css 全量加载，零额外请求。
       盒宽 16px 的作用是**布局单位**，不是裁剪框：它把 19 张卡的图标占位统一成 16px，
       内容宽才能稳定算成 106px。若改成 width:auto，占位会在 10.5~17.5px 之间浮动
       （字号的 0.75~1.25em，见 .workbuddy/tmp/glyph_width.js 实测），
       最坏情况需要 17.5+4+1+85 = 107.5px，而 960~1200px 视口只有 108px ⇒ 只剩 0.5px，太险。
       字号取 14px：FA 的 advance 是 0.3125em 整数倍，最宽的 1.25em 图标
       （fa-sitemap / fa-dice / fa-tv / fa-project-diagram / fa-fighter-jet）advance = 17.5px，
       比 16px 盒宽多 1.5px，居中后每侧溢出 0.75px。**这是可接受的**：
       字形向左右各画出去 0.75px，而图标盒右边还有 margin 4px + letter-spacing 1px = 5px 间距，
       不会碰到文字；把盒宽放大到 18px 才能完全包住字形，但那会让内容宽涨到 108px，
       960~1200px 视口的 4 列（内容盒 108px）必然换行 —— 得不偿失。
       不用 fa-fw：它强制 1.25em（=17.5px），同样会顶掉上面算好的下限。
       图标统一用 --accent 着色（19 张卡完全一致，不靠颜色区分主次 —— 这是刻意的，
       避免从外观上暴露哪些子页更重要）。
       图标只做装饰（文字已表意），故在 HTML 上标 aria-hidden="true" */
    .button-grid .link-button i {
        width: 16px;
        margin-right: 4px;
        font-size: 14px;
        text-align: center;
        color: var(--accent);
    }
    /* hover 只表达"这张是我马上要点的"：描边转强调色 + 底色微亮 + 上浮 + 投影。
       原来的"整块渐变换色 + scale(1.03)"是实心按钮的语言；卡片式里 scale 会让相邻卡片的
       描边在视觉上互相挤压，只上浮更干净。

       ⚠️ 高光**不在这里**，而在上面基类的 radial-gradient（由 --glow 驱动）。
       分两处是有意的：高光是"整片网格被同一盏灯照亮"，属于所有卡片的共同状态；
       而描边/底色/上浮是"选中反馈"，只该给光标下的那一张。
       若把高光也放到 :hover，邻卡就永远不会亮 —— 正是这次要修掉的问题。
       同样地，这里绝不能改 background 简写（会重置 background-image，高光整片消失）。 */
    .button-grid .link-button:hover {
        background-color: var(--card-bg-hover);
        border-color: var(--accent);
        box-shadow: var(--card-shadow-hover);
        transform: translateY(-2px);
        /* 只在下悬时提升为合成层，避免 19 张卡常态各占一层 */
        will-change: transform;
    }
    /* 键盘可达性：鼠标 hover 有反馈，Tab 也必须看得出落点。
       用 :focus-visible 而非 :focus —— 后者会让鼠标点击后残留一圈焦点框 */
    .button-grid .link-button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }
    /* 按压反馈：pointerup 的 click 之后浏览器立刻开始导航，:active 才是"确实点到了"的即时反馈。
       卡片式用"底色加深 + 取消上浮"表达按压，不再需要投影 —— 实心按钮时代靠阴影收缩，
       白底描边卡片上那样会显得脏。
       这里必须用 background-color 而不是 background 简写：简写会把 background-image 重置成
       none，按下时跟随高光会突然消失。 */
    .button-grid .link-button:active {
        background-color: var(--card-bg-active);
        border-color: var(--accent);
        box-shadow: none;
        transform: translateY(0);
        transition-duration: 0.05s;
    }

    /* 降低动效偏好：三样都要收掉 —— 上浮、跟随高光（含邻卡环境光）、倾斜。
       JS 侧有同样的判断（那是主开关：不写 --glow，整片网格的渐变就都是透明的），
       这里再加一道 CSS 兜底，覆盖 hover 的静态上浮与高光层。 */
    @media (prefers-reduced-motion: reduce) {
        .button-grid .link-button,
        .button-grid .link-button:active {
            transition: none;
        }
        .button-grid .link-button,
        .button-grid .link-button:hover {
            background-image: none;
        }
        .button-grid .link-button:hover {
            transform: none;
            will-change: auto;
        }
    }
    
    /* 波纹本体：只动 transform（width/height 由 JS 按下式算好后再动画，见 createRipple）。
       原来挂在视口级固定容器上、固定 200px 直径、纯黑 10% ——
       固定直径在卡片上无法适配（卡片宽 124px、高 52px），而且因为容器铺满视口，
       圆会溢到卡片外的白底页面上，实心按钮时代看不出来，描边卡片上就是一块脏色。
       现在改成挂在卡片内部（卡片自身 overflow:hidden + border-radius 负责裁切），
       直径 = 点击点到卡片四角的最远距离 × 2，保证"刚好铺满就消失"。
       原来动的是 width/height（每帧触发布局），且带前缀的 3 份 keyframes 副本动画的仍是宽高，
       会盖掉标准版 —— 一并删掉，只留标准 @keyframes */
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: var(--ripple-color);
        transform: translate(-50%, -50%) scale(0);
        animation: rippleEffect 0.9s ease-out forwards;
        pointer-events: none;
    }

    @keyframes rippleEffect {
        from {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
        }
    }
</style>
<hr>
<nav class="button-grid" aria-label="站点入口">
{% for app in site.data.apps %}
    <a href="{{ app.url }}" class="link-button"><i class="fas fa-{{ app.icon }}" aria-hidden="true"></i>{{ app.title }}</a>
{% endfor %}
</nav>
<script>
    (function () {
        function init() {
            const grid = document.querySelector('.button-grid');
            if (!grid) return;

            // 三处动效（波纹 / 跟随高光 / 倾斜）共用同一个"降低动效"判断。
            // MediaQueryList 是活对象，用户中途改系统偏好会自动反映到 .matches。
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

            let lastRipple = null;
            const clearRipple = (node) => { if (node && node.parentNode) node.parentNode.removeChild(node); };

            // 波纹挂在卡片内部（不再用视口级的 #ripple-container），由卡片的 overflow:hidden 裁切。
            // 直径取"点击点到卡片四角的最远距离 ×2"：这样任意落点都能铺满卡片，
            // 也不像固定 200px 那样在小卡片上过大、在大卡片上盖不满。
            function createRipple(card, clientX, clientY) {
                const box = card.getBoundingClientRect();
                // clientLeft = 左边框宽；绝对定位子元素的原点是 padding box，要扣掉
                const x = clientX - box.left - card.clientLeft;
                const y = clientY - box.top - card.clientTop;
                const w = card.clientWidth, h = card.clientHeight;
                const radius = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(w - x, y),
                    Math.hypot(x, h - y),
                    Math.hypot(w - x, h - y)
                );

                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.width = `${radius * 2}px`;
                ripple.style.height = `${radius * 2}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                card.appendChild(ripple);
                lastRipple = ripple;

                // animationend 正常回收；另加定时器兜底，动画被打断时不泄漏节点
                const timer = setTimeout(() => clearRipple(ripple), 1500);
                ripple.addEventListener('animationend', () => {
                    clearTimeout(timer);
                    clearRipple(ripple);
                });
            }

            // 修复①：只挂 pointerdown —— 原来 click + touchstart 双监听，移动端一次点击出两个波纹
            // 修复②：pointerdown 早于 click/导航，波纹才来得及看见（配合 .link-button:active 按压态）
            // 修复③：限定在 .button-grid 内 —— 原来挂 document，点标题/页脚/空白处也冒波纹
            grid.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;                                   // 只响应主键（排除右键/中键）
                if (reduceMotion.matches) return;
                const card = e.target.closest('.link-button');
                if (!card) return;                                            // 落在卡片之间的缝隙里则不出波纹
                createRipple(card, e.clientX, e.clientY);
            });

            // 起手变成滚动时浏览器会取消本次手势，顺手撤掉那颗波纹
            grid.addEventListener('pointercancel', () => { clearRipple(lastRipple); lastRipple = null; });

            // ---- 光效之二：跟随高光（一个虚拟光源照亮整片网格）----
            // ---- 光效之三：轻微倾斜（只给光标下那一张）----
            // （之一"主题色波纹"就是上面的 createRipple。上浮由 CSS :hover 负责，不在这里管。）
            //
            // 高光是"一盏灯 + 距离衰减"，不是每张卡各自开关：
            //   光标下的卡离光源最近 ⇒ 最亮；邻卡在 --glow-radius 内按距离平方衰减依次变暗。
            //   非悬停卡**只拿到光**，描边/底色/位移一概不变 —— 那是 :hover 的职责，
            //   否则"我马上要点哪张"的指示就被糊掉了。
            // 光的局部坐标逐卡计算：同一光源落在左邻卡的右边、上邻卡的下边，
            // 正是这个差异造成"整片被同一盏灯照亮"的错觉。
            //
            // 四条硬约束，改动前先读：
            //  ① 只写 transform 与自定义属性，绝不碰 width/height/top/left —— 否则每帧触发布局。
            //     当初波纹就是从 width/height 改过来的（见 .ripple 的注释）。
            //  ② pointermove 必须用 rAF 合并：高回报率鼠标（1000Hz）每秒触发上千次事件。
            //  ③ 量矩形必须先全部读完再开始写（下面的 boxes 数组）。读一张写一张会变成
            //     读-写-读-写，每张卡都触发一次样式重算；批量读最多每帧只刷一次。
            //  ④ 触屏不做倾斜，按事件的 pointerType 判，不用 CSS 的 @media (pointer: coarse) ——
            //     带触摸屏的笔记本主指针仍是 fine，媒体查询会把这类设备误判成可以倾斜。
            const cssNum = (name, dflt) => parseFloat(getComputedStyle(grid).getPropertyValue(name)) || dflt;
            const TILT = cssNum('--tilt', 4);
            const GLOW_RADIUS = cssNum('--glow-radius', 340);
            const GLOW_MIN = 0.004;   // 低于此强度直接归零，省掉一堆看不见的渐变重绘
            let frame = 0;        // 排队中的 rAF id
            let pending = null;   // 最近一次 pointermove 事件
            let tracked = null;   // 光标下那张卡（只有它做倾斜）
            let lit = [];         // 上一帧被点亮的卡，用来把"刚变暗"的归零

            function paint() {
                frame = 0;
                const e = pending, card = tracked;
                pending = null;                       // 先取出再清空，避免 paint 里被覆盖
                if (!e) return;

                const cx = e.clientX, cy = e.clientY;
                const cards = grid.children;

                // ③ 先把所有矩形一次性读完，再统一写，避免读-写-读-写
                const boxes = [];
                for (let i = 0; i < cards.length; i++) boxes.push(cards[i].getBoundingClientRect());

                const nextLit = [];
                for (let i = 0; i < cards.length; i++) {
                    const b = boxes[i];
                    // 用卡片中心算光距：光标必定在悬停卡内部，而它到自身中心的距离上界是半对角线
                    // （140×52 卡约 74px），远小于到任何邻卡中心的距离（纵向最近邻 70+ 卡高一半）。
                    const t = Math.hypot(cx - (b.left + b.width / 2), cy - (b.top + b.height / 2)) / GLOW_RADIUS;
                    if (t >= 1) continue;              // 超出衰减半径 ⇒ 完全不亮
                    const glow = (1 - t) * (1 - t);    // 平方衰减，在半径处平滑归零、无硬边
                    if (glow < GLOW_MIN) continue;
                    cards[i].style.setProperty('--mx', (cx - b.left) + 'px');
                    cards[i].style.setProperty('--my', (cy - b.top) + 'px');
                    cards[i].style.setProperty('--glow', glow.toFixed(3));
                    nextLit.push(cards[i]);
                }
                // 只把"上一帧亮、这一帧灭"的归零；每帧写满 19 张卡是无谓的
                for (let i = 0; i < lit.length; i++) {
                    if (nextLit.indexOf(lit[i]) === -1) lit[i].style.setProperty('--glow', '0');
                }
                lit = nextLit;

                // 倾斜只作用于光标下那一张
                if (!card || e.pointerType === 'touch') return;   // 触屏只要高光，不要倾斜
                const tb = card.getBoundingClientRect();
                const nx = ((cx - tb.left) / tb.width) * 2 - 1;    // -1 左 .. 1 右
                const ny = ((cy - tb.top) / tb.height) * 2 - 1;    // -1 上 .. 1 下
                // 鼠标在上方 ⇒ 上沿向后退（rotateX 取负），左右同理。
                // translateY(-2px) 与 CSS :hover 的上浮保持一致，否则内联值会把它顶掉。
                // perspective 必须排在旋转之前，否则旋转没有透视、看起来是平的。
                card.style.transform =
                    'perspective(600px) translateY(-2px) ' +
                    'rotateX(' + (-ny * TILT).toFixed(2) + 'deg) ' +
                    'rotateY(' + (nx * TILT).toFixed(2) + 'deg)';
            }

            // 整片网格熄灭 + 撤掉倾斜。pointerleave / pointercancel / 切到"降低动效" 都走这里
            function release() {
                if (frame) { cancelAnimationFrame(frame); frame = 0; }
                pending = null;
                tracked = null;
                const cards = grid.children;
                for (let i = 0; i < cards.length; i++) {
                    cards[i].style.removeProperty('--glow');
                    cards[i].style.removeProperty('--mx');
                    cards[i].style.removeProperty('--my');
                    // 交还控制权：移除内联 transform，回到 :hover / :active 的 CSS 值
                    cards[i].style.removeProperty('transform');
                }
                lit = [];
            }

            grid.addEventListener('pointermove', (e) => {
                if (reduceMotion.matches) return;
                const card = e.target.closest ? e.target.closest('.link-button') : null;
                // 换卡（或移进缝隙）时，先把上一张的倾斜撤掉，否则它会一直歪着
                if (tracked && tracked !== card) tracked.style.removeProperty('transform');
                tracked = card;                 // 移进缝隙时为 null：光还在，但没有卡被倾斜
                pending = e;
                if (!frame) frame = requestAnimationFrame(paint);
            });

            grid.addEventListener('pointerleave', release);
            grid.addEventListener('pointercancel', release);

            // 运行中把系统偏好切成"降低动效"时，把已经点亮/倾斜的卡片复原
            if (reduceMotion.addEventListener) {
                reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) release(); });
            }
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }());
</script>
