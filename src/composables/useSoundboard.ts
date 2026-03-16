import { ref, reactive, computed } from 'vue';
import gsap from 'gsap';
import { getKeyDefinition, KEY_CONFIG, Letter, LETTERS } from '../lib/config';

const FADEOUT_MS = 1000;
const POOL_SIZE = 4;

export interface ActivePlay {
  id: string;
  progress: number;
  fadeOutProgress?: number;
  colorIndex: number;
}

interface PlayEntry {
  id: string;
  audio: HTMLAudioElement;
  startedAt: number;
  duration: number;
  progressTween: gsap.core.Tween;
  colorIndex: number;
}

export function useSoundboard() {
  const loading = ref(true);
  const activePlaysByKey = reactive<Record<string, PlayEntry[]>>({});
  const progressById = reactive<Record<string, number>>({});
  const fadeOutProgressById = reactive<Record<string, number>>({});
  const durationsByUrl = reactive<Record<string, number>>({});
  const nextColorIndexByKey = reactive<Record<string, number>>({});
  const audioPoolByUrl: Record<string, HTMLAudioElement[]> = {};
  const nextPoolIndexByUrl: Record<string, number> = {};

  const lettersWithSound = Object.values(KEY_CONFIG).filter(
    (config) => config.soundUrl
  );
  const totalSounds = lettersWithSound.length;

  LETTERS.forEach((letter) => {
    activePlaysByKey[letter] = [];
    nextColorIndexByKey[letter] = 0;
  });

  function preload() {
    const promises = lettersWithSound.map((definition) => {
      const soundUrl = definition.soundUrl!;
      return new Promise<void>((resolve, reject) => {
        // Create a small pool of HTMLAudioElements per sound so we can reuse
        // them for low-latency playback (especially on iOS Safari).
        const pool: HTMLAudioElement[] = [];
        audioPoolByUrl[soundUrl] = pool;
        nextPoolIndexByUrl[soundUrl] = 0;

        const primaryAudio = new Audio(soundUrl);
        primaryAudio.preload = 'auto';
        pool.push(primaryAudio);

        // Create additional pooled instances that will benefit from the
        // browser cache once the primary one has loaded.
        for (let i = 1; i < POOL_SIZE; i += 1) {
          const a = new Audio(soundUrl);
          a.preload = 'auto';
          pool.push(a);
        }

        primaryAudio.addEventListener(
          'canplaythrough',
          () => {
            const d = primaryAudio.duration;
            if (Number.isFinite(d) && d > 0) {
              durationsByUrl[soundUrl] = d;
            } else {
              durationsByUrl[soundUrl] = 1;
            }
            resolve();
          },
          { once: true }
        );
        primaryAudio.addEventListener(
          'error',
          () => reject(new Error(`Failed to load ${soundUrl}`)),
          { once: true }
        );
        primaryAudio.load();
      });
    });

    return Promise.all(promises).then(() => {
      loading.value = false;
    });
  }

  function play(letter: Letter): void {
    const config = getKeyDefinition(letter);
    const soundUrl = config?.soundUrl;
    if (!config || !soundUrl) return;

    const duration = durationsByUrl[soundUrl] ?? 1;

    const pool = audioPoolByUrl[soundUrl];
    let audio: HTMLAudioElement;
    if (pool && pool.length > 0) {
      // Prefer a non-playing instance; fall back to the first in the pool.
      const available = pool.find((a) => a && a.paused);
      audio = available ?? pool[0]!;
    } else {
      // Fallback for any sounds that weren't preloaded for some reason.
      audio = new Audio(soundUrl);
      audio.preload = 'auto';
    }

    audio.volume = 1;
    try {
      // Reset playback position for re-use; guard in case readyState is not yet sufficient.
      audio.currentTime = 0;
    } catch {
      // Ignore; the browser will start from the current position if it can't seek yet.
    }
    const id = `${letter}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const startedAt = Date.now();
    progressById[id] = 0;

    const remove = () => {
      const arr = activePlaysByKey[letter];
      if (arr) {
        const i = arr.findIndex((p) => p.id === id);
        if (i !== -1) arr.splice(i, 1);
      }
      delete progressById[id];
      delete fadeOutProgressById[id];
    };

    const progressTween = gsap.to(progressById, {
      [id]: 1,
      duration,
      ease: 'none',
      onComplete: remove,
    });

    const colorIndex = nextColorIndexByKey[letter] ?? 0;
    nextColorIndexByKey[letter] = (colorIndex + 1) % 4;

    const plays = activePlaysByKey[letter];
    if (plays) plays.push({ id, audio, startedAt, duration, progressTween, colorIndex });

    audio.addEventListener('ended', remove, { once: true });
    audio.play().catch(() => {
      progressTween.kill();
      remove();
    });
  }

  function fadeOut(letter: Letter): void {
    const plays = activePlaysByKey[letter];
    if (!plays?.length) return;

    const entries = [...plays];
    entries.forEach((entry) => {
      const elapsedSec = (Date.now() - entry.startedAt) / 1000;
      const remainingSec = Math.max(0, entry.duration - elapsedSec);
      const fadeDurationSec = Math.min(FADEOUT_MS / 1000, remainingSec);
      if (fadeDurationSec <= 0) {
        entry.audio.pause();
        entry.progressTween.kill();
        const idx = plays.findIndex((p) => p.id === entry.id);
        if (idx !== -1) plays.splice(idx, 1);
        delete progressById[entry.id];
        delete fadeOutProgressById[entry.id];
        return;
      }

      entry.progressTween.kill();
      fadeOutProgressById[entry.id] = 0;

      const remove = () => {
        const arr = activePlaysByKey[letter];
        const i = arr?.findIndex((p) => p.id === entry.id);
        if (arr != null && i !== undefined && i !== -1) arr.splice(i, 1);
        entry.audio.pause();
        delete progressById[entry.id];
        delete fadeOutProgressById[entry.id];
      };

      gsap.to(fadeOutProgressById, {
        [entry.id]: 1,
        duration: fadeDurationSec,
        ease: 'none',
        onComplete: remove,
      });

      const volumeRef = { v: entry.audio.volume };
      gsap.to(volumeRef, {
        v: 0,
        duration: fadeDurationSec,
        ease: 'none',
        onUpdate: () => {
          entry.audio.volume = volumeRef.v;
        },
      });
    });
  }

  function getActivePlays(letter: Letter): ActivePlay[] {
    const plays = activePlaysByKey[letter] ?? [];
    return plays.map((p) => ({
      id: p.id,
      progress: progressById[p.id] ?? 0,
      fadeOutProgress: fadeOutProgressById[p.id] ?? 0,
      colorIndex: p.colorIndex,
    }));
  }

  function fadeOutAll(): void {
    LETTERS.forEach((letter) => {
      if ((activePlaysByKey[letter]?.length ?? 0) > 0) {
        fadeOut(letter);
      }
    });
  }

  const hasAnyActivePlays = computed(() =>
    LETTERS.some((letter) => (activePlaysByKey[letter]?.length ?? 0) > 0)
  );

  const loadedSoundsCount = computed(
    () => Object.keys(durationsByUrl).length
  );
  const allSoundsLoaded = computed(
    () => totalSounds > 0 && loadedSoundsCount.value >= totalSounds
  );

  return {
    loading,
    activePlaysByKey,
    progressById,
    getActivePlays,
    durationsByUrl,
    totalSounds,
    loadedSoundsCount,
    allSoundsLoaded,
    preload,
    play,
    fadeOut,
    fadeOutAll,
    hasAnyActivePlays,
    KEY_CONFIG,
  };
}
