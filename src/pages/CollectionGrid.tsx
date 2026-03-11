/**
 * Phase 1: Grid Collection (Overview) — Becane-style spotlight.
 * 15 models in flex-row; grayscale by default; circular spotlight reveals full color on mousemove.
 * Small circle, smooth transition between black/grayscale and color.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import { LOOK_IMAGES, NUM_LOOKS } from "@/data/looks";

const BG = "#F5F5F5";
const SPOTLIGHT_RADIUS = 90;

const SPOT_EASING = "cubic-bezier(0.33, 0, 0.2, 1)";
const SPOT_DURATION = "0.25s";

export default function CollectionGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<{ cardIndex: number; x: number; y: number } | null>(null);
  const rafPending = useRef(false);
  const nextSpot = useRef<{ cardIndex: number; x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>, cardIndex: number) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    nextSpot.current = { cardIndex, x, y };
    if (rafPending.current) return;
    rafPending.current = true;
    requestAnimationFrame(() => {
      rafPending.current = false;
      if (nextSpot.current) setSpot(nextSpot.current);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    nextSpot.current = null;
    requestAnimationFrame(() => setSpot(null));
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-x-auto overflow-y-auto"
      style={{ background: BG }}
    >
      {/* BECANE-style: row centered vertically with space above/below; models ~65vh, feet aligned */}
      <div className="min-h-screen flex flex-col items-center justify-center py-12 md:py-16">
        <div
          className="flex flex-row items-end gap-8 md:gap-12 px-6 md:px-10"
          style={{ width: "max-content" }}
        >
          {LOOK_IMAGES.map((src, i) => (
            <Link
              key={i}
              to={`/look/${String(i + 1).padStart(2, "0")}`}
              className="look-card group relative shrink-0 overflow-visible flex flex-col items-center justify-end"
              style={{ width: "min(28vw, 260px)", height: "65vh" }}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Card inner: full height for spotlight math */}
              <div className="relative w-full h-full overflow-hidden rounded-sm">
                {/* Base: grayscale / darkened */}
                <div
                  className="absolute inset-0 bg-neutral-800"
                  aria-hidden
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover object-bottom opacity-80"
                    style={{ filter: "grayscale(100%) brightness(0.55)" }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {/* Spotlight layer: full color, clipped by circle */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath:
                      spot?.cardIndex === i
                        ? `circle(${SPOTLIGHT_RADIUS}px at ${spot.x}px ${spot.y}px)`
                        : "circle(0px at -999px -999px)",
                    transition: `clip-path ${SPOT_DURATION} ${SPOT_EASING}`,
                    willChange: "clip-path",
                  }}
                  aria-hidden
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover object-bottom"
                    style={{ filter: "brightness(1.05)" }}
                  />
                </div>
              </div>
              {/* Label below figure */}
              <span
                className="mt-4 text-[10px] md:text-xs tracking-[0.2em] uppercase"
                style={{
                  fontFamily: "Playfair Display, Georgia, serif",
                  color: "rgba(0,0,0,0.6)",
                }}
              >
                Look {String(i + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/"
        className="fixed top-6 left-6 z-10 text-xs tracking-[0.2em] uppercase hover:opacity-70"
        style={{ color: "#1a1a1a" }}
      >
        ← Back
      </Link>
    </div>
  );
}
