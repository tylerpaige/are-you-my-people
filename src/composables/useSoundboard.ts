import { ref, reactive, computed } from 'vue';
import gsap from 'gsap';
import { getKeyDefinition, KEY_CONFIG, Letter, LETTERS } from '../lib/config';

const FADEOUT_MS = 1000;
/** Duration of slow fade while Enter is held (seconds). */
const ENTER_HOLD_SLOW_FADE_SEC = 3;
/** Duration of quick fade when Enter is released (seconds). */
const ENTER_RELEASE_QUICK_FADE_SEC = 0.2;

interface WebAudioPlayEntry {
  id: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startedAt: number;
  duration: number;
  progressTween: gsap.core.Tween;
  colorIndex: number;
}

export interface ActivePlay {
  id: string;
  progress: number;
  fadeOutProgress?: number;
  colorIndex: number;
}

export function useSoundboard() {
  const loading = ref(true);
  const activePlaysByKey = reactive<Record<string, WebAudioPlayEntry[]>>({});
  const progressById = reactive<Record<string, number>>({});
  const fadeOutProgressById = reactive<Record<string, number>>({});
  const durationsByUrl = reactive<Record<string, number>>({});
  const nextColorIndexByKey = reactive<Record<string, number>>({});
  const bufferByUrl: Record<string, AudioBuffer> = {};
  let audioContext: AudioContext | null = null;

  /** Play ids that were active when Enter was pressed; only these are faded by Enter. */
  let enterFadeSnapshotIds = new Set<string>();
  /** Active slow-fade tweens keyed by play id, so we can kill them on Enter release. */
  const enterFadeTweens = new Map<string, gsap.core.Tween>();

  function findPlayById(id: string): WebAudioPlayEntry | null {
    for (const letter of LETTERS) {
      const arr = activePlaysByKey[letter];
      if (!arr) continue;
      const entry = arr.find((p) => p.id === id);
      if (entry) return entry;
    }
    return null;
  }

  const lettersWithSound = Object.values(KEY_CONFIG).filter(
    (config) => config.soundUrl
  );
  const totalSounds = lettersWithSound.length;

  LETTERS.forEach((letter) => {
    activePlaysByKey[letter] = [];
    nextColorIndexByKey[letter] = 0;
  });

  function ensureAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  }

  function preload() {
    const ctx = ensureAudioContext();
    const promises = lettersWithSound.map((definition) => {
      const soundUrl = definition.soundUrl!;
      return fetch(soundUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${soundUrl}`);
          return res.arrayBuffer();
        })
        .then((arrayBuffer) =>
          ctx.decodeAudioData(arrayBuffer.slice(0))
        )
        .then((buffer) => {
          bufferByUrl[soundUrl] = buffer;
          const d = buffer.duration;
          durationsByUrl[soundUrl] = Number.isFinite(d) && d > 0 ? d : 1;
        });
    });

    return Promise.all(promises).then(() => {
      loading.value = false;
    });
  }

  function play(letter: Letter): void {
    const ctx = ensureAudioContext();
    if (ctx.state === 'suspended') {
      // iOS Safari often starts AudioContext in suspended state; resume on user gesture.
      void ctx.resume();
    }

    const config = getKeyDefinition(letter);
    const soundUrl = config?.soundUrl;
    if (!config || !soundUrl) return;

    const buffer = bufferByUrl[soundUrl];
    if (!buffer) {
      // Not yet decoded for some reason; fall back to a minimal HTMLAudioElement to avoid a hard no-op.
      const fallback = new Audio(soundUrl);
      fallback.preload = 'auto';
      fallback.play().catch(() => {});
      return;
    }

    const duration = durationsByUrl[soundUrl] ?? buffer.duration ?? 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1;
    source.connect(gainNode).connect(ctx.destination);

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
    if (plays) plays.push({ id, source, gainNode, startedAt, duration, progressTween, colorIndex });

    source.addEventListener('ended', () => {
      remove();
    });
    source.start(0);
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
        entry.source.stop();
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
        entry.source.stop();
        delete progressById[entry.id];
        delete fadeOutProgressById[entry.id];
      };

      gsap.to(fadeOutProgressById, {
        [entry.id]: 1,
        duration: fadeDurationSec,
        ease: 'none',
        onComplete: remove,
      });

      const volumeRef = { v: entry.gainNode.gain.value };
      gsap.to(volumeRef, {
        v: 0,
        duration: fadeDurationSec,
        ease: 'none',
        onUpdate: () => {
          entry.gainNode.gain.value = volumeRef.v;
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

  /**
   * Called on Enter keydown: snapshot currently playing sounds and start a slow
   * fade out. Only these snapshot sounds are affected; new plays are untouched.
   */
  function startEnterHoldFade(): void {
    const snapshot = new Set<string>();
    for (const letter of LETTERS) {
      const arr = activePlaysByKey[letter];
      if (!arr) continue;
      for (const entry of arr) snapshot.add(entry.id);
    }
    if (snapshot.size === 0) return;

    enterFadeSnapshotIds = snapshot;
    enterFadeTweens.clear();

    for (const letter of LETTERS) {
      const arr = activePlaysByKey[letter];
      if (!arr) continue;
      for (const entry of arr) {
        if (!snapshot.has(entry.id)) continue;
        const vol = { v: entry.gainNode.gain.value };
        const tween = gsap.to(vol, {
          v: 0,
          duration: ENTER_HOLD_SLOW_FADE_SEC,
          ease: 'none',
          onUpdate: () => {
            entry.gainNode.gain.value = vol.v;
          },
        });
        enterFadeTweens.set(entry.id, tween);
      }
    }
  }

  /**
   * Called on Enter keyup: stop slow fade and quick-fade snapshot sounds to 0,
   * then stop their sources. Only affects plays that were in the Enter keydown snapshot.
   */
  function endEnterHoldFade(): void {
    for (const id of enterFadeSnapshotIds) {
      const tween = enterFadeTweens.get(id);
      if (tween) tween.kill();
      enterFadeTweens.delete(id);

      const entry = findPlayById(id);
      if (!entry) continue;

      const vol = { v: entry.gainNode.gain.value };
      gsap.to(vol, {
        v: 0,
        duration: ENTER_RELEASE_QUICK_FADE_SEC,
        ease: 'none',
        onUpdate: () => {
          entry.gainNode.gain.value = vol.v;
        },
        onComplete: () => {
          entry.progressTween.kill();
          entry.source.stop();
        },
      });
    }
    enterFadeSnapshotIds = new Set();
    enterFadeTweens.clear();
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
    startEnterHoldFade,
    endEnterHoldFade,
    hasAnyActivePlays,
    KEY_CONFIG,
  };
}
