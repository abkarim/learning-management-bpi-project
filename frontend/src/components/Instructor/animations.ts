import { useEffect, useRef, useState } from "react";

/** Simple delay helper (fake loading-er jonno) */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Inline animation style: style={anim("my-keyframe", 200)} */
export const anim = (name: string, delay = 0, duration = 600) => ({
  animation: `${name} ${duration}ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
});

/** Element screen-e ashle true hoy (scroll korle animation shuru) */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

/** 0 theke target porjonto gune gune uthe. enabled=false thakle shuru hoy na */
export function useCountUp(
  target: number,
  enabled = true,
  duration = 1200,
  delay = 0,
  decimals = 0
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Number((eased * target).toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, enabled, duration, delay, decimals]);

  return value;
}