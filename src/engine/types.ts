/**
 * 方块类型定义
 */
export type TetrominoType = 'I' | 'O' | 'T' | 'J' | 'L' | 'S' | 'Z';

/**
 * 坐标点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 方块数据结构
 */
export interface TetrominoData {
  shape: number[][];
  color: string;
  animal: string;
}

/**
 * 游戏中的方块实例
 */
export interface Piece {
  type: TetrominoType;
  position: Point;
  shape: number[][]; // 旋转后的当前形状矩阵
  color: string;
}

/**
 * 游戏状态枚举
 */
export enum GameStatus {
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER'
}

/**
 * 游戏模式枚举
 */
export enum GameMode {
  SINGLE = 'SINGLE',
  LOCAL_2P = 'LOCAL_2P',
  ONLINE_PVP = 'ONLINE_PVP'
}

/**
 * 矩阵单元格类型：0 表示空，字符串表示方块颜色，'GARBAGE' 表示干扰块
 */
export type MatrixCell = string | 0 | 'GARBAGE';

/**
 * 矩阵类型（20行x10列）
 */
export type Matrix = MatrixCell[][];

/**
 * GSAP 动画 Hook 类型
 */
export interface GameHooks {
  onLand?: (piece: Piece) => void;
  onRotate?: (piece: Piece) => void;
  onClearLines?: (lines: number[], combo: number) => void;
  onReceiveGarbage?: (count: number) => void;
  onGameOver?: () => void;
  onScoreUpdate?: (score: number, level: number, combo: number) => void;
}

/**
 * 干扰块颜色（灰色小动物风格）
 */
export const GARBAGE_COLOR = '#D1D1D1';

/**
 * 动物属性映射表
 */
export const ANIMAL_MAPPING: Record<TetrominoType, TetrominoData> = {
  'I': {
     animal: '趴趴兔',
     color: '#FFB7C5',
     shape: [[1, 1, 1, 1]]
  },
  'O': {
    animal: '小胖熊',
    color: '#F3E5AB',
    shape: [
      [1, 1],
      [1, 1]
    ]
  },
  'T': {
    animal: '小猫咪',
    color: '#B29DD9',
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ]
  },
  'L': {
    animal: '小企鹅',
    color: '#A7C7E7',
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ]
  },
  'J': {
    animal: '小企鹅',
    color: '#A7C7E7',
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  'S': {
    animal: '小粉猪',
    color: '#FFDAC1',
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ]
  },
  'Z': {
    animal: '小粉猪',
    color: '#FFDAC1',
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ]
  }
};
