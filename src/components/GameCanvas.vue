<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { GameCore } from '../engine/GameCore';
import { Renderer } from '../engine/Renderer';
import { GameStatus, TetrominoType, Matrix, Piece } from '../engine/types';
import { useControls, KeyMap } from '../hooks/useControls';
import { audioController } from '../engine/AudioController';
import NextPiece from './NextPiece.vue';
import gsap from 'gsap';

const props = defineProps<{
  keyMap: KeyMap;
  enableTouch?: boolean;
  playerName: string;
  readonly?: boolean;
  externalState?: {
    matrix: Matrix | null;
    score: number;
    level: number;
    combo: number;
    nextType: TetrominoType | null;
    currentPiece: Piece | null;
  };
}>();

const emit = defineEmits<{
  (e: 'garbage-sent', count: number): void;
  (e: 'game-over'): void;
  (e: 'state-change', data: any): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const score = ref(0);
const level = ref(1);
const combo = ref(0);
const status = ref(GameStatus.READY);
const nextType = ref<TetrominoType | null>(null);

let core: GameCore | null = null;
let renderer: Renderer | null = null;
let rafId: number | null = null;
let lastTick = 0;

/**
 * 状态同步：发送给外部
 */
const emitState = () => {
    if (!core) return;
    emit('state-change', {
        matrix: core.getMatrix(),
        score: score.value,
        level: level.value,
        combo: combo.value,
        nextType: nextType.value,
        currentPiece: core.getCurrentPiece()
    });
};

// 初始化核心与渲染
const init = () => {
  if (!canvasRef.value) return;
  renderer = new Renderer(canvasRef.value);

  if (props.readonly) {
    status.value = GameStatus.PLAYING;
    startMirrorLoop();
    return;
  }

  core = new GameCore({
    onLand: () => {
      audioController.play('move'); // 落地音效
      if (containerRef.value) {
        gsap.fromTo(containerRef.value, 
          { scaleY: 0.96, scaleX: 1.02 }, 
          { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
        );
      }
      nextType.value = core?.getNextPieceType() || null;
      emitState();
    },
    onRotate: () => {
      audioController.play('rotate');
      if (containerRef.value) {
        gsap.fromTo(containerRef.value,
          { rotation: 1.5, scale: 0.98 },
          { rotation: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }
        );
      }
      emitState();
    },
    onScoreUpdate: (s, l, c) => {
      if (s > score.value) {
        audioController.play('clear');
      }
      score.value = s;
      level.value = l;
      combo.value = c;
      emitState();
    },
    onReceiveGarbage: (count) => {
        emit('garbage-sent', count);
    },
    onGameOver: () => {
        status.value = GameStatus.GAMEOVER;
        emit('game-over');
        emitState();
    }
  });

  core.reset();
  nextType.value = core.getNextPieceType();
  status.value = GameStatus.PLAYING;
  
  emitState(); // 初始状态同步
  startGameLoop();
};

const startGameLoop = () => {
  const loop = (time: number) => {
    if (!core || !renderer || status.value !== GameStatus.PLAYING) return;
    const deltaTime = time - lastTick;
    if (deltaTime > core.getDropInterval()) {
      core.tick();
      lastTick = time;
      emitState();
    }
    renderer.render(core.getMatrix(), core.getCurrentPiece());
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
};

const startMirrorLoop = () => {
  const loop = () => {
    if (!renderer || !props.externalState || !props.externalState.matrix) {
        rafId = requestAnimationFrame(loop);
        return;
    }
    // 渲染远程矩阵和当前方块
    renderer.render(props.externalState.matrix, props.externalState.currentPiece);
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
};

// 同步外部状态（用于只读模式）
watch(() => props.externalState, (s) => {
  if (s && props.readonly) {
    score.value = s.score;
    level.value = s.level;
    combo.value = s.combo;
    nextType.value = s.nextType;
  }
}, { deep: true });

// 暴露给外部的方法：接收干扰
const addGarbage = (count: number) => {
  if (core && status.value === GameStatus.PLAYING) {
    core.receiveGarbage(count);
    emitState();
    // 震动效果
    if (containerRef.value) {
        gsap.fromTo(containerRef.value, 
          { x: -4 }, 
          { x: 0, duration: 0.05, repeat: 7, yoyo: true }
        );
    }
  }
};

const setSeed = (seed: number) => {
  core?.setSeed(seed);
};

const { startDAS, stopDAS } = useControls({
  keyMap: props.keyMap,
  enableTouch: props.enableTouch,
  onMoveLeft: () => { core?.move(-1); emitState(); audioController.play('move'); },
  onMoveRight: () => { core?.move(1); emitState(); audioController.play('move'); },
  onMoveDown: () => { core?.tick(); emitState(); audioController.play('move'); },
  onRotate: () => { core?.rotate(); emitState(); },
  onHardDrop: () => { core?.hardDrop(); emitState(); },
});

defineExpose({ 
  addGarbage, 
  reset: init, 
  setSeed,
  startDAS,
  stopDAS,
  moveLeft: () => { core?.move(-1); emitState(); audioController.play('move'); },
  moveRight: () => { core?.move(1); emitState(); audioController.play('move'); },
  moveDown: () => { core?.tick(); emitState(); audioController.play('move'); },
  rotate: () => { core?.rotate(); emitState(); },
  hardDrop: () => { core?.hardDrop(); emitState(); },
});

onMounted(init);
onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <!-- 玩家信息与分数 -->
    <div class="w-full flex justify-between items-end px-2">
      <div class="flex flex-col">
        <span class="text-[10px] font-black text-[#FFB7C5] uppercase tracking-widest">{{ playerName }}</span>
        <div class="flex gap-2 items-center">
            <span class="text-2xl font-black text-[#8B7E74] tabular-nums">{{ score }}</span>
            <span v-if="level > 1" class="text-[9px] font-bold text-[#A7C7E7]">LV.{{ level }}</span>
        </div>
      </div>
      <div class="text-right h-8 flex items-end">
        <Transition name="combo">
          <span v-if="combo > 1" class="text-sm font-black italic text-[#FFDAC1]">{{ combo }} COMBO!</span>
        </Transition>
      </div>
    </div>

    <div class="flex gap-4 items-start">
        <!-- 游戏画布 -->
        <div ref="containerRef" class="relative">
          <div class="absolute -inset-3 bg-white/60 rounded-[30px] shadow-lg -z-10 border border-white/40"></div>
          <canvas 
            ref="canvasRef" 
            class="w-[220px] h-[440px] md:w-[260px] md:h-[520px] rounded-[24px] block bg-transparent shadow-inner"
            style="mask-image: radial-gradient(white, black);"
          ></canvas>

          <!-- 结算层 -->
          <div v-if="status === GameStatus.GAMEOVER" 
               class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[24px] flex items-center justify-center z-10 transition-all">
             <div class="text-center p-4">
                <p class="text-4xl mb-2">🎈</p>
                <h3 class="font-black text-[#8B7E74]">GAME OVER</h3>
             </div>
          </div>
        </div>

        <!-- 侧边预览 -->
        <div class="flex flex-col gap-2 scale-90 origin-top">
            <NextPiece :type="nextType" />
        </div>
    </div>
  </div>
</template>

<style scoped>
.combo-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.combo-leave-active {
  transition: all 0.2s ease-in;
}
.combo-enter-from { transform: scale(0.5); opacity: 0; }
.combo-leave-to { opacity: 0; }
</style>
