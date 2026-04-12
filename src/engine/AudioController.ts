import { Howl } from 'howler';
import bgmUrl from '../assets/bgm.mp3';
import clickUrl from '../assets/01.mp3';
import startUrl from '../assets/02.mp3';
import rotateUrl from '../assets/03.mp3';
import clearUrl from '../assets/04.mp3';
import moveUrl from '../assets/05.mp3';
import winUrl from '../assets/06.mp3';

/**
 * AudioController: 管理游戏音频资源与播放逻辑
 * 采用全局单例模式，支持 Howler.js 引擎
 */
class AudioController {
  private sounds: Map<string, Howl> = new Map();
  private bgm: Howl | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    // 映射表
    const config = {
      click: clickUrl,
      start: startUrl,
      rotate: rotateUrl,
      clear: clearUrl,
      move: moveUrl,
      win: winUrl
    };

    // 预加载音效 (移动音效音量较低)
    Object.entries(config).forEach(([key, url]) => {
      this.sounds.set(key, new Howl({ 
        src: [url],
        volume: key === 'move' ? 0.2 : 1.0,
        preload: true
      }));
    });

    // 预加载 BGM
    this.bgm = new Howl({
      src: [bgmUrl],
      loop: true,
      volume: 0.4,
      preload: true
    });
  }

  /**
   * 播放短促音效
   */
  public play(effect: 'click' | 'start' | 'rotate' | 'clear' | 'move' | 'win') {
    if (this.isMuted) return;
    this.sounds.get(effect)?.play();
  }

  /**
   * 启动背景音乐 (须在交互后触发)
   */
  public startBGM() {
    if (this.isMuted || !this.bgm) return;
    if (!this.bgm.playing()) {
      this.bgm.play();
    }
  }

  /**
   * 停止背景音乐
   */
  public stopBGM() {
    this.bgm?.stop();
  }

  /**
   * 切换静音状态
   */
  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBGM();
      // 停止当前所有播放中的音效
      this.sounds.forEach(s => s.stop());
    } else {
      // 恢复 BGM (如果已经在播放逻辑内)
    }
  }
}

export const audioController = new AudioController();
