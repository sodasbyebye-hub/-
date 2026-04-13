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
         class="flex justify-between items-end px-12 max-w-2xl mx-auto w-full pointer-events-auto pb-6">
      
      <!-- Directional Keys (Left side) -->
      <div class="flex flex-col gap-4 items-center">
        <div class="flex gap-4">
          <ControlButton 
            direction="left" color="bg-blue-300 text-blue-600" 
            :vibrate="20"
            @on-press="p1Left" @on-release="p1Stop('left')" />
          <ControlButton 
            direction="right" color="bg-blue-300 text-blue-600" 
            :vibrate="20"
            @on-press="p1Right" @on-release="p1Stop('right')" />
        </div>
        <ControlButton 
          direction="down" size="lg" color="bg-green-300 text-green-600" 
          :vibrate="20"
          @on-press="p1Down" @on-release="p1Stop('down')" />
      </div>

      <!-- Action Keys (Right side) -->
      <div class="flex flex-col items-center gap-6">
        <ControlButton 
          type="rotate" size="xl" color="bg-pink-400 text-white shadow-lg shadow-pink-200" 
          :vibrate="20"
          @on-press="p1.rotate" />
        
        <ControlButton 
          direction="drop" color="bg-purple-300 text-purple-600" 
          :vibrate="[50, 30, 50]"
          @on-press="p1.hardDrop" />
      </div>
    </div>

    <!-- Local 2P Layout (Mirrored) -->
    <div v-else-if="mode === GameMode.LOCAL_2P" 
         class="fixed inset-0 flex justify-between items-end p-8 pointer-events-none pb-12">
      
      <!-- P1 Controls (Left) -->
      <div class="flex flex-col gap-4 items-center pointer-events-auto scale-90 origin-bottom-left">
         <div class="flex gap-3">
           <ControlButton direction="left" color="bg-blue-200 text-blue-500" :vibrate="20" @on-press="p1Left" @on-release="p1Stop('left')" />
           <ControlButton direction="right" color="bg-blue-200 text-blue-500" :vibrate="20" @on-press="p1Right" @on-release="p1Stop('right')" />
         </div>
         <div class="flex gap-3 items-center">
           <ControlButton direction="down" color="bg-green-200 text-green-500" :vibrate="20" @on-press="p1Down" @on-release="p1Stop('down')" />
           <ControlButton shape="heart-left" color="bg-pink-400 text-white" :vibrate="20" @on-press="p1.rotate" />
         </div>
         <ControlButton direction="drop" color="bg-purple-200 text-purple-500" :vibrate="[50, 30, 50]" @on-press="p1.hardDrop" class="scale-75" />
      </div>

      <!-- P2 Controls (Right) -->
      <div class="flex flex-col gap-4 items-center pointer-events-auto scale-90 origin-bottom-right">
         <div class="flex gap-3">
           <ControlButton direction="left" color="bg-blue-200 text-blue-500" :vibrate="20" @on-press="p2Left" @on-release="p2Stop('left')" />
           <ControlButton direction="right" color="bg-blue-200 text-blue-500" :vibrate="20" @on-press="p2Right" @on-release="p2Stop('right')" />
         </div>
         <div class="flex gap-3 items-center">
           <ControlButton shape="heart-right" color="bg-pink-400 text-white" :vibrate="20" @on-press="p2.rotate" />
           <ControlButton direction="down" color="bg-green-200 text-green-500" :vibrate="20" @on-press="p2Down" @on-release="p2Stop('down')" />
         </div>
         <ControlButton direction="drop" color="bg-purple-200 text-purple-500" :vibrate="[50, 30, 50]" @on-press="p2.hardDrop" class="scale-75" />
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
