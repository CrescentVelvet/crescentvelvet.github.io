---
layout: default
title: "沙盘战争"
permalink: /sandbox_war/
---

# 🏰 沙盘战争

欢迎来到沙盘战争模拟器！这是一个使用组合模式设计的战争游戏，您可以在这里放置坦克和士兵进行模拟作战。

## 🎮 游戏特色

- **组合模式设计**：使用面向对象的设计模式，代码结构清晰
- **多种单位类型**：坦克（高攻击力，低移动力）和士兵（低攻击力，高移动力）
- **阵营系统**：友军和敌军，支持不同阵营间的战斗
- **实时战斗**：自动化的战斗系统，实时显示战斗日志
- **交互体验**：点击选择单位，悬停查看详细信息

## 🚀 开始游戏

点击下面的按钮开始您的沙盘战争体验：

<div style="text-align: center; margin: 30px 0;">
    <a href="/sandbox_war_game.html" class="btn btn--primary btn--large" style="
        display: inline-block;
        padding: 15px 30px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        text-decoration: none;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'">
        🎯 进入战场
    </a>
</div>

## 🎯 游戏说明

1. **添加单位**：选择单位类型、阵营和生命值，然后添加到战场
2. **开始战斗**：当战场上有至少2个单位时，可以开始自动战斗
3. **观察战斗**：系统会自动进行攻击和移动，实时显示战斗过程
4. **查看结果**：战斗结束后会显示胜负结果

## 🏗️ 技术架构

- **GameObject基类**：定义所有游戏对象的通用属性和方法
- **Tank类**：继承自GameObject，实现坦克特有的战斗逻辑
- **Soldier类**：继承自GameObject，实现士兵特有的战斗逻辑
- **BattlefieldManager类**：管理整个战场，协调所有单位的交互

---

*准备好指挥您的军队了吗？点击"进入战场"开始您的沙盘战争之旅！*
