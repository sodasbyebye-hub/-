import { 
  Matrix, 
  Piece, 
  Point, 
  GameStatus, 
  GameHooks, 
  TetrominoType, 
  ANIMAL_MAPPING,
  MatrixCell
} from './types';

/**
 * GameCore: 俄罗斯方块核心逻辑类 (重构版)
 * 支持多实例、自动等级提升、Combo 系统及干扰行逻辑
 */
export class GameCore {
  private matrix: Matrix;
  private currentPiece: Piece | null = null;
  private nextPieceType: TetrominoType;
  private status: GameStatus = GameStatus.READY;
  
  // 进阶状态
  private score: number = 0;
  private level: number = 1;
  private comboCount: number = 0;
  private totalLinesCleared: number = 0;
  
  private hooks: GameHooks;
  private seed: number = Date.now();

  private readonly ROWS = 20;
  private readonly COLS = 10;

  constructor(hooks: GameHooks = {}) {
    this.matrix = this.createEmptyMatrix();
    this.hooks = hooks;
    this.nextPieceType = this.getRandomType();
  }

  /**
   * 设置种子（联机模式同步使用）
   */
  public setSeed(newSeed: number): void {
    this.seed = newSeed;
    // 重新预热第一个方块，确保与种子一致
    this.nextPieceType = this.getRandomType();
  }

  /**
   * 简单的伪随机数生成器 (LCG)
   */
  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * 重置游戏状态
   */
  public reset(): void {
    this.matrix = this.createEmptyMatrix();
    this.score = 0;
    this.level = 1;
    this.comboCount = 0;
    this.totalLinesCleared = 0;
    this.status = GameStatus.PLAYING;
    this.spawnPiece();
    this.updateScoreUI();
  }

  /**
   * 生成新方块
   */
  private spawnPiece(): void {
    const type = this.nextPieceType;
    const data = ANIMAL_MAPPING[type];
    
    this.currentPiece = {
      type,
      position: { x: Math.floor(this.COLS / 2) - Math.floor(data.shape[0].length / 2), y: 0 },
      shape: JSON.parse(JSON.stringify(data.shape)),
      color: data.color
    };

    this.nextPieceType = this.getRandomType();

    if (this.checkCollision(this.currentPiece.position, this.currentPiece.shape)) {
      this.status = GameStatus.GAMEOVER;
      this.hooks.onGameOver?.();
    }
  }

  /**
   * 下落驱动
   */
  public tick(): boolean {
    if (!this.currentPiece || this.status !== GameStatus.PLAYING) return false;

    const newPos = { ...this.currentPiece.position, y: this.currentPiece.position.y + 1 };
    
    if (!this.checkCollision(newPos, this.currentPiece.shape)) {
      this.currentPiece.position = newPos;
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  /**
   * 锁定方块并处理消行
   */
  private lockPiece(): void {
    if (!this.currentPiece) return;

    const { position, shape, color } = this.currentPiece;
    
    shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const ny = position.y + dy;
          const nx = position.x + dx;
          if (ny >= 0 && ny < this.ROWS && nx >= 0 && nx < this.COLS) {
            this.matrix[ny][nx] = color;
          }
        }
      });
    });

    this.hooks.onLand?.(this.currentPiece);
    this.clearLines();
    this.spawnPiece();
  }

  /**
   * 消行与干扰逻辑
   */
  private clearLines(): void {
    let linesToClear: number[] = [];

    for (let y = this.ROWS - 1; y >= 0; y--) {
      if (this.matrix[y].every(cell => cell !== 0)) {
        linesToClear.push(y);
      }
    }

    if (linesToClear.length > 0) {
      // 触发消行动画 Hook
      this.hooks.onClearLines?.(linesToClear, this.comboCount);

      // 执行物理删除
      linesToClear.forEach(rowIdx => {
        this.matrix.splice(rowIdx, 1);
        this.matrix.unshift(new Array(this.COLS).fill(0));
      });

      // 更新状态
      const count = linesToClear.length;
      this.totalLinesCleared += count;
      
      // 计分公式：(基础分) + (Combo加成)
      const baseScores = [0, 100, 300, 700, 1200];
      const comboBonus = this.comboCount * 50;
      this.score += baseScores[count] + comboBonus;

      // 等级提升 (10行一级)
      this.level = Math.floor(this.totalLinesCleared / 10) + 1;
      
      this.comboCount++; // 连击增加
      this.updateScoreUI();

      // 对战干扰：3行及以上触发干扰
      if (count >= 3) {
        this.hooks.onReceiveGarbage?.(count); // 通知对手（由组件转发）
      }
    } else {
      this.comboCount = 0; // 未消行回正 Combo
      this.updateScoreUI();
    }
  }

  /**
   * 接收干扰行逻辑
   */
  public receiveGarbage(count: number): void {
    if (this.status !== GameStatus.PLAYING) return;

    // 1. 整体矩阵上移
    for (let i = 0; i < count; i++) {
      this.matrix.shift();
      
      // 2. 底部生成带随机空洞的干扰行
      const garbageRow: MatrixCell[] = new Array(this.COLS).fill('GARBAGE');
      const holeX = Math.floor(Math.random() * this.COLS);
      garbageRow[holeX] = 0;
      this.matrix.push(garbageRow);
    }

    // 3. 碰撞复检 (如果当前方块被顶到已占位格，强制游戏结束)
    if (this.currentPiece && this.checkCollision(this.currentPiece.position, this.currentPiece.shape)) {
      this.status = GameStatus.GAMEOVER;
      this.hooks.onGameOver?.();
    }
  }

  /**
   * 获取当前下落间隔 (ms)
   */
  public getDropInterval(): number {
    return Math.max(100, 1000 - (this.level - 1) * 100);
  }

  private updateScoreUI(): void {
    this.hooks.onScoreUpdate?.(this.score, this.level, this.comboCount);
  }

  // --- 基础操作 (Move, Rotate, HardDrop) ---
  public move(dx: number): boolean {
    if (!this.currentPiece || this.status !== GameStatus.PLAYING) return false;
    const newPos = { ...this.currentPiece.position, x: this.currentPiece.position.x + dx };
    if (!this.checkCollision(newPos, this.currentPiece.shape)) {
      this.currentPiece.position = newPos;
      return true;
    }
    return false;
  }

  public rotate(): boolean {
    if (!this.currentPiece || this.status !== GameStatus.PLAYING) return false;
    const newShape = this.rotateMatrix(this.currentPiece.shape);
    const kicks = [0, -1, 1, -2, 2];
    for (const dx of kicks) {
      const kickedPos = { ...this.currentPiece.position, x: this.currentPiece.position.x + dx };
      if (!this.checkCollision(kickedPos, newShape)) {
        this.currentPiece.position = kickedPos;
        this.currentPiece.shape = newShape;
        this.hooks.onRotate?.(this.currentPiece);
        return true;
      }
    }
    return false;
  }

  public hardDrop(): void {
    if (!this.currentPiece || this.status !== GameStatus.PLAYING) return;
    while (this.tick()) {}
  }

  private checkCollision(pos: Point, shape: number[][]): boolean {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const ny = pos.y + y;
          const nx = pos.x + x;
          if (nx < 0 || nx >= this.COLS || ny >= this.ROWS) return true;
          if (ny >= 0 && this.matrix[ny][nx] !== 0) return true;
        }
      }
    }
    return false;
  }

  private rotateMatrix(m: number[][]): number[][] {
    const r = m.length, c = m[0].length;
    const res = Array.from({ length: c }, () => new Array(r).fill(0));
    for (let y = 0; y < r; y++) {
      for (let x = 0; x < c; x++) res[x][r - 1 - y] = m[y][x];
    }
    return res;
  }

  private getRandomType(): TetrominoType {
    const t: TetrominoType[] = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'];
    return t[Math.floor(this.seededRandom() * t.length)];
  }

  private createEmptyMatrix(): Matrix {
    return Array.from({ length: this.ROWS }, () => new Array(this.COLS).fill(0));
  }

  public getMatrix(): Matrix { return this.matrix; }
  public getCurrentPiece(): Piece | null { return this.currentPiece; }
  public getNextPieceType(): TetrominoType { return this.nextPieceType; }
  public getStatus(): GameStatus { return this.status; }
  public getLevel(): number { return this.level; }
  public getCombo(): number { return this.comboCount; }
}
