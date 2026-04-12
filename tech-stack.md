技术栈选型 (Tech Stack) - 萌萌动物方块
1. 核心框架层 (Core Framework)
框架: Vue 3 (SFC)

理由: 利用 Composition API 实现逻辑与视图的分离，方便 AI 维护 GameCore 逻辑。

构建工具: Vite 6.x

理由: 零配置启动，HMR（热更新）极快，适合 Vibe Coding 的快速迭代。

语言: TypeScript

理由: 严格定义方块类型、矩阵状态和 Props，减少 AI 在生成逻辑时的低级错误。

2. 游戏引擎与动画 (Game & Animation)
渲染渲染器: HTML5 Canvas API

理由: 相比 DOM 节点操作，Canvas 在手机浏览器上渲染 10x20 的方块矩阵性能更好，且方便实现细腻的逐帧动画。

动画库: GSAP (GreenSock)

理由: 这是本项目灵魂所在。用于实现方块落地的“Q-弹”回弹效果（Bounce）、消除时的缩放粒子感，以及 UI 界面的平滑过渡。

粒子系统: Canvas 模拟粒子

理由: 消行时喷射心形或星形碎片，通过简单的物理公式在 Canvas 上绘制，无需额外大型引擎。

3. 状态管理与 UI (State & Styling)
状态管理: Pinia

理由: 管理最高分 (High Score)、当前的可爱皮肤设置、静音状态等全局数据。

样式处理: Tailwind CSS

理由: 快速实现圆角（Rounded-3xl）、软萌色调的背景和毛玻璃效果。

图标库: Iconify (Mdi/Lucide)

理由: 用于游戏控制按钮（暂停、重开、设置）的轻量化图标方案。

4. 部署与环境 (Deployment)
部署平台: Vercel / GitHub Pages

理由: 自动化部署，生成专属 URL，方便直接发给女朋友。

PWA 支持: vite-plugin-pwa

理由: 支持“添加到主屏幕”，让网页版像原生 App 一样全屏运行，消除浏览器地址栏的干扰。

5. 开发约束 (Development Constraints for AI)
移动端优先: 所有交互必须适配触控（Swipe/Tap），UI 布局以 9:16 或 10:16 的手机屏占比为基准。

高性能渲染: requestAnimationFrame 驱动游戏循环，确保 60FPS 的丝滑感。

零素材启动: 初始开发时不依赖外部图片，方块由 Canvas 绘制（带圆角的 Rect），眼睛和表情通过 Canvas 绘图指令实现。