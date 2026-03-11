import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionHeadingProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
}

const SectionHeading = ({ subtitle, title, description, align = "center" }: SectionHeadingProps) => {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className={`max-w-2xl mb-16 ${alignment}`}
    >
      {subtitle && (
        <span className="text-xs tracking-[0.3em] uppercase text-primary mb-4 block">
          {subtitle}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground leading-tight mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
