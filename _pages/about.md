---
permalink: /
title: "网页"
excerpt: "关于"
author_profile: false
redirect_from: 
  - /about/
  - /about.html
---
<!-- <!DOCTYPE html> -->
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>欢迎来到我的网站</title>
    <style>
        /* 只针对特定链接的按钮样式 */
        a.link-button {
            display: inline-block;
            color: white;
            background-color: #4CAF50;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 4px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin: 5px 0;
            border: none;
            font-weight: normal;
        }
        
        a.link-button:hover {
            background-color: #45a049;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transform: translateY(-1px);
        }
        .button-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 18px 24px;
            margin: 30px 0;
            padding: 0;
        }
        .button-grid .link-button {
            display: block;
            text-align: center;
            font-size: 16px;
            font-weight: 500;
            padding: 14px 0;
            background: linear-gradient(90deg, #4CAF50 60%, #45a049 100%);
            color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.2s;
            border: none;
            text-decoration: none;
            letter-spacing: 1px;
        }
        .button-grid .link-button:hover {
            background: linear-gradient(90deg, #45a049 60%, #4CAF50 100%);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            transform: translateY(-2px) scale(1.03);
            color: #fff;
        }
        
        /* 保留原有水波纹样式 */
        #ripple-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.1);
            width: 0;
            height: 0;
            transform: translate(-50%, -50%);
            -webkit-animation: rippleEffect 1s ease-out;
            -moz-animation: rippleEffect 1s ease-out;
            -o-animation: rippleEffect 1s ease-out;
            animation: rippleEffect 1s ease-out;
        }

        @-webkit-keyframes rippleEffect {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }

        @-moz-keyframes rippleEffect {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }

        @-o-keyframes rippleEffect {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }

        @keyframes rippleEffect {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
        
        /* 返回按钮样式 */
        .back-button {
            display: inline-block;
            color: white;
            background-color: #6c757d;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 4px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin: 20px 0;
            border: none;
            font-weight: normal;
        }
        
        .back-button:hover {
            background-color: #5a6268;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div id="ripple-container"></div>
    <h1>欢迎来到我的网站</h1>
    <hr>
    <div class="button-grid">
        <a href="/chat_bot.html" class="link-button">大模型对话</a>
        <a href="/travel_map.html" class="link-button">旅行足迹</a>
        <a href="/multi_translator.html" class="link-button">多语言翻译</a>
        <a href="/course_recorder.html" class="link-button">进度记录</a>
        <a href="/game_plane.html" class="link-button">飞机大战</a>
        <a href="/db_viewer.html" class="link-button">数据库解析</a>
        <a href="/text_processor.html" class="link-button">文本加密</a>
        <a href="/enc_reader.html" class="link-button">文本解密</a>
        <a href="/receipt_scanner.html" class="link-button">票据识别</a>
        <a href="/paper_retrieval.html" class="link-button">论文搜索</a>
        <a href="/hot_trends.html" class="link-button">每日热榜</a>
        <a href="/wish_analyzer.html" class="link-button">抽卡分析</a>
    </div>
    <hr>
    <p>强调一下<strong>几个单词</strong></p>
    <blockquote>引用内容</blockquote>
    <p>分割线</p>
    <hr>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const rippleContainer = document.getElementById('ripple-container');

            function createRipple(event) {
                const ripple = document.createElement('div');
                ripple.classList.add('ripple');

                const x = event.clientX;
                const y = event.clientY;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                rippleContainer.appendChild(ripple);

                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            }

            document.addEventListener('click', createRipple);

            document.addEventListener('touchstart', (event) => {
                const touch = event.touches[0];
                createRipple(touch);
            }, { passive: true });
        });
    </script>
</body>
</html>

