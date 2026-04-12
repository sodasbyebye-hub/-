
# 实施计划 (Implementation Plan) - 萌萌动物方块

## 阶段 1：环境搭建与基础架构 (Scaffolding)
**目标：** 建立项目骨架，配置好所有依赖。

1.  **项目初始化：** 使用 Vite 创建 Vue 3 + TS 项目。
2.  **依赖安装：** 安装 `gsap`, `tailwindcss`, `pinia`, `canvas-confetti` (用于彩蛋)。
3.  **目录规范：** 创建 `src/engine` (逻辑), `src/hooks` (交互), `src/components` (UI) 文件夹。
4.  **全局样式：** 在 `style.css` 中配置 Tailwind 的颜色扩展，定义软萌的莫兰迪色卡。

---

## 阶段 2：核心引擎开发 (Core Game Logic)
**目标：** 完成不带 UI 的纯逻辑层，确保游戏能跑通。

1.  **定义方块数据：** 在 `types.ts` 中定义 `Tetromino` 类型，并为 7 种形状指定对应的“动物属性”（颜色、描述）。
2.  **编写 GameCore 类：**
    * 实现 $10 \times 20$ 的二维数组矩阵管理。
    * 实现方块的 `move`, `rotate` (含 SRS 踢墙算法简易版)。
    * 实现 `collisionCheck` (碰撞检测) 和 `clearLines` (消行逻辑)。
3.  **状态驱动：** 使用 `requestAnimationFrame` 建立基础的时钟循环，控制下落速度。

---

## 3. 视觉表现与 Canvas 渲染 (Rendering & Vibe)
**目标：** 让游戏“动起来”，并具备 Q 弹质感。

1.  **编写 Renderer 类：**
    * 在 Canvas 上绘制网格。
    * **核心细节：** 绘制带圆角的方块。为方块添加两个黑点（眼睛）和一个小粉点（鼻子），模拟动物表情。
2.  **GSAP 动画集成：**
    * 为 `Hard Drop` (硬降) 编写落地回弹动画函数。
    * 为消行编写“缩放消失”动效。
3.  **响应式画布：** 确保 Canvas 根据屏幕宽度自动缩放，保持 1:2 的比例。

---

## 4. UI 交互与移动端适配 (UI & Controls)
**目标：** 完成界面装饰，支持手机操作。

1.  **UI 组件开发：**
    * `ScoreBoard.vue`: 显示分数和最高分。
    * `NextPiece.vue`: 预览下一个出现的动物。
    * `ControlPanel.vue`: 包含暂停、重开按钮，UI 风格必须极其圆润。
2.  **手势监听 (useControls)：**
    * 实现点击旋转、左右滑动移动、下滑加速的触控逻辑。
    * 针对移动端进行防误触处理。

---

## 5. 专属礼物彩蛋与部署 (Polish & Deployment)
**目标：** 注入灵魂，完成交付。

1.  **彩蛋系统：**
    * 监听 Pinia 中的分数状态。
    * 分数触发 `520` / `1314` 时，调用 `canvas-confetti` 喷射爱心雨。
2.  **PWA 配置：** 配置 `manifest.json` 和图标，使其可“添加到主屏幕”全屏运行。
3.  **音效集成：** 加入轻快的背景音乐和 Q 弹的消除音效（建议使用 `Howler.js` 或原生 API）。
4.  **自动化部署：** 配置 GitHub Actions 或直接连接 Vercel，生成专属链接。

---

