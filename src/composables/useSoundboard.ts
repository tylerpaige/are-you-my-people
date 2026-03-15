import { ref, reactive, computed } from 'vue';
import gsap from 'gsap';
import { getKeyDefinition, KEY_CONFIG, Letter, LETTERS } from '../lib/config';

const FADEOUT_MS = 500;

export interface ActivePlay {
  id: string;
  progress: number;
  fadeOutProgress?: number;
}

interface PlayEntry {
  id: string;
  audio: HTMLAudioElement;
  startedAt: number;
  duration: number;
  progressTween: gsap.core.Tween;
}

export function useSoundboard() {
  const loading = ref(true);
  const activePlaysByKey = reactive<Record<string, PlayEntry[]>>({});
  const progressById = reactive<Record<string, number>>({});
  const fadeOutProgressById = reactive<Record<string, number>>({});
  const durationsByUrl = reactive<Record<string, number>>({});

  LETTERS.forEach((letter) => {
    activePlaysByKey[letter] = [];
  });

  const lettersWithSound = Object.values(KEY_CONFIG).filter(
    (config) => config.soundUrl
  );

  function preload() {
    const promises = lettersWithSound.map((definition) => {
      const soundUrl = definition.soundUrl!;
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(soundUrl);
        audio.addEventListener(
          'canplaythrough',
          () => {
            const d = audio.duration;
            if (Number.isFinite(d) && d > 0) {
              durationsByUrl[soundUrl] = d;
            } else {
              durationsByUrl[soundUrl] = 1;
            }
            resolve();
          },
          { once: true }
        );
        audio.addEventListener(
          'error',
          () => reject(new Error(`Failed to load ${soundUrl}`)),
          { once: true }
        );
        audio.load();
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

    const audio = new Audio(soundUrl);
    audio.volume = 1;
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

    const plays = activePlaysByKey[letter];
    if (plays) plays.push({ id, audio, startedAt, duration, progressTween });

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

  return {
    loading,
    activePlaysByKey,
    progressById,
    getActivePlays,
    durationsByUrl,
    preload,
    play,
    fadeOut,
    fadeOutAll,
    hasAnyActivePlays,
    KEY_CONFIG,
  };
}
