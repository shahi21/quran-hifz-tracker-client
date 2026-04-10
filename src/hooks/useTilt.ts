import { useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type TiltOptions = {
  maxTiltDeg?: number;
  maxLiftPx?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Lightweight, no-state 3D tilt: writes CSS variables directly for buttery motion.
// Automatically no-ops on touch/coarse pointers and honors prefers-reduced-motion.
export function useTilt<T extends HTMLElement = HTMLElement>(options: TiltOptions = {}) {
  const maxTiltDeg = options.maxTiltDeg ?? 7.5;
  const maxLiftPx = options.maxLiftPx ?? 10;
  const ref = useRef<T | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef({ x: 0, y: 0 });

  function canAnimate() {
    if (typeof window === "undefined") return false;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const finePointer = window.matchMedia?.("(pointer: fine)")?.matches ?? false;
    return !reducedMotion && finePointer;
  }

  const handlers = useMemo(() => {
    function setVars(target: HTMLElement, clientX: number, clientY: number) {
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const px = clamp((clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((clientY - rect.top) / rect.height, 0, 1);

      // Map pointer position to [-1, 1] around center.
      const dx = (px - 0.5) * 2;
      const dy = (py - 0.5) * 2;

      // rotateX reacts to vertical movement (invert for natural feel)
      const rx = (-dy * maxTiltDeg).toFixed(3);
      const ry = (dx * maxTiltDeg).toFixed(3);
      const lift = (Math.hypot(dx, dy) * maxLiftPx).toFixed(2);
      const t = clamp(Math.hypot(dx, dy), 0, 1).toFixed(3);

      target.style.setProperty("--rx", `${rx}deg`);
      target.style.setProperty("--ry", `${ry}deg`);
      target.style.setProperty("--lift", `${lift}px`);
      target.style.setProperty("--px", `${(px * 100).toFixed(2)}%`);
      target.style.setProperty("--py", `${(py * 100).toFixed(2)}%`);
      target.style.setProperty("--dx", `${dx.toFixed(3)}`);
      target.style.setProperty("--dy", `${dy.toFixed(3)}`);
      target.style.setProperty("--t", `${t}`);
    }

    return {
      onPointerEnter(event: ReactPointerEvent<T>) {
        const el = ref.current;
        if (!el) return;
        if (!canAnimate()) return;
        // Prevent touch from triggering tilt.
        if (event.pointerType !== "mouse") return;
        el.dataset.tilting = "1";
      },
      onPointerMove(event: ReactPointerEvent<T>) {
        const el = ref.current;
        if (!el) return;
        if (!canAnimate()) return;
        if (event.pointerType !== "mouse") return;

        lastRef.current = { x: event.clientX, y: event.clientY };
        if (rafRef.current != null) return;

        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          setVars(el, lastRef.current.x, lastRef.current.y);
        });
      },
      onPointerLeave(event: ReactPointerEvent<T>) {
        const el = ref.current;
        if (!el) return;
        if (event.pointerType !== "mouse") return;

        el.dataset.tilting = "0";
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--lift", "0px");
        el.style.setProperty("--px", "50%");
        el.style.setProperty("--py", "50%");
        el.style.setProperty("--dx", "0");
        el.style.setProperty("--dy", "0");
        el.style.setProperty("--t", "0");
      },
    };
  }, [maxLiftPx, maxTiltDeg]);

  return { ref, handlers };
}
