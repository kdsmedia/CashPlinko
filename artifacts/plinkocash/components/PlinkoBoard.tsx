import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import {
  PRIZES,
  generatePegs,
  physicsTick,
  getPrizeColor,
  getPrizeBrightColor,
  getPrizeLabel,
  Peg,
  BallState,
  Prize,
  BALL_RADIUS,
  PEG_RADIUS,
} from '@/constants/game';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SLOT_HEIGHT = 36;
const SLOT_COUNT = PRIZES.length; // 20

interface PlinkoBoardProps {
  boardWidth: number;
  boardHeight: number;
  onPrizeLanded: (prize: Prize, slotIndex: number) => void;
  dropTrigger: number; // increment to trigger drop
  onDropComplete: () => void;
  highlightSlot?: number | null;
}

export function PlinkoBoard({
  boardWidth,
  boardHeight,
  onPrizeLanded,
  dropTrigger,
  onDropComplete,
  highlightSlot,
}: PlinkoBoardProps) {
  const pegs = useMemo(
    () => generatePegs(boardWidth, boardHeight - SLOT_HEIGHT),
    [boardWidth, boardHeight],
  );

  const ballX = useSharedValue<number>(boardWidth / 2);
  const ballY = useSharedValue<number>(-BALL_RADIUS * 2);
  const ballOpacity = useSharedValue<number>(0);

  const animatedBallProps = useAnimatedProps(() => ({
    cx: ballX.value,
    cy: ballY.value,
    opacity: ballOpacity.value,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ballStateRef = useRef<BallState | null>(null);
  const isDropping = useRef(false);
  const [activeDrop, setActiveDrop] = useState(false);

  const floorY = boardHeight - SLOT_HEIGHT - BALL_RADIUS;

  const triggerDrop = useCallback(() => {
    if (isDropping.current) return;
    isDropping.current = true;
    setActiveDrop(true);

    const startX = boardWidth / 2 + (Math.random() - 0.5) * 24;
    const initBall: BallState = {
      x: startX,
      y: BALL_RADIUS + 4,
      vx: (Math.random() - 0.5) * 1.8,
      vy: 0,
      active: true,
    };

    ballStateRef.current = { ...initBall };
    ballX.value = initBall.x;
    ballY.value = initBall.y;
    ballOpacity.value = 1;

    intervalRef.current = setInterval(() => {
      if (!ballStateRef.current) return;

      const next = physicsTick(
        ballStateRef.current,
        pegs,
        boardWidth,
        floorY,
      );
      ballStateRef.current = next;
      ballX.value = next.x;
      ballY.value = next.y;

      if (!next.active) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        const slotWidth = boardWidth / SLOT_COUNT;
        const slotIndex = Math.max(
          0,
          Math.min(SLOT_COUNT - 1, Math.floor(next.x / slotWidth)),
        );
        const prize = PRIZES[slotIndex];

        // Brief pause then hide
        setTimeout(() => {
          ballOpacity.value = 0;
          isDropping.current = false;
          setActiveDrop(false);
          onDropComplete();
          onPrizeLanded(prize, slotIndex);
        }, 500);
      }
    }, 33); // ~30fps
  }, [boardWidth, pegs, floorY, onPrizeLanded, onDropComplete]);

  // React to external drop trigger
  const prevTrigger = useRef(0);
  useEffect(() => {
    if (dropTrigger !== prevTrigger.current && dropTrigger > 0) {
      prevTrigger.current = dropTrigger;
      triggerDrop();
    }
  }, [dropTrigger, triggerDrop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const slotWidth = boardWidth / SLOT_COUNT;

  return (
    <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
      <Svg
        width={boardWidth}
        height={boardHeight}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="ballGrad" cx="40%" cy="35%" r="60%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.6" stopColor="#FFD700" stopOpacity="1" />
            <Stop offset="1" stopColor="#FF6B00" stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="pegGrad" cx="35%" cy="30%" r="65%">
            <Stop offset="0" stopColor="#CCA8FF" stopOpacity="1" />
            <Stop offset="1" stopColor="#5A2090" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Prize slots */}
        {PRIZES.map((prize, i) => {
          const isHighlighted = highlightSlot === i;
          const baseColor = getPrizeColor(prize);
          const brightColor = getPrizeBrightColor(prize);
          const x = i * slotWidth;
          const y = boardHeight - SLOT_HEIGHT;

          return (
            <React.Fragment key={`slot-${i}`}>
              <Rect
                x={x + 0.5}
                y={y}
                width={slotWidth - 1}
                height={SLOT_HEIGHT}
                fill={isHighlighted ? brightColor : baseColor}
                rx={2}
              />
              <SvgText
                x={x + slotWidth / 2}
                y={y + SLOT_HEIGHT / 2 + 4}
                textAnchor="middle"
                fill={isHighlighted ? '#000' : '#FFFFFF'}
                fontSize={slotWidth > 22 ? 8 : 7}
                fontWeight="bold"
              >
                {getPrizeLabel(prize)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Slot dividers */}
        {PRIZES.map((_, i) => (
          <Rect
            key={`div-${i}`}
            x={i * slotWidth}
            y={boardHeight - SLOT_HEIGHT}
            width={0.5}
            height={SLOT_HEIGHT}
            fill="rgba(255,255,255,0.15)"
          />
        ))}

        {/* Pegs */}
        {pegs.map((peg: Peg, i: number) => (
          <Circle
            key={`peg-${i}`}
            cx={peg.x}
            cy={peg.y}
            r={PEG_RADIUS}
            fill="url(#pegGrad)"
          />
        ))}

        {/* Ball */}
        <AnimatedCircle
          animatedProps={animatedBallProps}
          r={BALL_RADIUS}
          fill="url(#ballGrad)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
