"use client";

import { useEffect, useState } from "react";
import { SECTIONS, type SectionId } from "./copy";

/**
 * Scroll-spy matching the design: the section whose top sits above 35% of the
 * viewport wins. rAF-throttled so scrolling stays cheap.
 */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>(SECTIONS[0].id);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight * 0.35;
      let next = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= mid) next = s.id;
      }
      setActive((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return active;
}
