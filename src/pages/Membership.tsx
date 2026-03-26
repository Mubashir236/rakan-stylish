import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, X } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const plans = [
  {
    name: "Monthly",
    price: "$49",
    period: "/month",
    features: [
      "Monthly styling inspiration drops",
      "Seasonal lookbook access",
      "Member-only pricing on services",
      "Access to locked education content",
      "Community access",
    ],
    popular: false,
  },
  {
    name: "Annual",
    price: "$39",
    period: "/month, billed annually",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority booking access",
      "Exclusive annual lookbook",
      "Early access to new courses",
      "1 free wardrobe audit consultation",
    ],
    popular: true,
  },
];

const perks = [
  "Curated monthly content drops",
  "Exclusive member pricing on all services",
  "Access to gated education modules",
  "Seasonal outfit inspiration",
  "Early access to workshops & events",
  "Priority customer support",
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const MembershipPage = () => {
  const [modalTier, setModalTier] = useState<"monthly" | "annual" | null>(null);
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subscribeMutation = useMutation(api.memberships.subscribe);
  const createMembershipCheckout = useAction(api.payments.createMembershipCheckout);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "true") {
      toast("Payment was cancelled. You can try again anytime.");
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTier) return;
    setSubmitting(true);
    try {
      const membershipId = await subscribeMutation({
        name: subName,
        email: subEmail,
        tier: modalTier,
      });
      const planType = modalTier === "annual" ? "yearly" : "monthly";
      const result = await createMembershipCheckout({
        planType,
        customerName: subName,
        customerEmail: subEmail,
        membershipId,
        siteUrl: window.location.origin,
      });
      window.location.href = result.checkoutUrl;
      setModalTier(null);
      setSubName("");
      setSubEmail("");
    } catch {
      toast.error("Payment setup failed, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="relative z-10">
      <section className="pt-32 pb-20 px-6 md:px-12">
        <SectionHeading
          subtitle="Membership"
          title="Join the Inner Circle"
          description="Unlock exclusive content, member pricing, and monthly styling inspiration from Rakan."
        />
      </section>

      {/* Plans */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`border p-8 md:p-10 relative hover:shadow-sm transition-all duration-400 ${
                plan.popular
                  ? "border-primary bg-gradient-card"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 text-xs font-medium tracking-[0.2em] uppercase bg-primary text-primary-foreground px-4 py-2">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl md:text-5xl text-primary">{plan.price}</span>
                <span className="text-base text-muted-foreground">{plan.period}</span>
              </div>
              <div className="flex flex-col gap-3 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 group">
                    <Check size={18} className="text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-base text-foreground leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  setModalTier(
                    plan.name.toLowerCase() as "monthly" | "annual"
                  )
                }
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-gold-light"
                    : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                Get Started <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All perks */}
      <section className="section-padding bg-secondary">
        <div className="max-w-3xl mx-auto">
          <SectionHeading subtitle="Benefits" title="What's Included" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-center gap-3 border border-border p-4"
              >
                <Check size={18} className="text-primary shrink-0" />
                <span className="text-base text-foreground leading-relaxed">{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {modalTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md p-8 relative bg-[#0f0f0f] border border-[#2a2a2a] text-zinc-100"
          >
            <button
              onClick={() => {
                setModalTier(null);
                setSubName("");
                setSubEmail("");
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors hover:rotate-90 transition-transform duration-200"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-2xl text-[#f5d48b] mb-1">
              Subscribe — {modalTier === "monthly" ? "Monthly" : "Annual"}
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Enter your details to proceed to payment.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-200 block mb-1.5 tracking-wider uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-[#171717] border border-[#2e2e2e] px-4 py-3 text-zinc-100 text-base focus:border-[#d5b16b] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-200 block mb-1.5 tracking-wider uppercase">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#171717] border border-[#2e2e2e] px-4 py-3 text-zinc-100 text-base focus:border-[#d5b16b] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#d5b16b] text-black text-sm tracking-[0.15em] uppercase font-medium hover:opacity-95 transition-colors disabled:opacity-50"
              >
                {submitting ? "Loading…" : "Proceed to Payment"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default MembershipPage;
