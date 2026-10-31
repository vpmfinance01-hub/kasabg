"use client";
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/** Показва съдържанието с лек ефект, когато влезе в екрана. */
export function Reveal({
  children, delay = 0, variant = "up", as: Tag = "div", className = "",
}: { children: ReactNode; delay?: number; variant?: "up" | "left" | "scale"; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return el.setAttribute("data-in", "");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const v = variant === "left" ? "reveal-left" : variant === "scale" ? "reveal-scale" : "";
  return (
    <Tag ref={ref} className={`reveal ${v} ${className}`} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

/** Карта със светлина, която следва мишката. */
export function Spot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`spot ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
