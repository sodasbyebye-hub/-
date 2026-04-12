这份文档将专注于**音频系统 (Audio System)** 的深度集成。作为前端开发者，我们利用 `Howler.js` 来解决 Web 端（尤其是移动端浏览器）音频延迟和自动播放限制的问题。

---

# 萌萌动物方块：音频系统集成方案 (AI 指令文档)

## 1. 核心任务目标
在现有游戏逻辑基础上，集成全场景音效反馈。要求音效触发灵敏（低延迟），BGM 支持循环播放，并提供全局静音控制。

## 2. 资源映射表 (Asset Mapping)
请 AI 在 `src/assets/audio/` 目录下定位以下文件并进行逻辑绑定：

| 编号/文件名 | 触发场景 | 播放逻辑 |
| :--- | :--- | :--- |
| **bgm** | 游戏开始后持续播放 | 循环 (Loop), 较低音量 (0.4) |
| **01** | 点击“开始游戏”按钮 | 单次播放，播放完后启动游戏循环 |
| **03** | 玩家旋转方块 (Rotate) | 单次播放，高频触发需支持重叠播放 |
| **04** | 消除行 (Clear Line) | 单次播放，根据消除行数可考虑轻微提高音调 (Pitch) |
| **05** | 左右移动或手动向下加速 | 单次播放，音量较轻，避免嘈杂 |
| **06** | 游戏胜利/结算成功 | 单次播放，播放时降低 BGM 音量 |

---

## 3. 技术实现方案：`AudioController` 模块

### A. 音频管理类设计
AI 请创建一个 `src/engine/AudioController.ts` 类，使用 `Howler.js` 管理资源：

```typescript
import { Howl } from 'howler';

class AudioController {
  private sounds: Map<string, Howl> = new Map();
  private bgmPlayer: Howl | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // 定义音频配置
    const config = {
      click: '01.mp3',
      rotate: '03.mp3',
      clear: '04.mp3',
      move: '05.mp3',
      win: '06.mp3',
    };

    // 预加载音效
    Object.entries(config).forEach(([key, file]) => {
      this.sounds.set(key, new Howl({ src: [`/assets/audio/${file}`] }));
    });

    // 预加载 BGM
    this.bgmPlayer = new Howl({
      src: ['/assets/audio/bgm.mp3'],
      loop: true,
      volume: 0.4
    });
  }

  public play(effect: 'click' | 'rotate' | 'clear' | 'move' | 'win') {
    this.sounds.get(effect)?.play();
  }

  public startBGM() {
    if (!this.bgmPlayer?.playing()) this.bgmPlayer?.play();
  }

  public stopBGM() {
    this.bgmPlayer?.stop();
  }
}

export const audioManager = new AudioController();
```

### B. 逻辑注入点 (Hooking)
AI 在重构代码时需将音频接口注入以下位置：
1.  **UI 层：** `StartButton.onClicked` $\to$ `audioManager.play('click')` & `audioManager.startBGM()`.
2.  **Input 层：** `onKeyDown` (Left/Right/Down) $\to$ `audioManager.play('move')`.
3.  **Core 层：** * `rotate()` 成功时 $\to$ `audioManager.play('rotate')`.
    * `clearLines()` 判定成功时 $\to$ `audioManager.play('clear')`.
    * 判定胜利状态时 $\to$ `audioManager.play('win')`.

---

## 4. 可执行的分步计划 (Implementation Plan)

### 阶段 1：环境准备
1.  安装 `howler` 及其类型定义。
2.  将音频文件按编号放入 `public/assets/audio/` (方便直接引用) 或 `src/assets/audio/` (通过 Vite 导入)。

### 阶段 2：开发 Audio 状态管理器 (Pinia)
1.  创建 `useSettingStore`。
2.  管理 `isMuted` (是否静音) 和 `volume` (音量大小) 状态。
3.  确保 `AudioController` 能响应这些状态的变化。

### 阶段 3：全量集成与测试
1.  在 `GameCore` 的关键逻辑分支插入 `audioManager.play()`。
2.  **移动端优化：** 针对 iOS/Android 浏览器，需在用户“第一次点击”屏幕后（通常是 Start 按钮）激活音频上下文（AudioContext）。

---

## 5. 给 AI 的具体 Prompt

> "请基于 `optimization-plan.md`，使用 `Howler.js` 完善游戏的音频系统。
> 1. 参考我提供的音频映射表，将 01, 03, 04, 05, 06 和 bgm 进行功能绑定。
> 2. 编写一个 Vue 3 的 Hook `useAudio` 或一个独立的 `AudioController` 类，并在 `GameView.vue` 和 `GameCore.ts` 的对应逻辑处触发音效。
> 3. 特别注意：左右移动 (05) 的触发频率较高，请确保其音量适中且不会产生卡顿；消除行 (04) 时，请在 Canvas 产生消除粒子特效的同时播放音效。"

---

### 💡 导入音频素材的小贴士：
* **素材位置：** 如果你使用的是 Vite，推荐把 MP3 文件放在 `public/audio/` 下。这样在代码里可以直接写 `src: ['/audio/01.mp3']`。
* **第一次交互：** 记得告诉 AI，BGM 必须在用户点击“开始游戏”之后播放，否则浏览器会拦截自动播放。