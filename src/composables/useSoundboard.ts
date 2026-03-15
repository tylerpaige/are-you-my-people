import { ref, reactive } from 'vue';
import gsap from 'gsap';
import { KEY_CONFIG } from '../lib/config';

export interface ActivePlay {
  id: string;
  progress: number;
}

export function useSoundboard() {
  const loading = ref(true);
  const activePlaysByKey = reactive<Record<string, { id: string }[]>>({});
  const progressById = reactive<Record<string, number>>({});
  const durationsByUrl = reactive<Record<string, number>>({});

  const keyCodes = Object.keys(KEY_CONFIG);
  keyCodes.forEach((code) => {
    activePlaysByKey[code] = [];
  });

  const keyCodesWithSound = keyCodes.filter((code) => KEY_CONFIG[code]?.soundUrl);

  function preload() {
    const promises = keyCodesWithSound.map((keyCode) => {
      const config = KEY_CONFIG[keyCode];
      const soundUrl = config?.soundUrl!;
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

  function play(keyCode: string): void {
    const config = KEY_CONFIG[keyCode];
    const soundUrl = config?.soundUrl;
    if (!config || !soundUrl) return;

    const duration = durationsByUrl[soundUrl] ?? 1;

    const audio = new Audio(soundUrl);
    const id = `${keyCode}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    progressById[id] = 0;
    const plays = activePlaysByKey[keyCode];
    if (plays) plays.push({ id });

    const remove = () => {
      const arr = activePlaysByKey[keyCode];
      if (arr) {
        const i = arr.findIndex((p) => p.id === id);
        if (i !== -1) arr.splice(i, 1);
      }
      delete progressById[id];
    };

    audio.addEventListener('ended', remove, { once: true });
    audio.play().catch(() => remove());

    gsap.to(progressById, {
      [id]: 1,
      duration,
      ease: 'none',
      onComplete: remove,
    });
  }

  function getActivePlays(keyCode: string): ActivePlay[] {
    const plays = activePlaysByKey[keyCode] ?? [];
    return plays.map((p) => ({ id: p.id, progress: progressById[p.id] ?? 0 }));
  }

  return {
    loading,
    activePlaysByKey,
    progressById,
    getActivePlays,
    durationsByUrl,
    preload,
    play,
    KEY_CONFIG,
  };
}
