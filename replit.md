# PlinkoCash

A full-screen portrait mobile game (Expo/React Native) where players drop balls through a plinko board to win prizes. Prizes can be redeemed as real money via DANA transfer.

## Run & Operate

- `pnpm --filter @workspace/plinkocash run dev` — run the Expo dev server (scan QR code in Replit URL bar to test on device)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo ~54, React Native 0.81, Expo Router ~6
- State: React Context + AsyncStorage (no backend needed)
- Animation: react-native-reanimated ~4 (ball physics), Animated API (spin wheel)
- Graphics: react-native-svg (plinko board, spin wheel)
- Audio: expo-av (background music)
- UI: expo-linear-gradient, @expo/vector-icons

## Where things live

- `artifacts/plinkocash/` — main mobile app
  - `app/index.tsx` — main game screen (plinko board + controls)
  - `app/withdrawal.tsx` — DANA withdrawal + history
  - `app/info.tsx` — About / Disclaimer / Privacy Policy
  - `components/PlinkoBoard.tsx` — SVG plinko board with physics engine
  - `components/SpinWheelModal.tsx` — 10-segment spin wheel popup
  - `components/AddBallsModal.tsx` — add balls via points or ad
  - `components/WinCelebration.tsx` — win animation overlay
  - `components/GameHeader.tsx` — top bar icons
  - `context/GameContext.tsx` — all game state (balls, points, history)
  - `constants/game.ts` — prize list, physics constants, peg generator
  - `hooks/useAdReward.ts` — mock AdMob reward (swap for native SDK in prod build)
  - `hooks/useGameAudio.ts` — background music via expo-av

## Architecture decisions

- **AsyncStorage only** — no backend/DB needed; all state is local to device.
- **Physics on JS thread** — `setInterval(33ms)` updates ball state; Reanimated `useSharedValue` drives the SVG ball animation without React re-renders.
- **AdMob mocked** — `useAdReward` simulates a 3-second ad watch. Replace with `react-native-google-mobile-ads` in a native EAS build.
- **Rigged spin wheel** — always lands on ZONK or lowest value (indices 1,2,6,9) per design spec.
- **Daily ball limit** — 10 balls per day, reset is checked on app load via `lastDailyReset` timestamp in AsyncStorage.

## Product

PlinkoCash is a plinko game where players:
1. Drop balls through a pegged board to land on 20 prize slots (5–1000 pts, ads, zonk)
2. Spin a wheel for bonus prizes (always rigged to low/zonk per spec)
3. Earn points → withdraw as Rupiah via DANA (1000 pts = Rp 10)
4. Get extra balls via points trade (50 pts = 5 balls) or ad watch (2 balls free)

AdMob IDs:
- App ID: `ca-app-pub-6881903056221433~3983256819`
- Reward Unit: `ca-app-pub-6881903056221433/6525779813`
- Package: `com.plinkocash`

## User preferences

- Push every update to GitHub repository (origin: https://github.com/kdsmedia/CashPlinko)
- App name: PlinkoCash, package: com.plinkocash
- Language: Indonesian (UI labels, alerts, error messages)
- Always full-screen portrait game layout — no header chrome on game screen

## Gotchas

- AdMob requires a native/EAS build — it will not run in Expo Go. The mock in `useAdReward.ts` handles the fallback gracefully.
- `expo-av` is deprecated in SDK 54+ (in favor of `expo-audio`/`expo-video`) but still functional. Migrate when upgrading SDK.
- `react-native-reanimated` layout animations don't work on web — physics uses `useSharedValue` + `useAnimatedProps` which works on all platforms.
- The `google-services.json` is at the workspace root; `app.json` references it as `../../google-services.json` from the artifact directory.
