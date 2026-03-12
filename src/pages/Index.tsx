import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Sparkles, Crown, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import AboutRakanSection from "@/components/AboutRakanSection";
import heroBgMain from "@/assets/heroBG-1.jpg";
import sectionLeft from "@/assets/section-left.jpg";
import sectionRight from "@/assets/section-right.jpg";
import aboutRakanVideo from "@/assets/about rakan.MP4";

const services = [
  { icon: Sparkles, title: "Personal Styling", desc: "One-to-one wardrobe and image consultations" },
  { icon: Crown, title: "Elite Concierge", desc: "Bespoke, high-ticket styling by application" },
  { icon: Star, title: "Event Styling", desc: "Styling for high-profile occasions" },
  { icon: BookOpen, title: "Executive Image", desc: "Corporate and professional brand building" },
];

const testimonials = [
  { name: "Sarah K.", role: "CEO, Dubai", text: "Rakan transformed not just my wardrobe, but my confidence. Every detail was considered with impeccable taste." },
  { name: "James M.", role: "Creative Director", text: "The cultural bridge service was exactly what I needed. A truly world-class styling experience." },
  { name: "Amira R.", role: "Entrepreneur", text: "The membership content alone is worth it. Rakan's eye for style is unmatched." },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7 },
};

const Index = () => {
  return (
    <Layout>
      <section className="hero relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xs tracking-[0.4em] uppercase text-primary block mb-6"
          >
            Digital Styling Platform
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-foreground leading-[1.1] mb-6"
          >
            Styled by{" "}
            <span className="text-gradient-gold italic">Rakan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Luxury styling, education, and image consulting for those who demand excellence in every detail.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors"
            >
              Book a Service <ArrowRight size={16} />
            </Link>
            <Link
              to="/membership"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary text-sm tracking-[0.15em] uppercase font-medium hover:bg-primary/10 transition-colors"
            >
              Join as Member
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-px h-16 bg-gradient-to-b from-primary/60 to-transparent" />
        </motion.div>
      </section>

      {/* About RAKAN — Shiroito-style scroll-parallax and image reveal */}
      <AboutRakanSection videoSrc={aboutRakanVideo} />

      {/* Services Overview */}
      <section className="section-padding bg-gradient-dark">
        <SectionHeading
          subtitle="What We Offer"
          title="Services"
          description="From personal styling to elite concierge — every service is tailored to elevate your image."
        />
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-gradient-card border border-border p-8 group hover:border-primary/40 transition-all duration-500"
            >
              <service.icon className="text-primary mb-5" size={28} />
              <h3 className="font-display text-lg text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeUp} className="text-center mt-12">
          <Link
            to="/services"
            className="text-sm tracking-[0.15em] uppercase text-primary hover:text-gold-light transition-colors inline-flex items-center gap-2"
          >
            View All Services <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* Split section: Education + Membership — section-left.jpg / section-right.jpg */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Education — left image */}
        <motion.div {...fadeUp} className="relative group overflow-hidden">
          <img src={sectionLeft} alt="Education Hub" className="w-full h-80 md:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="text-xs tracking-[0.3em] uppercase text-white mb-3">Learn</span>
            <h3 className="font-display text-2xl md:text-3xl text-white mb-3">Education Hub</h3>
            <p className="text-white/90 text-sm mb-5 max-w-sm">Video courses, style guides, and curated content to master your personal image.</p>
            <Link to="/education" className="text-sm tracking-[0.15em] uppercase text-white hover:text-white/80 transition-colors inline-flex items-center gap-2">
              Explore Courses <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Membership — right image */}
        <motion.div {...fadeUp} className="relative group overflow-hidden">
          <img src={sectionRight} alt="Membership" className="w-full h-80 md:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="text-xs tracking-[0.3em] uppercase text-white mb-3">Exclusive</span>
            <h3 className="font-display text-2xl md:text-3xl text-white mb-3">Membership</h3>
            <p className="text-white/90 text-sm mb-5 max-w-sm">Monthly drops, member pricing, and exclusive access to Rakan's inner circle.</p>
            <Link to="/membership" className="text-sm tracking-[0.15em] uppercase text-white hover:text-white/80 transition-colors inline-flex items-center gap-2">
              Join Now <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <SectionHeading subtitle="Testimonials" title="What Clients Say" />
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-gradient-card border border-border p-8"
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-primary fill-primary" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed italic mb-6">"{t.text}"</p>
              <div>
                <p className="text-foreground text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-padding bg-secondary">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
            Ready to Transform Your Image?
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Book a consultation or explore our membership plans to begin your style journey with Rakan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors"
            >
              Book Now <ArrowRight size={16} />
            </Link>
            <Link
              to="/education"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground text-sm tracking-[0.15em] uppercase font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
