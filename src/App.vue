<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { GameMode, GameStatus } from './engine/types'
import { P1_KEYS, P2_KEYS } from './hooks/useControls'
import { useOnline } from './hooks/useOnline'
import { audioController } from './engine/AudioController'
import { useSettingsStore } from './stores/settings'
import GameCanvas from './components/GameCanvas.vue'
import ControlPanel from './components/ControlPanel.vue'
import gsap from 'gsap'

const currentMode = ref<GameMode>(GameMode.SINGLE)
const isMenuVisible = ref(true)
const winner = ref<string | null>(null)

const settings = useSettingsStore()

// 游戏实例引用
const p1Game = ref<InstanceType<typeof GameCanvas> | null>(null)
const p2Game = ref<InstanceType<typeof GameCanvas> | null>(null)

// 联机状态
const targetId = ref('')
const { 
  selfId, isConnected, remoteState, 
  initPeer, connectToPeer, send, 
  onReceiveGarbage, onRemoteGameOver, onSyncSeed 
} = useOnline()

// 模式切换
const startSingle = () => {
  audioController.play('click')
  audioController.startBGM()
  currentMode.value = GameMode.SINGLE
  isMenuVisible.value = false
}

const startBattle = () => {
  audioController.play('click')
  audioController.startBGM()
  currentMode.value = GameMode.LOCAL_2P
  isMenuVisible.value = false
}

const startOnline = () => {
  audioController.play('click')
  audioController.startBGM()
  currentMode.value = GameMode.ONLINE_PVP
  isMenuVisible.value = false
  initPeer()
}

const goMenu = () => {
  audioController.play('click')
  isMenuVisible.value = true
  winner.value = null
}

// 监听静音状态
watch(() => settings.isMuted, (muted) => {
  audioController.setMute(muted)
}, { immediate: true })

// 联机同步逻辑
watch(isConnected, (connected) => {
  if (connected && currentMode.value === GameMode.ONLINE_PVP) {
    if (!targetId.value) {
      const seed = Date.now();
      console.log('我是房主，发送种子:', seed);
      send({ type: 'SYNC_SEED', seed });
    }
  }
})

// 联机逻辑绑定
onSyncSeed((seed) => {
  console.log('收到同步种子:', seed)
  p1Game.value?.setSeed(seed)
  p1Game.value?.reset()
})

onReceiveGarbage((count) => {
  p1Game.value?.addGarbage(count)
})

onRemoteGameOver(() => {
  winner.value = 'YOU WIN!'
})

const handleStateChange = (state: any) => {
  if (currentMode.value === GameMode.ONLINE_PVP && isConnected.value) {
    send({ type: 'SYNC_STATE', ...state })
  }
}

const handleGarbageSent = (count: number) => {
  if (currentMode.value === GameMode.LOCAL_2P) {
    p2Game.value?.addGarbage(count)
  } else if (currentMode.value === GameMode.ONLINE_PVP) {
    send({ type: 'GARBAGE', count })
  }
}

const handleGameOver = () => {
  audioController.play('win') // 暂时共享 win 音效
  if (currentMode.value === GameMode.ONLINE_PVP) {
    send({ type: 'GAME_OVER' })
    winner.value = 'DEFEAT'
  } else if (currentMode.value === GameMode.LOCAL_2P) {
    winner.value = 'GAME OVER'
  } else {
    winner.value = 'GAME OVER'
  }
}

const copyId = () => {
  audioController.play('click')
  navigator.clipboard.writeText(selfId.value)
  alert('ID 已复制！')
}

// 模拟按钮 Hover
const scaleUp = (el: any) => gsap.to(el, { scale: 1.05, duration: 0.2 });
const scaleDown = (el: any) => gsap.to(el, { scale: 1, duration: 0.2 });
</script>

<template>
  <div class="min-h-screen bg-[#FDF6F0] flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-[#FFB7C5]">
    
    <!-- 音频开关 (右上角) -->
    <div class="fixed top-6 right-6 z-[60]">
        <button @click="settings.toggleMute()" 
                class="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-xl hover:bg-white transition-all">
          {{ settings.isMuted ? '🔇' : '🔊' }}
        </button>
        <!-- 专家手势模式开关 -->
        <button @click="settings.enableExpertGestures = !settings.enableExpertGestures" 
                :class="settings.enableExpertGestures ? 'bg-[#FFDAC1] text-white' : 'bg-white/80 text-[#8B7E74]'"
                class="mt-2 w-12 h-12 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center text-[10px] font-black hover:opacity-80 transition-all">
          <span class="text-base">👆</span>
          {{ settings.enableExpertGestures ? 'ON' : 'OFF' }}
        </button>
    </div>

    <!-- 装饰背景 -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#FFB7C5]/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#A7C7E7]/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- 主菜单 -->
    <Transition name="fade">
      <div v-if="isMenuVisible" class="z-20 flex flex-col items-center text-center">
        <div class="mb-12">
            <h1 class="text-5xl font-black text-[#FFB7C5] tracking-tighter drop-shadow-sm mb-2">萌萌动物方块</h1>
            <p class="text-xs text-[#D1C4B9] font-bold uppercase tracking-[0.4em]">Multiplayer Plus</p>
        </div>

        <div class="flex flex-col gap-6 w-full max-w-[320px]">
          <button @click="startSingle" @mouseenter="scaleUp($event.target)" @mouseleave="scaleDown($event.target)"
                  class="bg-white text-[#8B7E74] py-5 rounded-[28px] font-black shadow-xl shadow-gray-200/50 hover:bg-[#FFDAC1] hover:text-white transition-colors flex items-center justify-center gap-4">
            <span class="text-2xl">🧸</span> 单人闯关
          </button>
          <button @click="startBattle" @mouseenter="scaleUp($event.target)" @mouseleave="scaleDown($event.target)"
                  class="bg-white text-[#8B7E74] py-5 rounded-[28px] font-black shadow-xl shadow-gray-200/50 hover:bg-[#A7C7E7] hover:text-white transition-colors flex items-center justify-center gap-4">
            <span class="text-2xl">⚔️</span> 本地双人
          </button>
          <button @click="startOnline" @mouseenter="scaleUp($event.target)" @mouseleave="scaleDown($event.target)"
                  class="bg-white text-[#8B7E74] py-5 rounded-[28px] font-black shadow-xl shadow-gray-200/50 hover:bg-[#B9FBC0] hover:text-white transition-colors flex items-center justify-center gap-4">
            <span class="text-2xl">🌐</span> 联机对战
          </button>
        </div>
      </div>
    </Transition>

    <!-- 游戏视图 -->
    <div v-if="!isMenuVisible" class="z-10 w-full flex flex-col items-center gap-6">
      <button @click="goMenu" class="absolute top-4 left-4 text-[#BCB1A1] hover:text-[#FFB7C5] font-black text-xs uppercase tracking-widest p-4 pb-2 border-b-2 border-transparent hover:border-[#FFB7C5] transition-all">
        ← BACK TO MENU
      </button>

      <!-- 联网控制栏 -->
      <div v-if="currentMode === GameMode.ONLINE_PVP" class="bg-white/60 p-4 rounded-[24px] backdrop-blur-md border border-white flex flex-col items-center gap-3 shadow-sm mb-4">
        <div class="flex items-center gap-4">
            <div class="flex flex-col">
                <span class="text-[9px] font-bold text-[#BCB1A1]">YOUR ID</span>
                <span @click="copyId" class="text-xs font-black text-[#8B7E74] cursor-pointer hover:text-[#FFB7C5]">{{ selfId || 'Generating...' }}</span>
            </div>
            <div class="w-px h-6 bg-gray-200"></div>
            <div class="flex gap-2">
                <input v-model="targetId" placeholder="Enter Friend's ID" 
                       class="bg-white/80 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-[#A7C7E7] outline-none w-40" />
                <button @click="connectToPeer(targetId)" class="bg-[#A7C7E7] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#A7C7E7]/20">JOIN</button>
            </div>
        </div>
        <div v-if="isConnected" class="flex items-center gap-2 text-[10px] font-bold text-green-400">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            CONNECTED TO PEER
        </div>
      </div>

      <!-- 对战区域 -->
      <div class="flex flex-col md:flex-row gap-12 items-center justify-center w-full max-w-7xl">
          <!-- 本地玩家 -->
          <GameCanvas ref="p1Game" 
                      :player-name="currentMode === GameMode.SINGLE ? 'PLAYER 1' : 'LOCAL PLAYER'"
                      :key-map="currentMode === GameMode.ONLINE_PVP ? P2_KEYS : P1_KEYS"
                      :enable-touch="currentMode === GameMode.SINGLE"
                      @garbage-sent="handleGarbageSent"
                      @state-change="handleStateChange"
                      @game-over="handleGameOver" />

          <!-- 中间指示器 -->
          <div v-if="currentMode !== GameMode.SINGLE" class="flex flex-col items-center gap-2">
              <div class="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl font-black text-[#FFB7C5]">VS</div>
          </div>

          <!-- 对手画面 (本地双人) -->
          <GameCanvas v-if="currentMode === GameMode.LOCAL_2P"
                      ref="p2Game"
                      player-name="PLAYER 2"
                      :key-map="P2_KEYS"
                      @garbage-sent="handleGarbageSent"
                      @game-over="handleGameOver" />

          <GameCanvas v-if="currentMode === GameMode.ONLINE_PVP"
                      player-name="REMOTE PLAYER"
                      :key-map="P2_KEYS"
                      :readonly="true"
                      :external-state="remoteState" />
      </div>

      <!-- 虚拟手柄 -->
      <ControlPanel v-if="settings.showVirtualButtons"
                    :mode="currentMode"
                    :p1="p1Game"
                    :p2="p2Game" />
    </div>

    <!-- 结算 -->
    <Transition name="fade">
      <div v-if="winner" class="fixed inset-0 z-[100] bg-[#8B7E74]/20 backdrop-blur-md flex items-center justify-center p-8">
        <div class="bg-white rounded-[40px] p-10 shadow-2xl text-center">
            <h2 class="text-4xl mb-4">🏆</h2>
            <div class="text-2xl font-black text-[#8B7E74] mb-8">{{ winner }}</div>
            <button @click="goMenu" class="bg-[#FFB7C5] text-white px-10 py-4 rounded-2xl font-black">返回主菜单</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
