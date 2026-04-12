import { Matrix, Piece, GARBAGE_COLOR } from './types';

/**
 * Renderer: 负责将游戏状态渲染到 Canvas 上
 * 特色：软萌圆角风格 + 动物表情装饰
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private blockSize: number = 0;
  private width: number = 0;
  private height: number = 0;

  private readonly ROWS = 20;
  private readonly COLS = 10;

  // 颜色配置
  private readonly GRID_COLOR = '#F5EBE0'; // 浅卡其网格线
  private readonly BG_COLOR = '#FDF6F0';   // 温暖的底色

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get Canvas context');
    this.ctx = context;

    this.resize();
  }

  /**
   * 处理画布缩放与 DPR 适配
   */
  public resize(): void {
    const dpr = window.devicePixelRatio || 1;
    // 获取容器宽度，这里假设外部已经处理好容器比例
    const rect = this.canvas.getBoundingClientRect();
    
    this.width = rect.width;
    this.height = rect.height;
    
    // 设置画布物理尺寸
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    
    // 缩放上下文
    this.ctx.scale(dpr, dpr);

    // 计算方块大小
    this.blockSize = this.width / this.COLS;
  }

  /**
   * 全量渲染循环
   */
  public render(matrix: Matrix, currentPiece: Piece | null): void {
    this.clear();
    this.drawGrid();
    this.drawMatrix(matrix);
    if (currentPiece) {
      this.drawPiece(currentPiece);
    }
  }

  /**
   * 清屏
   */
  private clear(): void {
    this.ctx.fillStyle = this.BG_COLOR;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * 绘制背景网格
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = this.GRID_COLOR;
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.COLS; i++) {
      const x = i * this.blockSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let j = 0; j <= this.ROWS; j++) {
      const y = j * this.blockSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * 绘制内容：锁定矩阵中的方块或干扰块
   */
  private drawMatrix(matrix: Matrix): void {
    matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const color = cell === 'GARBAGE' ? GARBAGE_COLOR : (cell as string);
          this.drawBlock(x, y, color, cell === 'GARBAGE');
        }
      });
    });
  }

  /**
   * 绘制当前正在移动的方块
   */
  private drawPiece(piece: Piece): void {
    const { position, shape, color } = piece;
    shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          this.drawBlock(position.x + dx, position.y + dy, color, false);
        }
      });
    });
  }

  /**
   * 绘制单个带圆角和特殊装饰的方块
   */
  private drawBlock(x: number, y: number, color: string, isGarbage: boolean): void {
    const px = x * this.blockSize;
    const py = y * this.blockSize;
    const padding = 2;
    const size = this.blockSize - padding * 2;
    const radius = 12;

    this.ctx.save();
    this.ctx.translate(px + padding, py + padding);

    // 1. 绘制主体圆角矩形
    this.drawRoundedRect(0, 0, size, size, radius, color);

    // 2. 绘制动物表情 (正常或睡觉状态)
    if (isGarbage) {
      this.drawSleepingFace(size);
    } else {
      this.drawAnimalFace(size);
    }

    this.ctx.restore();
  }

  /**
   * 辅助函数：绘制圆角矩形
   */
  private drawRoundedRect(x: number, y: number, w: number, h: number, r: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
    this.ctx.fill();

    // 加上一层浅浅的描边增强质感
    this.ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * 辅助函数：绘制动物表情
   */
  private drawAnimalFace(size: number): void {
    // 眼睛
    const eyeSize = size * 0.12;
    const eyeY = size * 0.35;
    const eyeOffset = size * 0.22;

    this.ctx.fillStyle = '#3E2723'; // 深棕色眼睛
    
    // 左眼
    this.ctx.beginPath();
    this.ctx.arc(size / 2 - eyeOffset, eyeY, eyeSize / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 右眼
    this.ctx.beginPath();
    this.ctx.arc(size / 2 + eyeOffset, eyeY, eyeSize / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 鼻子 (倒三角形)
    const noseSize = size * 0.1;
    const noseY = size * 0.55;
    
    this.ctx.fillStyle = '#FF8A80'; // 浅粉色鼻子
    this.ctx.beginPath();
    this.ctx.moveTo(size / 2 - noseSize / 2, noseY);
    this.ctx.lineTo(size / 2 + noseSize / 2, noseY);
    this.ctx.lineTo(size / 2, noseY + noseSize * 0.8);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * 辅助函数：绘制睡觉表情 (U形眼)
   */
  private drawSleepingFace(size: number): void {
    const eyeY = size * 0.4;
    const eyeOffset = size * 0.22;
    const eyeRadius = size * 0.08;

    this.ctx.strokeStyle = '#757575'; // 灰色闭眼
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    // 左眼 (n形或u形)
    this.ctx.beginPath();
    this.ctx.arc(size / 2 - eyeOffset, eyeY, eyeRadius, 0, Math.PI, false);
    this.ctx.stroke();

    // 右眼
    this.ctx.beginPath();
    this.ctx.arc(size / 2 + eyeOffset, eyeY, eyeRadius, 0, Math.PI, false);
    this.ctx.stroke();

    // 鼻子 (小一点)
    this.ctx.fillStyle = '#BDBDBD';
    this.ctx.beginPath();
    this.ctx.arc(size / 2, size * 0.6, size * 0.05, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
