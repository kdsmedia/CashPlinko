import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_BALLS, Prize } from '@/constants/game';

export interface GameRecord {
  id: string;
  prize: Prize;
  timestamp: number;
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  points: number;
  danaName: string;
  danaNumber: string;
  timestamp: number;
  status: 'menunggu' | 'sukses';
}

interface GameContextType {
  balls: number;
  points: number;
  gameHistory: GameRecord[];
  withdrawalHistory: WithdrawalRecord[];
  dropBall: () => boolean;
  addBalls: (n: number) => void;
  addPoints: (n: number) => void;
  spendPoints: (n: number) => boolean;
  addGameRecord: (prize: Prize) => void;
  addWithdrawal: (params: {
    amount: number;
    points: number;
    danaName: string;
    danaNumber: string;
  }) => void;
  isLoaded: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

const STORAGE_KEY = '@plinkocash_state';
const MS_24H = 24 * 60 * 60 * 1000;

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function isSameDay(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Auto-promote 'menunggu' → 'sukses' if > 24 h old */
function applyAutoStatus(records: WithdrawalRecord[]): WithdrawalRecord[] {
  const now = Date.now();
  return records.map((r) =>
    r.status === 'menunggu' && now - r.timestamp >= MS_24H
      ? { ...r, status: 'sukses' as const }
      : r,
  );
}

interface StoredState {
  balls: number;
  points: number;
  lastDailyReset: number;
  gameHistory: GameRecord[];
  withdrawalHistory: WithdrawalRecord[];
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [balls, setBalls] = useState<number>(DAILY_BALLS);
  const [points, setPoints] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastDailyReset = useRef<number>(Date.now());

  // Load from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved: StoredState = JSON.parse(raw);
            // Check daily reset
            if (!isSameDay(saved.lastDailyReset)) {
              setBalls(DAILY_BALLS);
              lastDailyReset.current = Date.now();
            } else {
              setBalls(saved.balls);
              lastDailyReset.current = saved.lastDailyReset;
            }
            setPoints(saved.points ?? 0);
            setGameHistory(saved.gameHistory ?? []);
            // Apply auto-status upgrade on load
            setWithdrawalHistory(applyAutoStatus(saved.withdrawalHistory ?? []));
          } catch {
            setBalls(DAILY_BALLS);
          }
        }
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  // Periodically check & promote menunggu → sukses (every 5 min while app is open)
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setWithdrawalHistory((prev) => applyAutoStatus(prev));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  // Persist whenever state changes
  const saveRef = useRef({
    balls,
    points,
    gameHistory,
    withdrawalHistory,
  });
  saveRef.current = { balls, points, gameHistory, withdrawalHistory };

  useEffect(() => {
    if (!isLoaded) return;
    const state: StoredState = {
      balls: saveRef.current.balls,
      points: saveRef.current.points,
      lastDailyReset: lastDailyReset.current,
      gameHistory: saveRef.current.gameHistory,
      withdrawalHistory: saveRef.current.withdrawalHistory,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [balls, points, gameHistory, withdrawalHistory, isLoaded]);

  const dropBall = useCallback((): boolean => {
    if (balls <= 0) return false;
    setBalls((b) => b - 1);
    return true;
  }, [balls]);

  const addBalls = useCallback((n: number) => {
    setBalls((b) => b + n);
  }, []);

  const addPoints = useCallback((n: number) => {
    setPoints((p) => p + n);
  }, []);

  const spendPoints = useCallback(
    (n: number): boolean => {
      if (points < n) return false;
      setPoints((p) => p - n);
      return true;
    },
    [points],
  );

  const addGameRecord = useCallback((prize: Prize) => {
    const record: GameRecord = {
      id: genId(),
      prize,
      timestamp: Date.now(),
    };
    setGameHistory((h) => [record, ...h].slice(0, 100));
    if (typeof prize === 'number') {
      setPoints((p) => p + prize);
    }
  }, []);

  const addWithdrawal = useCallback(
    (params: {
      amount: number;
      points: number;
      danaName: string;
      danaNumber: string;
    }) => {
      const record: WithdrawalRecord = {
        id: genId(),
        ...params,
        timestamp: Date.now(),
        status: 'menunggu',
      };
      setWithdrawalHistory((h) => [record, ...h].slice(0, 50));
      setPoints((p) => p - params.points);
    },
    [],
  );

  return (
    <GameContext.Provider
      value={{
        balls,
        points,
        gameHistory,
        withdrawalHistory,
        dropBall,
        addBalls,
        addPoints,
        spendPoints,
        addGameRecord,
        addWithdrawal,
        isLoaded,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
