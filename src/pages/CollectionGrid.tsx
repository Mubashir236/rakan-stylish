/**
 * Lookbook collection grid — horizontal strip of looks.
 * Desktop: ~5 images visible, scroll horizontally to view more.
 * Mobile: 1 image per viewport width with horizontal swipe.
 */
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import { LOOK_IMAGES, NUM_LOOKS } from "@/data/looks";

const BG = "#F5F5F5";

// Duplicate local images up to 10 entries for the grid
const GRID_IMAGES = Array.from({ length: 10 }, (_, i) => LOOK_IMAGES[i % LOOK_IMAGES.length]);

export default function CollectionGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

    // Center the first card horizontally when the grid mounts
    if (cardsRef.current[0]) {
      cardsRef.current[0].scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "center",
      });
    }
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-x-auto overflow-y-auto"
      style={{ background: BG, scrollSnapType: "x mandatory" }}
    >
      {/* Row centered vertically with space above/below; models ~65vh, feet aligned */}
      <div className="min-h-screen flex flex-col items-center justify-center py-12 md:py-16">
        <div
          className="flex flex-row items-end gap-6 md:gap-8 px-6 md:px-10"
          style={{ width: "max-content" }}
        >
          {GRID_IMAGES.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="look-card group relative shrink-0 overflow-visible flex flex-col items-center justify-end w-[80vw] sm:w-[55vw] md:w-[22vw] lg:w-[18vw] xl:w-[16vw]"
              style={{ height: "65vh", scrollSnapAlign: "center" }}
            >
              {/* Card inner */}
              <div className="relative w-full h-full overflow-hidden rounded-sm">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
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
            </div>
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
