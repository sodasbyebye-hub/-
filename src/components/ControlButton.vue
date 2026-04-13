<script setup lang="ts">
import { ref, computed } from 'vue';
import gsap from 'gsap';

interface Props {
  type?: 'direction' | 'action' | 'rotate';
  direction?: 'left' | 'right' | 'down' | 'drop';
  color?: string;
  size?: 'md' | 'lg' | 'xl';
  vibrate?: number | number[];
  shape?: 'circle' | 'heart' | 'heart-left' | 'heart-right';
  onPress?: () => void;
  onRelease?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'bg-pink-300'
});

const buttonRef = ref<HTMLElement | null>(null);
const rippleRef = ref<HTMLElement | null>(null);

// Icons from user proposal
const icons = {
  left: "M14.707 5.293a1 1 0 010 1.414L10.414 11H19a1 1 0 110 2h-8.586l4.293 4.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z",
  right: "M9.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L13.586 13H5a1 1 0 110-2h8.586L9.293 6.707a1 1 0 010-1.414z",
  down: "M5.293 9.293a1 1 0 011.414 0L12 14.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z",
  drop: "M12 5a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L11 16.586V6a1 1 0 011-1z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
};

const iconPath = computed(() => {
  if (props.type === 'rotate' || props.shape?.startsWith('heart')) return icons.heart;
  return icons[props.direction as keyof typeof icons] || '';
});

const sizeClass = computed(() => ({
  'w-16 h-16': props.size === 'md',
  'w-20 h-20': props.size === 'lg',
  'w-24 h-24': props.size === 'xl',
}));

const roundedClass = computed(() => {
    if (props.type === 'rotate' || props.shape === 'heart') return 'rounded-full';
    if (props.shape === 'heart-left') return 'rounded-l-full rounded-r-none';
    if (props.shape === 'heart-right') return 'rounded-r-full rounded-l-none';
    return 'rounded-3xl';
});

const colorClass = computed(() => props.color);
const iconSize = computed(() => props.size === 'xl' ? 'w-12 h-12' : 'w-8 h-8');

const handleStart = (e?: TouchEvent | MouseEvent) => {
  if (e) e.preventDefault();
  
  // Vibration
  if (props.vibrate && navigator.vibrate) {
    navigator.vibrate(props.vibrate);
  }

  // Animation: Ripple for hearts
  if ((props.type === 'rotate' || props.shape?.startsWith('heart')) && rippleRef.value) {
    gsap.fromTo(rippleRef.value, 
      { scale: 0, opacity: 0.5 },
      { scale: 2.5, opacity: 0, duration: 0.6, ease: 'power2.out' }
    );
  }

  props.onPress?.();
};

const handleEnd = (e?: TouchEvent | MouseEvent) => {
  if (e) e.preventDefault();
  props.onRelease?.();
};
</script>

<template>
  <div class="relative flex items-center justify-center p-2 touch-none select-none">
    <!-- Ripple Effect Container -->
    <div v-if="type === 'rotate' || shape?.startsWith('heart')" 
         ref="rippleRef" 
         class="absolute w-16 h-16 rounded-full border-4 border-[#FFB7C5] pointer-events-none opacity-0 z-0">
    </div>

    <!-- Main Button -->
    <button
      ref="buttonRef"
      @touchstart.prevent="handleStart"
      @touchend.prevent="handleEnd"
      @mousedown="handleStart"
      @mouseup="handleEnd"
      @mouseleave="handleEnd"
      @contextmenu.prevent
      class="relative flex items-center justify-center transition-all duration-100 active:scale-90 active:shadow-inner shadow-lg group overflow-hidden"
      :class="[sizeClass, colorClass, roundedClass]"
    >
      <!-- Glassmorphism Highlight -->
      <div class="absolute inset-0 opacity-40 bg-gradient-to-br from-white to-transparent pointer-events-none" :class="roundedClass"></div>
      
      <!-- Icon/Label Overlay -->
      <div class="relative z-10 flex items-center justify-center w-full h-full">
        <!-- Heart Path with clipping for Half-Hearts -->
        <svg 
            v-if="iconPath" 
            viewBox="0 0 24 24" 
            class="drop-shadow-md fill-current transition-transform group-active:scale-90" 
            :class="[
                iconSize,
                shape === 'heart-left' ? 'translate-x-1/4' : '',
                shape === 'heart-right' ? '-translate-x-1/4' : ''
            ]"
            :style="shape === 'heart-left' ? 'clip-path: inset(0 50% 0 0)' : (shape === 'heart-right' ? 'clip-path: inset(0 0 0 50%)' : '')"
        >
            <path :d="iconPath" />
        </svg>
        <span v-else class="font-black text-white text-xs drop-shadow-sm">{{ direction?.toUpperCase() }}</span>
      </div>

      <!-- Depth Shadow (Neumorphism touch) -->
      <div class="absolute -bottom-1 inset-x-0 h-2 bg-black/10 -z-10 blur-sm pointer-events-none" :class="roundedClass"></div>
    </button>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
</style>
