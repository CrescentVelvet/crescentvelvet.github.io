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
        /* 112px 下限按实测取的：最窄可真出现 5 个汉字标签（约 84px）仍两侧有余量。
           160px 时 320~375px 屏只能 1 列（19 行），1024~1279px 窗口只有 3 列；改后 2 列 / 4 列 */
        grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
        gap: 18px 24px;
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
    <a href="{{ app.url }}" class="link-button">{{ app.title }}</a>
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
