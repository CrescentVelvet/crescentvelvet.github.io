# game.html - 飞机大战游戏说明文档
每次提出新需求都要重新读一遍一千多行代码，效率较低，可以先写一个说明文档记录代码位置与功能，根据说明文档缩小查询代码的范围，修改代码后更新说明文档

## 1. 文件概述

本文件 (`game.html`) 包含了一个基于 HTML5 Canvas 实现的简单飞机大战游戏的全部代码，包括游戏的逻辑、渲染和用户交互。

- **主要功能**：玩家控制飞机躲避敌机和子弹，并通过射击敌机得分。
- **技术栈**：HTML, CSS, JavaScript, Canvas API

## 2. 核心游戏对象与逻辑

### 2.1. 游戏状态变量 (大致行号: 30-60)

- `canvas`, `ctx`: 画布元素和2D渲染上下文。
- `gameOver`, `gamePaused`: 游戏结束和暂停状态标志。
- `score`, `kills`, `gameTime`: 得分、击杀数和游戏时间。
- `lastTime`, `deltaTime`: 用于计算帧间时间差，实现平滑动画。
- `stars`: 星星背景数组。
- `bullets`: 子弹数组。
- `enemies`: 敌机数组。
- `explosions`: 爆炸效果数组。
- `lifeItems`, `shootItems`, `invincibleItems`: 道具数组。

### 2.2. 玩家 (Player)

- **定义** (大致行号: 700-710): `player` 对象，包含 `x`, `y`, `width`, `height`, `speed`, `lives`, `invincible`, `invincibleTime`, `shootAbility`, `shootTime` 等属性。
- **更新逻辑** (大致行号: 730-770): `updatePlayer(deltaTime)` 函数，根据键盘输入 (`keys` 对象) 和触摸事件更新玩家位置，并处理边界碰撞。乘以 `deltaTime` 以适应不同帧率。
- **绘制逻辑** (大致行号: 870-900): `drawPlayer()` 函数，绘制玩家飞机（歼20轮廓）。
- **受伤与无敌** (大致行号: 600-630): 在 `checkCollisions()` 中处理玩家与敌机碰撞，减少生命值，并设置短暂无敌状态。

### 2.3. 子弹 (Bullet)

- **创建逻辑** (大致行号: 770-820): `createBullet()` 函数，在玩家射击时创建子弹对象，支持普通子弹和特殊能力下的多方向子弹。有射击冷却时间 `bulletCooldown`。
- **数据结构**: 每个子弹对象包含 `x`, `y`, `width`, `height`, `speed`, `color`, `direction` (针对特殊能力)。
- **更新逻辑** (大致行号: 820-850): `updateBullets(deltaTime)` 函数，更新子弹位置，移除超出画布的子弹。乘以 `deltaTime`。
- **绘制逻辑** (大致行号: 900-920): `drawBullets()` 函数，绘制圆形子弹，有渐变色和发光效果。

### 2.4. 敌机 (Enemy)

- **创建逻辑** (大致行号: 400-450): `createEnemy()` 函数，根据游戏时间 `gameTime` 动态生成不同等级、大小和速度的敌机。
- **数据结构**: 每个敌机对象包含 `x`, `y`, `radius`, `speedX`, `speedY`, `color`, `level`, `hp` (生命值，与等级相关)。
- **更新逻辑** (大致行号: 450-510): `updateEnemies(deltaTime)` 函数，更新敌机位置（垂直和水平移动），处理左右墙壁反弹。乘以 `deltaTime`。
- **绘制逻辑** (大致行号: 920-960): `drawEnemies()` 函数，绘制圆形敌机，颜色随等级变化，有描边和等级数字。
- **被击中逻辑** (大致行号: 520-580): 在 `checkCollisions()` 中处理子弹击中敌机，降低敌机等级或移除敌机，增加分数和击杀数，创建爆炸效果。

### 2.5. 道具 (Items)

- **类型**: 生命恢复 (`lifeItems`)、射速提升 (`shootItems`)、短暂无敌 (`invincibleItems`)。
- **创建逻辑** (大致行号: 630-680): `createLifeItem()`, `createShootItem()`, `createInvincibleItem()` 函数，基于敌机被击落的计数器 `enemyCounterForItem` 生成。
- **更新逻辑** (大致行号: 680-700): `updateItems()` 函数，使道具向下移动，移除超出画布的道具。
- **绘制逻辑** (大致行号: 980-1040): `drawItems()` 函数，绘制不同形状和颜色的道具，有闪烁效果。
- **碰撞与效果** (大致行号: 580-600): 在 `checkCollisions()` 中处理玩家拾取道具的逻辑，并激活相应效果（恢复生命、提升射速、进入无敌状态）。
- **特殊能力计时** (大致行号: 700-730): `updateSpecialAbilities()` 函数，更新射击和无敌能力的剩余时间。

### 2.6. 碰撞检测 (大致行号: 510-630)

- `checkCollisions()`: 核心碰撞检测函数。
    - 子弹与敌机碰撞。
    - 玩家与道具碰撞。
    - 玩家与敌机碰撞。

### 2.7. 爆炸效果 (Explosion)

- **创建逻辑** (大致行号: 1130-1140): `createExplosion(x, y, color)` 函数，在敌机被击毁或子弹碰撞时创建。
- **更新与绘制** (大致行号: 1040-1060, 1140-1150): `updateExplosions()` 和 `drawExplosions()` 函数，处理爆炸效果的动画（粒子扩散和消失）。

## 3. 绘图与游戏循环

### 3.1. 背景

- **星星背景** (大致行号: 340-390): `drawStars()`, `createStar()`, `updateStars()` 函数，实现动态移动的星星背景效果。

### 3.2. UI元素绘制

- **生命值** (大致行号: 960-980): `drawLives()` 函数，绘制玩家剩余生命（爱心图标）。
- **得分、时间等信息** (大致行号: 1060-1100): `drawUI()` 函数，在游戏界面显示得分、击杀数、游戏时间、特殊能力剩余时间等。
- **暂停/结束界面** (大致行号: 1060-1100): 在 `drawUI()` 中处理，当 `gamePaused` 或 `gameOver` 为 `true` 时显示相应信息。

### 3.3. 游戏循环 (Game Loop)

- **核心函数** (大致行号: 1150-1200): `gameLoop(timestamp)` 函数。
- **时间增量计算**: `deltaTime = (timestamp - lastTime) / 1000;`。
- **主要流程**: 
    1. 清除画布 `ctx.clearRect()`。
    2. 更新游戏时间 `updateGameTime()` (如果游戏未暂停且未结束)。
    3. 绘制背景 `drawStars()`。
    4. 更新和绘制游戏对象 (如果游戏未暂停且未结束):
        - `updatePlayer(deltaTime)`
        - `updateBullets(deltaTime)`
        - `updateEnemies(deltaTime)`
        - `updateItems()`
        - `updateSpecialAbilities()`
        - `checkCollisions()`
        - `drawPlayer()`
        - `drawBullets()`
        - `drawEnemies()`
        - `drawItems()`
        - `drawLives()`
    5. 更新和绘制爆炸效果 `updateExplosions()`, `drawExplosions()`。
    6. 绘制UI `drawUI()`。
    7. 如果游戏结束，显示结束画面并准备重置。
    8. 使用 `requestAnimationFrame(gameLoop)` 实现循环。

### 3.4. 游戏重置 (大致行号: 1180-1190, 1240-1270)

- `resetGame()`: 重置游戏状态、玩家属性、清空数组、重新开始游戏计时等。
- 在游戏结束后，点击或触摸屏幕会调用 `resetGame()`。

## 4. 用户输入与控制

### 4.1. 键盘输入 (大致行号: 710-730)

- `keys` 对象: 存储按键状态。
- `keydown` 和 `keyup` 事件监听器: 更新 `keys` 对象。
- 支持 'w', 'a', 's', 'd' 或方向键控制移动，空格键射击，'p' 键暂停/继续。

### 4.2. 触摸输入 (移动端) (大致行号: 1200-1240)

- **暂停按钮**: 页面上有一个ID为 `pauseButton` 的按钮用于暂停/继续游戏。
- **触摸移动与射击**: 
    - `touchstart`, `touchmove`, `touchend` 事件监听器。
    - `touchStartX`, `touchStartY`: 记录触摸起始点。
    - `isShooting`: 标记是否正在射击（通过触摸特定区域或按钮）。
    - 触摸屏幕左下角控制移动，右下角控制射击（具体实现可能需要根据代码细节调整）。
- **禁止默认行为**: `event.preventDefault()` 用于禁止双击缩放和页面滚动。

## 5. 辅助功能

- **显示最后修改时间** (大致行号: 1270-1280): 页面底部显示文件最后修改日期。
- **CSS样式**: 文件头部 `<style>` 标签内定义了游戏页面的基本样式。

## 6. 如何修改与扩展

- **调整游戏难度**: 修改 `createEnemy()` 中的敌机生成逻辑（如等级、速度、生成频率）。修改 `player` 对象的初始生命值等。
- **添加新道具/敌人**: 
    1. 定义新的对象结构。
    2. 编写创建、更新、绘制函数。
    3. 在 `checkCollisions()` 中添加碰撞逻辑。
    4. 在 `gameLoop` 中调用更新和绘制函数。
- **修改数值平衡**: 仔细调整玩家/敌人速度、子弹伤害、道具效果持续时间等。

---

**文档维护建议:**

*   **同步更新**: 每次对 `game.html` 代码进行重要修改后，请及时更新本文档对应部分，特别是行号参考和功能描述。
*   **清晰描述**: 对于新增功能或复杂逻辑，尽量提供清晰的解释。
*   **版本控制**: 如果使用 Git 等版本控制工具，可以将此文档与代码一同提交，方便追踪修改历史。
