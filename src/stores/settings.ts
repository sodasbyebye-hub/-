import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const isMuted = ref(false);
  const masterVolume = ref(1.0);
  const showVirtualButtons = ref(true);
  const enableExpertGestures = ref(false);

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
  };

  const setVolume = (val: number) => {
    masterVolume.value = Math.max(0, Math.min(1, val));
  };

  return {
    isMuted,
    masterVolume,
    showVirtualButtons,
    enableExpertGestures,
    toggleMute,
    setVolume
  };
});
