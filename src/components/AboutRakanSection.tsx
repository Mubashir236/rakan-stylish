import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type AboutRakanSectionProps = {
  videoSrc: string;
};

export default function AboutRakanSection({ videoSrc }: AboutRakanSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -8, -20]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 1, 0.4]);
  const videoScale = useTransform(scrollYProgress, [0, 0.4, 1], [0.92, 1, 1.02]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.7]);

  return (
    <section
      ref={sectionRef}
      className="about-rakan relative min-h-[100vh] overflow-x-hidden"
      style={{ background: "#F5F5F5" }}
    >
      <div className="about-rakan__container">
        <div className="about-rakan__layout">
          <motion.div
            className="about-rakan__main-text"
            style={{ y: titleY, opacity: titleOpacity }}
          >
            <div className="about-rakan__title">
              <span className="about-rakan__title-label">About</span>
              <span className="about-rakan__title-name">RAKAN</span>
            </div>
            <p className="about-rakan__intro">
              Luxury styling, education, and image consulting for those who demand excellence in every detail.
            </p>
          </motion.div>

          <motion.div
            ref={videoWrapRef}
            className="about-rakan__video-wrap"
            style={{ scale: videoScale, opacity: videoOpacity }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px", amount: 0.15 }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="about-rakan__video-frame">
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="about-rakan__video"
              />
            </div>
            <div className="about-rakan__video-caption">
              <span className="about-rakan__video-caption-line" />
              <span className="about-rakan__video-caption-text">The Rakan Experience</span>
              <span className="about-rakan__video-caption-line" />
            </div>
          </motion.div>
        </div>
      </div>

      <style>{ABOUT_RAKAN_CSS}</style>
    </section>
  );
}

const ABOUT_RAKAN_CSS = `
  .about-rakan {
    isolation: isolate;
    box-sizing: border-box;
  }

  .about-rakan *,
  .about-rakan *::before,
  .about-rakan *::after {
    box-sizing: border-box;
  }

  .about-rakan__container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 3rem) clamp(1.25rem, 5vw, 4rem);
    padding-bottom: clamp(3rem, 12vh, 20vh);
  }

  .about-rakan__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr);
    gap: clamp(2.5rem, 5vw, 4rem);
    align-items: center;
  }

  .about-rakan__main-text {
    position: relative;
    z-index: 2;
    max-width: 720px;
  }

  .about-rakan__title {
    display: flex;
    flex-direction: column;
    gap: 0.1em;
    margin: 0 0 1.25rem 0;
  }

  .about-rakan__title-label {
    font-family: "Cinzel", Georgia, serif;
    font-weight: 500;
    font-size: clamp(0.7rem, 2vw, 0.95rem);
    letter-spacing: 0.35em;
    color: #1A1A1A;
    text-transform: uppercase;
  }

  .about-rakan__title-name {
    font-family: "Cinzel", Georgia, serif;
    font-weight: 500;
    font-size: clamp(2.25rem, 10vw, 5.5rem);
    letter-spacing: 0.2em;
    color: #1A1A1A;
    line-height: 1.05;
    word-break: keep-all;
  }

  .about-rakan__intro {
    font-size: clamp(0.9375rem, 1.5vw, 1.1rem);
    line-height: 1.7;
    color: #6F6F6F;
    margin: 0;
    font-family: inherit;
    max-width: 42ch;
  }

  .about-rakan__video-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    will-change: transform, opacity;
  }

  .about-rakan__video-frame {
    position: relative;
    overflow: hidden;
    border-radius: 2px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08), 0 2px 12px rgba(0, 0, 0, 0.04);
    aspect-ratio: 3 / 4;
    background: #1A1A1A;
  }

  .about-rakan__video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .about-rakan__video-caption {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-top: 1.5rem;
    padding: 0 0.25rem;
  }

  .about-rakan__video-caption-line {
    flex: 1;
    height: 1px;
    background: #E5E5E5;
  }

  .about-rakan__video-caption-text {
    font-family: "Cinzel", Georgia, serif;
    font-size: clamp(0.65rem, 1.2vw, 0.8rem);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #6F6F6F;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .about-rakan__container {
      padding-left: clamp(1rem, 4vw, 1.5rem);
      padding-right: clamp(1rem, 4vw, 1.5rem);
    }

    .about-rakan__layout {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .about-rakan__main-text {
      max-width: none;
    }

    .about-rakan__title-name {
      letter-spacing: 0.12em;
    }

    .about-rakan__video-frame {
      aspect-ratio: 3 / 3;
    }
  }

  @media (max-width: 480px) {
    .about-rakan__container {
      padding: 1rem 1rem 3rem;
    }

    .about-rakan__title-label {
      letter-spacing: 0.25em;
      font-size: 0.7rem;
    }

    .about-rakan__title-name {
      font-size: clamp(2rem, 14vw, 2.75rem);
      letter-spacing: 0.08em;
    }

    .about-rakan__intro {
      font-size: 0.9375rem;
    }

    .about-rakan__video-frame {
      aspect-ratio: 3 / 4;
    }

    .about-rakan__video-caption {
      gap: 0.75rem;
      margin-top: 1rem;
    }
  }
`;
