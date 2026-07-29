export type Prize = number | 'ads' | 'zonk';

export const PRIZES: Prize[] = [
  5, 10, 25, 50, 100, 150, 200, 250, 500, 750,
  1000, 'ads', 'zonk', 'ads', 'zonk', 5, 10, 20, 15, 'ads',
];

export interface SpinSegment {
  label: string;
  value: number | 'zonk' | 'ball1' | 'ball2' | 'ball5';
  color: string;
  balls?: number;
  points?: number;
}

export const SPIN_SEGMENTS: SpinSegment[] = [
  { label: '50', value: 50, color: '#FF6B00', points: 50 },
  { label: 'ZONK', value: 'zonk', color: '#3A3A5C' },
  { label: '10', value: 10, color: '#00AA44', points: 10 },
  { label: '25', value: 25, color: '#0099DD', points: 25 },
  { label: '+1 BOLA', value: 'ball1', color: '#8800DD', balls: 1 },
  { label: '+2 BOLA', value: 'ball2', color: '#6600BB', balls: 2 },
  { label: 'ZONK', value: 'zonk', color: '#3A3A5C' },
  { label: '100', value: 100, color: '#FFD700', points: 100 },
  { label: '+5 BOLA', value: 'ball5', color: '#4400AA', balls: 5 },
  { label: 'ZONK', value: 'zonk', color: '#3A3A5C' },
];

// Rigged: always land on these indices (zonk or value=10)
export const RIGGED_SPIN_INDICES = [1, 2, 6, 9];

export const DAILY_BALLS = 10;
export const POINTS_PER_BALL_PACK = 50;
export const BALLS_PER_PACK = 5;
export const BALLS_PER_AD = 2;

export const ADMOB_APP_ID = 'ca-app-pub-6881903056221433~3983256819';
export const ADMOB_REWARD_UNIT_ID = 'ca-app-pub-6881903056221433/6525779813';

// Peg physics constants
export const PEG_RADIUS = 5;
export const BALL_RADIUS = 9;
export const GRAVITY = 0.28;
export const RESTITUTION = 0.52;
export const FRICTION = 0.997;

export interface Peg {
  x: number;
  y: number;
}

export function generatePegs(boardWidth: number, boardHeight: number): Peg[] {
  const pegs: Peg[] = [];
  const ROWS = 12;
  const TOP = 45;
  const BOTTOM_RESERVE = 40;
  const usableH = boardHeight - TOP - BOTTOM_RESERVE;

  for (let row = 0; row < ROWS; row++) {
    const count = row % 2 === 0 ? 9 : 10;
    const spacing = boardWidth / (count + 1);
    const y = TOP + (row / (ROWS - 1)) * usableH;
    for (let col = 0; col < count; col++) {
      pegs.push({ x: spacing + col * spacing, y });
    }
  }
  return pegs;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export function physicsTick(
  ball: BallState,
  pegs: Peg[],
  boardWidth: number,
  floorY: number,
): BallState {
  if (!ball.active) return ball;

  let { x, y, vx, vy } = ball;

  vy += GRAVITY;
  vx *= FRICTION;
  x += vx;
  y += vy;

  // Wall collisions
  if (x < BALL_RADIUS) {
    x = BALL_RADIUS;
    vx = Math.abs(vx) * RESTITUTION;
  }
  if (x > boardWidth - BALL_RADIUS) {
    x = boardWidth - BALL_RADIUS;
    vx = -Math.abs(vx) * RESTITUTION;
  }

  // Peg collisions
  for (const peg of pegs) {
    const dx = x - peg.x;
    const dy = y - peg.y;
    const distSq = dx * dx + dy * dy;
    const minDist = BALL_RADIUS + PEG_RADIUS + 1;

    if (distSq < minDist * minDist && distSq > 0.001) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const dot = vx * nx + vy * ny;
      const rand = (Math.random() - 0.5) * 1.4;
      vx = (vx - 2 * dot * nx) * RESTITUTION + rand;
      vy = (vy - 2 * dot * ny) * RESTITUTION;
      if (vy < 0) vy *= 0.4;
      x = peg.x + nx * (minDist + 1);
      y = peg.y + ny * (minDist + 1);
      break;
    }
  }

  if (y >= floorY - BALL_RADIUS) {
    return { x, y: floorY - BALL_RADIUS, vx: 0, vy: 0, active: false };
  }

  return { x, y, vx, vy, active: true };
}

export function getPrizeColor(prize: Prize): string {
  if (prize === 'zonk') return '#2C2C44';
  if (prize === 'ads') return '#003EA6';
  const n = prize as number;
  if (n >= 500) return '#CC8800';
  if (n >= 100) return '#AA4400';
  if (n >= 25) return '#006622';
  return '#1A3A88';
}

export function getPrizeBrightColor(prize: Prize): string {
  if (prize === 'zonk') return '#6060A0';
  if (prize === 'ads') return '#0088FF';
  const n = prize as number;
  if (n >= 500) return '#FFD700';
  if (n >= 100) return '#FF6B00';
  if (n >= 25) return '#00BB55';
  return '#4488FF';
}

export function getPrizeLabel(prize: Prize): string {
  if (prize === 'zonk') return 'X';
  if (prize === 'ads') return 'AD';
  if ((prize as number) >= 1000) return '1K';
  return String(prize);
}

export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

export const WITHDRAWAL_NOMINALS = [100, 200, 500, 1000, 2000, 5000];
export const POINTS_PER_RUPIAH = 100; // 1000 pts = Rp 10 → 100 pts per rupiah
