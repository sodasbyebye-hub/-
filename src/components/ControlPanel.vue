<script setup lang="ts">
import { GameMode } from '../engine/types';
import ControlButton from './ControlButton.vue';

const props = defineProps<{
  mode: GameMode;
  p1: any;
  p2?: any;
}>();

// Wrapper functions for actions
const p1Left = () => props.p1?.startDAS('left', props.p1.moveLeft);
const p1Right = () => props.p1?.startDAS('right', props.p1.moveRight);
const p1Down = () => props.p1?.startDAS('down', props.p1.moveDown);
const p1Stop = (key: string) => props.p1?.stopDAS(key);

const p2Left = () => props.p2?.startDAS('left', props.p2.moveLeft);
const p2Right = () => props.p2?.startDAS('right', props.p2.moveRight);
const p2Down = () => props.p2?.startDAS('down', props.p2.moveDown);
const p2Stop = (key: string) => props.p2?.stopDAS(key);
</script>

<template>
  <div class="control-panel fixed inset-x-0 bottom-10 z-50 pointer-events-none">
    
    <!-- Single Player / Online layout -->
    <div v-if="mode === GameMode.SINGLE || mode === GameMode.ONLINE_PVP" 
         class="fixed inset-x-0 bottom-6 z-50 pointer-events-none flex justify-between items-end px-6 max-w-2xl mx-auto w-full">
      
      <!-- Directional Keys (Bottom Left) -->
      <div class="flex gap-4 items-center pointer-events-auto">
        <ControlButton 
          icon="⬅️" color="bg-blue-300/80" 
          shape="rounded-3xl"
          :vibrate="20"
          @press="p1Left" @release="p1Stop('left')" />
        <ControlButton 
          icon="➡️" color="bg-blue-300/80" 
          shape="rounded-3xl"
          :vibrate="20"
          @press="p1Right" @release="p1Stop('right')" />
      </div>

      <!-- Action Keys (Bottom Right) -->
      <div class="flex gap-4 items-end pointer-events-auto">
        <div class="flex flex-col gap-4">
          <ControlButton 
            icon="⬇️" color="bg-green-300/80" 
            :vibrate="20"
            @press="p1Down" @release="p1Stop('down')" />
          <ControlButton 
            icon="💎" color="bg-green-300/80" 
            :vibrate="50"
            @press="p1?.hardDrop" />
        </div>
        <ControlButton 
          shape="heart" icon="🔄" color="bg-pink-400/80"
          :vibrate="20"
          @press="p1?.rotate" />
      </div>
    </div>

    <!-- Local 2P Layout -->
    <div v-else-if="mode === GameMode.LOCAL_2P" 
         class="fixed inset-0 flex justify-between items-end p-6 pointer-events-none">
      
      <!-- P1 Controls (Left) -->
      <div class="flex flex-col gap-2 items-center pointer-events-auto scale-90 origin-bottom-left">
         <div class="flex gap-2">
           <ControlButton icon="⬅️" color="bg-blue-300/80" shape="rounded-3xl" :vibrate="20" @press="p1Left" @release="p1Stop('left')" />
           <ControlButton icon="➡️" color="bg-blue-300/80" shape="rounded-3xl" :vibrate="20" @press="p1Right" @release="p1Stop('right')" />
         </div>
         <div class="flex gap-2 items-end">
           <ControlButton icon="⬇️" color="bg-green-300/80" :vibrate="20" @press="p1Down" @release="p1Stop('down')" />
           <ControlButton shape="heart-left" icon="🔄" color="bg-pink-400/80" :vibrate="20" @press="p1?.rotate" />
         </div>
         <ControlButton icon="💎" color="bg-green-300/80" :vibrate="50" @press="p1?.hardDrop" class="scale-75" />
      </div>

      <!-- P2 Controls (Right) -->
      <div class="flex flex-col gap-2 items-center pointer-events-auto scale-90 origin-bottom-right">
         <div class="flex gap-2">
           <ControlButton icon="⬅️" color="bg-blue-300/80" shape="rounded-3xl" :vibrate="20" @press="p2Left" @release="p2Stop('left')" />
           <ControlButton icon="➡️" color="bg-blue-300/80" shape="rounded-3xl" :vibrate="20" @press="p2Right" @release="p2Stop('right')" />
         </div>
         <div class="flex gap-2 items-end">
           <ControlButton shape="heart-right" icon="🔄" color="bg-pink-400/80" :vibrate="20" @press="p2?.rotate" />
           <ControlButton icon="⬇️" color="bg-green-300/80" :vibrate="20" @press="p2Down" @release="p2Stop('down')" />
         </div>
         <ControlButton icon="💎" color="bg-green-300/80" :vibrate="50" @press="p2?.hardDrop" class="scale-75" />
      </div>
    </div>

  </div>
</template>

<style scoped>
.control-panel {
  /* Prevent scroll overflow */
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
