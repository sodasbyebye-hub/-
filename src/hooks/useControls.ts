import { onMounted, onUnmounted, ref } from 'vue';
import { useSettingsStore } from '../stores/settings';

export interface KeyMap {
  left: string;
  right: string;
  down: string;
  rotate: string;
  hardDrop: string;
}

export const P1_KEYS: KeyMap = {
  left: 'a',
  right: 'd',
  down: 's',
  rotate: 'w',
  hardDrop: 'f'
};

export const P2_KEYS: KeyMap = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  down: 'ArrowDown',
  rotate: 'ArrowUp',
  hardDrop: ' '
};

interface ControlOptions {
  keyMap: KeyMap;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  enableTouch?: boolean;
}

/**
 * useControls: 封装独立按键与手势监听
 * 支持 DAS (Delayed Auto Shift) 逻辑
 */
export function useControls(options: ControlOptions) {
  const settings = useSettingsStore();
  
  // DAS 状态
  const dasTimers = ref<Record<string, any>>({});
  const DAS_DELAY = 200;
  const DAS_INTERVAL = 50;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  const SWIPE_THRESHOLD = 30;
  const TAP_THRESHOLD = 200;

  const startDAS = (key: string, action: () => void) => {
    if (dasTimers.value[key]) return;
    
    action(); // 立即执行一次
    
    dasTimers.value[key] = setTimeout(() => {
      dasTimers.value[key] = setInterval(action, DAS_INTERVAL);
    }, DAS_DELAY);
  };

  const stopDAS = (key: string) => {
    if (dasTimers.value[key]) {
      clearTimeout(dasTimers.value[key]);
      clearInterval(dasTimers.value[key]);
      delete dasTimers.value[key];
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const map = options.keyMap;
    const isKey = (target: string) => key === target.toLowerCase();

    if (isKey(map.left)) startDAS('left', options.onMoveLeft);
    else if (isKey(map.right)) startDAS('right', options.onMoveRight);
    else if (isKey(map.down)) startDAS('down', options.onMoveDown);
    else if (isKey(map.rotate)) options.onRotate();
    else if (isKey(map.hardDrop)) options.onHardDrop();
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const map = options.keyMap;
    const isKey = (target: string) => key === target.toLowerCase();

    if (isKey(map.left)) stopDAS('left');
    else if (isKey(map.right)) stopDAS('right');
    else if (isKey(map.down)) stopDAS('down');
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!options.enableTouch || !settings.enableExpertGestures) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!options.enableTouch || !settings.enableExpertGestures) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaTime = Date.now() - touchStartTime;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < TAP_THRESHOLD) {
      options.onRotate();
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) options.onMoveRight();
        else options.onMoveLeft();
      }
    } else {
      if (deltaY > SWIPE_THRESHOLD) {
        if (deltaY > 100) options.onHardDrop();
        else options.onMoveDown();
      }
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
    // 清理所有定时器
    Object.keys(dasTimers.value).forEach(stopDAS);
  });

  return {
    startDAS,
    stopDAS
  };
}
