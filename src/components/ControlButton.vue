<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

const props = defineProps<{
  label?: string;
  icon?: string;
  color: string;
  shape?: 'circle' | 'heart' | 'heart-left' | 'heart-right' | 'rounded-3xl';
  vibrate?: number | number[];
  onPress?: () => void;
  onRelease?: () => void;
}>();

const buttonRef = ref<HTMLElement | null>(null);
const rippleRef = ref<HTMLElement | null>(null);

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  
  // Vibration
  if (props.vibrate && navigator.vibrate) {
    navigator.vibrate(props.vibrate);
  }

  // Animation: Press
  if (buttonRef.value) {
    gsap.to(buttonRef.value, {
      scale: 0.9,
      duration: 0.1,
      ease: 'power2.out'
    });
  }

  // Ripple effect for rotation (heart)
  if (props.shape?.startsWith('heart') && rippleRef.value) {
    gsap.fromTo(rippleRef.value, 
      { scale: 0, opacity: 0.5 },
      { scale: 2.5, opacity: 0, duration: 0.6, ease: 'power2.out' }
    );
  }

  props.onPress?.();
};

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault();
  
  // Animation: Release
  if (buttonRef.value) {
    gsap.to(buttonRef.value, {
      scale: 1,
      duration: 0.4,
      ease: 'elastic.out(1.2, 0.4)'
    });
  }

  props.onRelease?.();
};

// Mouse support for testing
const handleMouseDown = () => {
  if (props.vibrate && navigator.vibrate) navigator.vibrate(props.vibrate);
  if (buttonRef.value) gsap.to(buttonRef.value, { scale: 0.9, duration: 0.1 });
  if (props.shape?.startsWith('heart') && rippleRef.value) {
    gsap.fromTo(rippleRef.value, { scale: 0, opacity: 0.5 }, { scale: 2.5, opacity: 0, duration: 0.6 });
  }
  props.onPress?.();
};

const handleMouseUp = () => {
  if (buttonRef.value) gsap.to(buttonRef.value, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' });
  props.onRelease?.();
};
</script>

<template>
  <div class="relative flex items-center justify-center p-2 touch-none select-none">
    <!-- Ripple Effect Container -->
    <div v-if="shape?.startsWith('heart')" 
         ref="rippleRef" 
         class="absolute w-16 h-16 rounded-full border-4 border-[#FFB7C5] pointer-events-none opacity-0 z-0">
    </div>

    <!-- Main Button -->
    <button
      ref="buttonRef"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      class="relative z-10 flex items-center justify-center transition-all duration-75 overflow-hidden"
      :class="[
        color,
        // Jelly UI Classes: Glassmorphism + Inner Shadow + Border
        'backdrop-blur-md border-[1.5px] border-white/40 shadow-xl shadow-gray-200/40',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:pointer-events-none',
        'after:absolute after:inset-[2px] after:rounded-[inherit] after:shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)] after:pointer-events-none',
        
        // Dynamic Shapes
        shape === 'circle' || !shape || shape === 'heart' ? 'w-16 h-16 rounded-full' : '',
        shape === 'rounded-3xl' ? 'w-16 h-16 rounded-3xl' : '',
        shape === 'heart-left' || shape === 'heart-right' ? 'w-12 h-20 bg-transparent border-none backdrop-blur-none shadow-none after:hidden before:hidden' : ''
      ]"
    >
      <!-- Heart Shape SVG with Gradient -->
      <svg v-if="shape === 'heart'" viewBox="0 0 100 100" class="w-full h-full p-2 drop-shadow-md">
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF9A9E;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FAD0C4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 A 20,20 0,0,1 50,30 z" 
              fill="url(#heartGradient)" />
      </svg>

      <!-- Half Heart Left -->
      <svg v-else-if="shape === 'heart-left'" viewBox="0 0 50 100" class="w-full h-full drop-shadow-md overflow-visible relative left-[-2px]">
        <path d="M 50,30 A 20,20 0,0,0 10,30 Q 10,60 50,90 L 50,30 z" 
              class="fill-current text-[#FFB7C5]" />
      </svg>

      <!-- Half Heart Right -->
      <svg v-else-if="shape === 'heart-right'" viewBox="0 0 50 100" class="w-full h-full drop-shadow-md overflow-visible relative left-[2px]">
        <path d="M 0,30 A 20,20 0,0,1 40,30 Q 40,60 0,90 L 0,30 z" 
              class="fill-current text-[#FFB7C5]" />
      </svg>

      <!-- Label / Icon -->
      <div v-if="shape === 'heart' || shape === 'heart-left' || shape === 'heart-right'" class="absolute inset-0 flex items-center justify-center">
        <span v-if="icon" class="text-2xl text-white">{{ icon }}</span>
        <span v-else class="font-black text-white text-xs">{{ label }}</span>
      </div>
      <template v-else>
        <span v-if="icon" class="text-2xl text-white">{{ icon }}</span>
        <span v-else class="font-black text-white text-xs">{{ label }}</span>
      </template>
    </button>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
