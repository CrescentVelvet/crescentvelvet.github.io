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
    <p><a href="/chat_bot.html" class="link-button">大模型对话</a></p>
    <p><a href="/travel_map.html" class="link-button">旅行足迹</a></p>
    <p><a href="/multi_translator.html" class="link-button">多语言翻译</a></p>
    <p><a href="/course_recorder.html" class="link-button">进度记录</a></p>
    <p><a href="/game_plane.html" class="link-button">飞机大战</a></p>
    <p><a href="/db_viewer.html" class="link-button">数据库解析</a></p>
    <p><a href="/text_processor.html" class="link-button">文本处理</a></p>
    <p><a href="/receipt_scanner.html" class="link-button">票据识别</a></p>
    <p><a href="/paper_retrieval.html" class="link-button">论文搜索</a></p>
    <p><a href="/hot_trends.html" class="link-button">每日热榜</a></p>
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

