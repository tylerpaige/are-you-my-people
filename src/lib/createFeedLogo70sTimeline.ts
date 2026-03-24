import gsap from 'gsap';

/**
 * Durations (seconds) for the feed logo “70s broadcast” loop.
 * Adjust these values to retime the sequence; marquees default to 12s each.
 */
export interface FeedLogo70sTimings {
  /** 1. Fade in, centered */
  fadeInCentered: number;
  /** 2. Hold */
  holdAfterFadeIn: number;
  /** 3. Spin + scale to 0 */
  spinAndShrink: number;
  /** 4. Hold (invisible) */
  holdAfterSpin: number;
  /** 5. Marquee right → left */
  marqueeHorizontal: number;
  /** 6. Hold */
  holdAfterMarqueeH: number;
  /** 7. Fade in, centered */
  fadeInCentered2: number;
  /** 8. Wiggle + scale up + fade out */
  wiggleFadeOut: number;
  /** 9. Hold */
  holdAfterWiggle: number;
  /** 10. Marquee top → bottom */
  marqueeVertical: number;
  /** 11. Hold, then loop */
  holdEnd: number;
  /** Full 360° rotations during segment 3 */
  spinTurns: number;
  /** Peak scale during segment 8 */
  wiggleMaxScale: number;
  /** Horizontal marquee: start/end offset in vw from center */
  marqueeOffsetVw: number;
  /** Vertical marquee: start/end offset in vh from center */
  marqueeOffsetVh: number;
}

export const FEED_LOGO_70S_DEFAULT_TIMINGS: FeedLogo70sTimings = {
  fadeInCentered: 5,
  holdAfterFadeIn: 1.5,
  spinAndShrink: 1,
  holdAfterSpin: 0,
  marqueeHorizontal: 24,
  holdAfterMarqueeH: 1.5,
  fadeInCentered2: 5,
  wiggleFadeOut: 3,
  holdAfterWiggle: 1.5,
  marqueeVertical: 12,
  holdEnd: 1.5,
  spinTurns: 5,
  wiggleMaxScale: 5,
  marqueeOffsetVw: 105,
  marqueeOffsetVh: 110,
};

function mergeTimings(
  overrides: Partial<FeedLogo70sTimings>
): FeedLogo70sTimings {
  return { ...FEED_LOGO_70S_DEFAULT_TIMINGS, ...overrides };
}

/**
 * Builds an infinite GSAP timeline for the feed logo. Call `kill()` on the
 * returned timeline when the element unmounts or animation should stop.
 */
export function createFeedLogo70sTimeline(
  el: HTMLElement,
  timings: Partial<FeedLogo70sTimings> = {}
): gsap.core.Timeline {
  const t = mergeTimings(timings);
  const spinDeg = t.spinTurns * 360;
  const xMarq = t.marqueeOffsetVw;
  const yMarq = t.marqueeOffsetVh;

  gsap.killTweensOf(el);

  gsap.set(el, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    transformOrigin: '50% 50%',
    zIndex: 20,
    opacity: 0,
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  });

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });

  // 1–2: fade in, hold implied before next tween’s +=holdAfterFadeIn
  tl.fromTo(
    el,
    { opacity: 0, scale: 1, rotation: 0, x: 0, y: 0 },
    { opacity: 1, duration: t.fadeInCentered, ease: 'power1.inOut' }
  );

  // 3: spin + shrink (after hold 2)
  tl.to(
    el,
    {
      rotation: spinDeg,
      scale: 0,
      duration: t.spinAndShrink,
      ease: 'power2.in',
    },
    `+=${t.holdAfterFadeIn}`
  );

  // 4: hold invisible
  tl.add(gsap.delayedCall(t.holdAfterSpin, () => {}));

  // 5: horizontal marquee
  tl.set(el, {
    scale: 0.5,
    rotation: 0,
    opacity: 1,
    x: `${xMarq}vw`,
    y: 0,
  });
  tl.to(el, {
    scale: 0.5,
    x: `-${xMarq}vw`,
    duration: t.marqueeHorizontal,
    ease: 'none',
  });

  // 6: hold off left
  tl.add(gsap.delayedCall(t.holdAfterMarqueeH, () => {}));

  // 7: center + second fade in
  tl.set(el, { x: 0, y: 0, opacity: 0, scale: 1 });
  tl.to(el, {
    scale: 1,
    opacity: 1,
    duration: t.fadeInCentered2,
    ease: 'power1.inOut',
  });

  // 8: wiggle + scale + fade (portions sum to 1)
  const w = t.wiggleFadeOut;
  const wiggleSteps: Array<{
    scale: number;
    rotation: number;
    opacity: number;
    portion: number;
    ease: string;
  }> = [
    {
      scale: 2.1,
      rotation: -14,
      opacity: 0.74,
      portion: 0.22,
      ease: 'sine.inOut',
    },
    {
      scale: 3.2,
      rotation: 12,
      opacity: 0.48,
      portion: 0.22,
      ease: 'sine.inOut',
    },
    {
      scale: 4,
      rotation: -9,
      opacity: 0.28,
      portion: 0.22,
      ease: 'sine.inOut',
    },
    {
      scale: 4.65,
      rotation: 7,
      opacity: 0.12,
      portion: 0.17,
      ease: 'sine.inOut',
    },
    {
      scale: t.wiggleMaxScale,
      rotation: 0,
      opacity: 0,
      portion: 0.17,
      ease: 'power1.out',
    },
  ];
  for (const step of wiggleSteps) {
    const { portion, ease, ...props } = step;
    tl.to(el, { ...props, duration: w * portion, ease });
  }

  // 9: hold (invisible, large)
  tl.add(gsap.delayedCall(t.holdAfterWiggle, () => {}));

  // 10: vertical marquee
  tl.set(el, {
    scale: 0.5,
    rotation: 0,
    opacity: 1,
    x: 0,
    y: `-${yMarq}vh`,
  });
  tl.to(el, {
    scale: 0.5,
    y: `${yMarq}vh`,
    duration: t.marqueeVertical,
    ease: 'none',
  });

  // 11: hold at bottom, then reset for loop
  tl.add(gsap.delayedCall(t.holdEnd, () => {}));
  tl.set(el, { opacity: 0, y: 0, x: 0, scale: 1, rotation: 0 });

  return tl;
}
