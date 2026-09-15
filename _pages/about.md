---
permalink: /
title: "欢迎来到网站"
excerpt: "个人工具与小游戏合集入口"
author_profile: false
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
    :root {
        --accent: #52adc8;
        --ink: #494e52;
        --line: #d0d3d5;
        --card-bg: #fff;
        --card-bg-hover: #f5fafc;
        --card-bg-active: #edf5f8;
        --card-shadow-hover: 0 3px 10px rgba(73, 78, 82, 0.10);
        --ripple-color: rgba(82, 173, 200, 0.20);
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
       transition 逐属性列出而不是 all：避免将来新增属性时被意外插值。 */
    .button-grid .link-button {
        display: block;
        position: relative;  /* 水波纹的定位父级 */
        overflow: hidden;    /* 把波纹裁在卡片内，不让它溢到白底页面上 */
        text-align: center;
        font-size: 16px;
        font-weight: 500;
        padding: 13px 7px;
        background: var(--card-bg);
        color: var(--ink);
        border: 1px solid var(--line);
        border-radius: 8px;
        text-decoration: none;
        letter-spacing: 1px;
        transition: background-color 0.18s ease, border-color 0.18s ease,
                    box-shadow 0.18s ease, transform 0.18s ease;
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
    /* hover：描边转到强调色 + 极淡的同色底 + 轻微上浮。
       原来的"整块渐变换色 + scale(1.03)"是实心按钮的语言；卡片式里 scale 会让相邻卡片的
       描边在视觉上互相挤压，只上浮更干净。 */
    .button-grid .link-button:hover {
        background: var(--card-bg-hover);
        border-color: var(--accent);
        box-shadow: var(--card-shadow-hover);
        transform: translateY(-2px);
    }
    /* 键盘可达性：鼠标 hover 有反馈，Tab 也必须看得出落点。
       用 :focus-visible 而非 :focus —— 后者会让鼠标点击后残留一圈焦点框 */
    .button-grid .link-button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }
    /* 按压反馈：pointerup 的 click 之后浏览器立刻开始导航，:active 才是"确实点到了"的即时反馈。
       卡片式用"底色加深 + 取消上浮"表达按压，不再需要投影 —— 实心按钮时代靠阴影收缩，
       白底描边卡片上那样会显得脏。 */
    .button-grid .link-button:active {
        background: var(--card-bg-active);
        border-color: var(--accent);
        box-shadow: none;
        transform: translateY(0);
        transition-duration: 0.05s;
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
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                const card = e.target.closest('.link-button');
                if (!card) return;                                            // 落在卡片之间的缝隙里则不出波纹
                createRipple(card, e.clientX, e.clientY);
            });

            // 起手变成滚动时浏览器会取消本次手势，顺手撤掉那颗波纹
            grid.addEventListener('pointercancel', () => { clearRipple(lastRipple); lastRipple = null; });
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }());
</script>
