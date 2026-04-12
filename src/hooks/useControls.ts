import { onMounted, onUnmounted } from 'vue';

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
 * 支持多实例控制方案
 */
export function useControls(options: ControlOptions) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  const SWIPE_THRESHOLD = 30;
  const TAP_THRESHOLD = 200;

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const map = options.keyMap;
    
    // 兼容大小写和箭头键原始值
    const isKey = (target: string) => key === target.toLowerCase();

    if (isKey(map.left)) options.onMoveLeft();
    else if (isKey(map.right)) options.onMoveRight();
    else if (isKey(map.down)) options.onMoveDown();
    else if (isKey(map.rotate)) options.onRotate();
    else if (isKey(map.hardDrop)) options.onHardDrop();
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!options.enableTouch) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!options.enableTouch) return;
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
    if (options.enableTouch) {
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchend', handleTouchEnd);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    if (options.enableTouch) {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    }
  });
}
