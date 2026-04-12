<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { TetrominoType, ANIMAL_MAPPING } from '../engine/types'

const props = defineProps<{
  type: TetrominoType | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const BLOCK_SIZE = 30

const drawNext = () => {
  if (!canvasRef.value || !props.type) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const data = ANIMAL_MAPPING[props.type]
  const shape = data.shape
  const color = data.color

  // 清除画布
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // 计算偏移居中
  const offsetX = (canvasRef.value.width - shape[0].length * BLOCK_SIZE) / 2
  const offsetY = (canvasRef.value.height - shape.length * BLOCK_SIZE) / 2

  shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawBlock(ctx, offsetX + x * BLOCK_SIZE, offsetY + y * BLOCK_SIZE, color)
      }
    })
  })
}

const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  const padding = 2
  const size = BLOCK_SIZE - padding * 2
  const r = 8

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x + padding, y + padding, size, size, r)
  ctx.fill()

  // 眼睛
  ctx.fillStyle = '#3E2723'
  const eyeSize = size * 0.12
  ctx.beginPath()
  ctx.arc(x + padding + size * 0.28, y + padding + size * 0.35, eyeSize / 2, 0, Math.PI * 2)
  ctx.arc(x + padding + size * 0.72, y + padding + size * 0.35, eyeSize / 2, 0, Math.PI * 2)
  ctx.fill()
}

onMounted(drawNext)
watch(() => props.type, drawNext)
</script>

<template>
  <div class="bg-white/60 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/40 flex flex-col items-center">
    <p class="text-[10px] font-bold text-[#A7C7E7] uppercase tracking-widest mb-3">Next Animal</p>
    <div class="w-24 h-24 bg-[#FDF6F0] rounded-2xl flex items-center justify-center overflow-hidden">
      <canvas ref="canvasRef" width="96" height="96"></canvas>
    </div>
    <p v-if="type" class="text-[10px] font-medium text-[#BCB1A1] mt-2 italic">{{ ANIMAL_MAPPING[type].animal }}</p>
  </div>
</template>
