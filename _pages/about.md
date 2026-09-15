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
    /* 入口按钮网格。.link-button 只在本页 .button-grid 内出现（全站范围已确认），
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
    .button-grid .link-button {
        display: block;
        text-align: center;
        font-size: 16px;
        font-weight: 500;
        padding: 14px 8px;
        background: linear-gradient(90deg, #4CAF50 60%, #45a049 100%);
        color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: all 0.2s;
        border: none;
        text-decoration: none;
        letter-spacing: 1px;
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
       图标只做装饰（文字已表意），故在 HTML 上标 aria-hidden="true" */
    .button-grid .link-button i {
        width: 16px;
        margin-right: 4px;
        font-size: 14px;
        text-align: center;
    }
    /* hover 只做同向加深；原来是把两个色标位置对调（60%/100% 互换），渐变带会反着跑 */
    .button-grid .link-button:hover {
        background: linear-gradient(90deg, #45a049 60%, #3d8b40 100%);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transform: translateY(-2px) scale(1.03);
        color: #fff;
    }
    /* 按压反馈：pointerup 的 click 之后浏览器立刻开始导航，:active 才是"确实点到了"的即时反馈 */
    .button-grid .link-button:active {
        transform: translateY(-1px) scale(0.98);
        box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        transition-duration: 0.05s;
    }
    
    /* 水波纹：容器固定铺满视口且不吃指针事件 */
    #ripple-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    }

    /* 波纹本体：固定 200px 直径，只动 transform。
       原来动的是 width/height（每帧触发布局），且带前缀的 3 份 keyframes 副本动画的仍是宽高，
       会盖掉标准版 —— 一并删掉，只留标准 @keyframes */
    .ripple {
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.1);
        transform: translate(-50%, -50%) scale(0);
        animation: rippleEffect 1s ease-out;
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
<div id="ripple-container"></div>
<hr>
<nav class="button-grid" aria-label="站点入口">
{% for app in site.data.apps %}
    <a href="{{ app.url }}" class="link-button"><i class="fas fa-{{ app.icon }}" aria-hidden="true"></i>{{ app.title }}</a>
{% endfor %}
</nav>
<script>
    (function () {
        function init() {
            const container = document.getElementById('ripple-container');
            const grid = document.querySelector('.button-grid');
            if (!container || !grid) return;

            let lastRipple = null;
            const clearRipple = (node) => { if (node && node.parentNode) container.removeChild(node); };

            function createRipple(x, y) {
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                container.appendChild(ripple);
                lastRipple = ripple;

                // animationend 正常回收；另加定时器兜底，动画被打断时不泄漏节点
                const timer = setTimeout(() => clearRipple(ripple), 1200);
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
                createRipple(e.clientX, e.clientY);
            });

            // 起手变成滚动时浏览器会取消本次手势，顺手撤掉那颗波纹
            grid.addEventListener('pointercancel', () => { clearRipple(lastRipple); lastRipple = null; });
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }());
</script>
