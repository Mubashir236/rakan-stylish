import { motion } from "framer-motion";
import { Play, Download, Lock } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import educationImg from "@/assets/education-hub.jpg";

const courses = [
  { title: "Foundations of Personal Style", lessons: 8, duration: "2h 40min", free: true, category: "Personal Style" },
  { title: "Executive Presence Masterclass", lessons: 12, duration: "4h 15min", free: false, category: "Executive Image" },
  { title: "Cultural Dressing — East Meets West", lessons: 6, duration: "1h 50min", free: false, category: "Cultural Dressing" },
  { title: "Colour Theory for Your Wardrobe", lessons: 5, duration: "1h 20min", free: true, category: "Personal Style" },
  { title: "Building a Capsule Wardrobe", lessons: 7, duration: "2h 10min", free: false, category: "Personal Style" },
  { title: "Dressing for High-Stakes Events", lessons: 4, duration: "1h 30min", free: false, category: "Event Styling" },
];

const guides = [
  { title: "The Seasonal Style Lookbook", format: "PDF", pages: 24 },
  { title: "Wardrobe Audit Checklist", format: "PDF", pages: 8 },
  { title: "Executive Dressing Cheat Sheet", format: "PDF", pages: 12 },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const EducationPage = () => {
  return (
    <Layout>
      <div className="relative z-10">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 md:px-12">
        <SectionHeading
          subtitle="Education Hub"
          title="Master Your Image"
          description="Structured courses, downloadable guides, and exclusive content to elevate your personal style."
        />
      </section>

      {/* Featured banner — transparent overlay, clear typography for visibility */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 mb-20">
        <motion.div {...fadeUp} className="relative overflow-hidden">
          <img src={educationImg} alt="Education" className="w-full h-64 md:h-80 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex flex-col justify-center px-8 md:px-14">
            <span className="text-sm font-medium tracking-[0.25em] uppercase text-white mb-3 drop-shadow-sm">Featured Course</span>
            <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 drop-shadow-md" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Foundations of Personal Style
            </h3>
            <p className="text-white text-base md:text-lg max-w-lg mb-6 leading-relaxed drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
              A comprehensive introduction to understanding your style identity, body proportions, and how to dress with intention.
            </p>
            <span className="inline-flex items-center gap-2 text-white text-base font-medium tracking-[0.15em] uppercase cursor-pointer hover:text-white/90 transition-colors drop-shadow-sm">
              <Play size={18} /> Start Free Preview
            </span>
          </div>
        </motion.div>
      </section>

      {/* Courses grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-20">
        <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-foreground mb-8">All Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white/10 backdrop-blur-sm border border-border p-6 hover:border-primary/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium tracking-[0.15em] uppercase text-foreground border border-border px-2.5 py-1">
                  {course.category}
                </span>
                {!course.free && <Lock size={16} className="text-primary" />}
              </div>
              <h4 className="font-display text-lg md:text-xl text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                {course.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{course.lessons} lessons</span>
                <span>{course.duration}</span>
              </div>
              {course.free && (
                <span className="text-xs font-medium tracking-[0.15em] uppercase text-primary mt-4 block">Free Preview</span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Downloadable guides */}
      <section className="section-padding bg-secondary">
        <div className="max-w-4xl mx-auto">
          <SectionHeading subtitle="Resources" title="Downloadable Guides" />
          <div className="grid gap-4">
            {guides.map((guide, i) => (
              <motion.div
                key={guide.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center justify-between border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div>
                  <h4 className="text-foreground text-base font-medium">{guide.title}</h4>
                  <span className="text-sm text-muted-foreground">{guide.format} • {guide.pages} pages</span>
                </div>
                <Download size={20} className="text-primary cursor-pointer hover:text-gold-light transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
};

export default EducationPage;
