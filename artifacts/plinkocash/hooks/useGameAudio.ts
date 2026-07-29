import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

// expo-av is deprecated in SDK 54+ in favour of expo-audio,
// but remains functional. Audio is loaded dynamically so the app
// doesn't crash if the module is unavailable (e.g. web).
let Audio: typeof import('expo-av')['Audio'] | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Audio = require('expo-av').Audio;
} catch {
  Audio = null;
}

export function useGameAudio() {
  const bgMusicRef = useRef<InstanceType<typeof import('expo-av').Audio.Sound> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!Audio || Platform.OS === 'web') return;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        const { sound } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../assets/sounds/backsound.mp3'),
          { isLooping: true, volume: 0.35, shouldPlay: true },
        );
        if (mountedRef.current) {
          bgMusicRef.current = sound;
        } else {
          sound.unloadAsync();
        }
      } catch (e) {
        // Audio unavailable — continue silently
      }
    };

    load();

    return () => {
      mountedRef.current = false;
      bgMusicRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const playWin = useCallback(async () => {
    if (!Audio || Platform.OS === 'web') return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../assets/sounds/backsound.mp3'),
        { volume: 0.6, shouldPlay: true },
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // no-op
    }
  }, []);

  const stopBgMusic = useCallback(async () => {
    try {
      await bgMusicRef.current?.pauseAsync();
    } catch {
      // no-op
    }
  }, []);

  const resumeBgMusic = useCallback(async () => {
    try {
      await bgMusicRef.current?.playAsync();
    } catch {
      // no-op
    }
  }, []);

  return { playWin, stopBgMusic, resumeBgMusic };
}
