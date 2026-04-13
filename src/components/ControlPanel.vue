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
         class="flex justify-between items-end px-6 max-w-xl mx-auto w-full pointer-events-auto">
      
      <!-- Directional Keys (Left side) -->
      <div class="flex gap-4 items-center">
        <ControlButton 
          icon="⬅️" color="bg-[#A7C7E7]" 
          :vibrate="20"
          @press="p1Left" @release="p1Stop('left')" />
        <ControlButton 
          icon="➡️" color="bg-[#A7C7E7]" 
          :vibrate="20"
          @press="p1Right" @release="p1Stop('right')" />
      </div>

      <!-- Action Keys (Right side) -->
      <div class="flex gap-4 items-end">
        <div class="flex flex-col gap-4">
          <ControlButton 
            icon="⬇️" color="bg-[#FFDAC1]" 
            :vibrate="20"
            @press="p1Down" @release="p1Stop('down')" />
          <ControlButton 
            icon="💎" color="bg-[#B9FBC0]" 
            :vibrate="[50, 30, 50]"
            @press="p1.hardDrop" />
        </div>
        <ControlButton 
          shape="heart" icon="🔄" color="bg-transparent"
          :vibrate="20"
          @press="p1.rotate" />
      </div>
    </div>

    <!-- Local 2P Layout -->
    <div v-else-if="mode === GameMode.LOCAL_2P" 
         class="fixed inset-0 flex justify-between items-end p-6 pointer-events-none">
      
      <!-- P1 Controls (Left) -->
      <div class="flex flex-col gap-2 items-center pointer-events-auto scale-90">
         <div class="flex gap-2">
           <ControlButton icon="⬅️" color="bg-[#A7C7E7]" :vibrate="20" @press="p1Left" @release="p1Stop('left')" />
           <ControlButton icon="➡️" color="bg-[#A7C7E7]" :vibrate="20" @press="p1Right" @release="p1Stop('right')" />
         </div>
         <div class="flex gap-2 items-end">
           <ControlButton icon="⬇️" color="bg-[#FFDAC1]" :vibrate="20" @press="p1Down" @release="p1Stop('down')" />
           <ControlButton shape="heart-left" icon="🔄" color="bg-transparent" :vibrate="20" @press="p1.rotate" />
         </div>
         <ControlButton icon="💎" color="bg-[#B9FBC0]" :vibrate="[50, 30, 50]" @press="p1.hardDrop" class="scale-75" />
      </div>

      <!-- P2 Controls (Right) -->
      <div class="flex flex-col gap-2 items-center pointer-events-auto scale-90">
         <div class="flex gap-2">
           <ControlButton icon="⬅️" color="bg-[#FFB7C5]" :vibrate="20" @press="p2Left" @release="p2Stop('left')" />
           <ControlButton icon="➡️" color="bg-[#FFB7C5]" :vibrate="20" @press="p2Right" @release="p2Stop('right')" />
         </div>
         <div class="flex gap-2 items-end">
           <ControlButton shape="heart-right" icon="🔄" color="bg-transparent" :vibrate="20" @press="p2.rotate" />
           <ControlButton icon="⬇️" color="bg-[#FFDAC1]" :vibrate="20" @press="p2Down" @release="p2Stop('down')" />
         </div>
         <ControlButton icon="💎" color="bg-[#B9FBC0]" :vibrate="[50, 30, 50]" @press="p2.hardDrop" class="scale-75" />
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
