import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const services = [
  {
    title: "Personal Styling",
    desc: "One-to-one wardrobe and image consultations tailored to your lifestyle, goals, and personal aesthetic.",
    deliverables: ["Full style assessment", "Personalised mood board", "Shopping list & recommendations", "Follow-up session"],
    price: "From $500",
  },
  {
    title: "Event Styling",
    desc: "Styling for high-profile occasions and appearances — red carpet, galas, and milestone moments.",
    deliverables: ["Outfit curation", "Accessory selection", "Fitting coordination", "Day-of support"],
    price: "From $800",
  },
  {
    title: "Wardrobe Audit",
    desc: "Full review, edit, and rebuild of your existing wardrobe to maximise versatility and impact.",
    deliverables: ["Closet assessment", "Edit & organisation", "Gap analysis", "Rebuild strategy"],
    price: "From $400",
  },
  {
    title: "Executive Image",
    desc: "Corporate and professional brand building for leaders who understand image is influence.",
    deliverables: ["Professional assessment", "Brand alignment", "Wardrobe overhaul", "Ongoing support"],
    price: "From $700",
  },
  {
    title: "The Cultural Bridge",
    desc: "Cross-cultural styling and image consulting — bridging tradition with modern sophistication.",
    deliverables: ["Cultural style analysis", "Fusion wardrobe plan", "Occasion-specific styling", "Ongoing guidance"],
    price: "From $600",
  },
  {
    title: "Workshops",
    desc: "Group sessions and branded events — corporate team styling, brand activations, and private masterclasses.",
    deliverables: ["Custom curriculum", "Group exercises", "Style resource pack", "Certificate of completion"],
    price: "From $1,200",
  },
  {
    title: "Elite Concierge",
    desc: "Bespoke, high-ticket service for discerning clients. Application-only access to Rakan's full spectrum of expertise.",
    deliverables: ["Dedicated stylist access", "Priority scheduling", "White-glove service", "Complete image management"],
    price: "By Application",
    elite: true,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const ServicesPage = () => {
  return (
    <Layout>
      <div className="relative z-10 bg-transparent">
        <section className="pt-32 pb-20 px-6 md:px-12">
          <SectionHeading
            subtitle="Our Services"
            title="Crafted for Excellence"
            description="Every service is designed to elevate your image with precision, taste, and an unwavering commitment to detail."
          />
        </section>

        <section className="max-w-6xl mx-auto px-6 md:px-12 pb-32">
        <div className="grid gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`border p-8 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start ${
                service.elite
                  ? "border-primary/40 bg-white/10 backdrop-blur-sm"
                  : "border-border hover:border-primary/30 transition-colors bg-white/5 backdrop-blur-sm"
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-display text-xl md:text-2xl text-foreground">{service.title}</h3>
                  {service.elite && (
                    <span className="text-xs font-medium tracking-[0.2em] uppercase px-3 py-1.5 border border-primary text-primary">
                      Application Only
                    </span>
                  )}
                </div>
                <p className="text-foreground/90 text-base leading-relaxed mb-5 max-w-xl">{service.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {service.deliverables.map((d) => (
                    <span key={d} className="text-sm text-foreground/80 border border-border px-3 py-1.5">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <span className="font-display text-xl md:text-2xl text-primary">{service.price}</span>
                <Link
                  to={service.elite ? "/booking?type=elite" : "/booking"}
                  className={`inline-flex items-center gap-2 px-6 py-3 text-sm tracking-[0.15em] uppercase font-medium transition-colors ${
                    service.elite
                      ? "bg-primary text-primary-foreground hover:bg-gold-light"
                      : "border border-primary text-primary hover:bg-primary/10"
                  }`}
                >
                  {service.elite ? "Apply Now" : "Book Now"} <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        </section>
      </div>
    </Layout>
  );
};

export default ServicesPage;
