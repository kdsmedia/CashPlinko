export type Prize = number | 'ads' | 'zonk';

// 20 prize slots — biased toward zonk/ads/small for rigging
export const PRIZES: Prize[] = [
  5, 10, 25, 50, 100, 150, 200, 250, 500, 750,
  1000, 'ads', 'zonk', 'ads', 'zonk', 5, 10, 20, 15, 'ads',
];

// Indices that count as "bad" (zonk, ads, or ≤ 15 pts)
// Ball will be steered to these with high probability
export const RIGGED_PLINKO_INDICES: number[] = [
  0, 1, 11, 12, 13, 14, 15, 16, 18, 19,
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
export const ADMOB_BANNER_UNIT_ID = 'ca-app-pub-6881903056221433/5160607111';
export const ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-6881903056221433/7537724566';

// Interstitial video shows every 5 minutes of play
export const INTERSTITIAL_INTERVAL_MS = 5 * 60 * 1000;

// Peg physics constants
// Smaller radii so ball fits through the 21-pin bottom row (boardWidth/22 gap)
export const PEG_RADIUS = 3;
export const BALL_RADIUS = 4;
export const GRAVITY = 0.30;
export const RESTITUTION = 0.55;
export const FRICTION = 0.997;

export interface Peg {
  x: number;
  y: number;
}

export function generatePegs(boardWidth: number, boardHeight: number): Peg[] {
  const pegs: Peg[] = [];
  // 20 rows → bottom row has 21 pegs → 20 prize slots exactly
  const ROWS = 20;
  const TOP = 40;
  const BOTTOM_RESERVE = 36;
  const usableH = boardHeight - TOP - BOTTOM_RESERVE;
  const centerX = boardWidth / 2;

  // Pyramid: row 0 (top) = 2 pegs, row 19 (bottom) = 21 pegs.
  // spacing is based on 21+1=22 equal divisions of boardWidth.
  const BOTTOM_COUNT = 21;
  const spacing = boardWidth / (BOTTOM_COUNT + 1);

  for (let row = 0; row < ROWS; row++) {
    const count = 2 + row; // 2 … 21
    const y = TOP + (row / (ROWS - 1)) * usableH;
    const rowWidth = (count - 1) * spacing;
    const startX = centerX - rowWidth / 2;

    for (let col = 0; col < count; col++) {
      pegs.push({ x: startX + col * spacing, y });
    }
  }
  return pegs;
}

/**
 * Rig the landed slot toward a "bad" prize (ads/zonk/small).
 * With 85% probability, redirect to the nearest bad slot.
 */
export function riggedSlotIndex(naturalIndex: number, slotCount: number): number {
  const badIndices = RIGGED_PLINKO_INDICES.filter((i) => i < slotCount);
  if (badIndices.includes(naturalIndex)) return naturalIndex; // already bad

  // 50% chance to redirect to nearest bad slot
  if (Math.random() < 0.50) {
    let nearest = badIndices[0];
    let minDist = Math.abs(naturalIndex - badIndices[0]);
    for (const idx of badIndices) {
      const d = Math.abs(naturalIndex - idx);
      if (d < minDist) { minDist = d; nearest = idx; }
    }
    return nearest;
  }
  return naturalIndex;
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
