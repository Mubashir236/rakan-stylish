import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, CreditCard } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Id } from "../../convex/_generated/dataModel";

const serviceOptions = [
  "Personal Styling",
  "Event Styling",
  "Wardrobe Audit",
  "Executive Image",
  "The Cultural Bridge",
  "Workshop",
];

const timeSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"];

const SERVICE_FEES_CENTS: Record<string, number> = {
  "Personal Styling": 0,
  "Event Styling": 0,
  "Wardrobe Audit": 0,
  "Executive Image": 0,
  "The Cultural Bridge": 0,
  Workshop: 0,
};

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createBooking = useMutation(api.bookings.createBooking);
  const createBookingCheckout = useAction(api.payments.createBookingCheckout);
  const [createdBookingId, setCreatedBookingId] = useState<Id<"bookings"> | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const checkoutStartedRef = useRef(false);

  const steps = [
    { num: 1, label: "Service", icon: Calendar },
    { num: 2, label: "Schedule", icon: Clock },
    { num: 3, label: "Confirm", icon: CreditCard },
    { num: 4, label: "Payment", icon: CreditCard },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "true") {
      toast("Payment was cancelled. You can try again anytime.");
    }
  }, []);

  useEffect(() => {
    const runCheckout = async () => {
      if (step !== 4) return;
      if (!createdBookingId) return;
      if (checkoutStartedRef.current) return;
      checkoutStartedRef.current = true;
      setRedirecting(true);
      try {
        const amount = SERVICE_FEES_CENTS[selectedService] ?? 0;
        const result = await createBookingCheckout({
          customerName: name,
          customerEmail: email,
          bookingId: createdBookingId,
          serviceType: selectedService,
          amount,
          siteUrl: window.location.origin,
        });
        window.location.href = result.checkoutUrl;
      } catch {
        toast.error("Payment setup failed, please try again");
        setRedirecting(false);
        checkoutStartedRef.current = false;
      }
    };
    void runCheckout();
  }, [createBookingCheckout, createdBookingId, email, name, selectedService, step]);

  return (
    <Layout>
      <div className="relative z-10">
      <section className="pt-32 pb-10 px-6 md:px-12">
        <SectionHeading
          subtitle="Booking"
          title="Book Your Session"
          description="Select your service, choose a time, and secure your appointment."
        />
      </section>

      {/* Steps indicator */}
      <div className="max-w-2xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                    step >= s.num
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <s.icon size={18} />
                </div>
                <span className="text-xs font-medium tracking-[0.15em] uppercase mt-2 text-foreground">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-16 sm:w-24 mx-2 transition-colors ${step > s.num ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-6 md:px-12 pb-32">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-foreground mb-6">Select a Service</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceOptions.map((service) => (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={`text-left border p-5 transition-all ${
                    selectedService === service
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-200"
                  }`}
                >
                  <span className="text-base text-foreground">{service}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedService && setStep(2)}
              disabled={!selectedService}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-foreground mb-6">Choose Date & Time</h3>
            <div className="mb-8">
              <label className="text-sm font-medium text-foreground block mb-2 tracking-wider uppercase">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-secondary border border-border px-4 py-3 text-foreground text-base w-full max-w-xs focus:border-primary focus:outline-none transition-colors duration-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-3 tracking-wider uppercase">Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`border p-3 text-sm text-center transition-all ${
                      selectedTime === time
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-border text-foreground text-sm tracking-[0.15em] uppercase hover:border-primary transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => selectedDate && selectedTime && setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-foreground mb-6">Confirm Booking</h3>
            <div className="bg-white/10 backdrop-blur-sm border border-border p-8 mb-8">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2 tracking-wider uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-secondary border border-border px-4 py-3 text-foreground text-base w-full focus:border-primary focus:outline-none transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2 tracking-wider uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-secondary border border-border px-4 py-3 text-foreground text-base w-full focus:border-primary focus:outline-none transition-colors duration-200"
                  />
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-sm font-medium text-foreground uppercase tracking-wider">Service</span>
                    <span className="text-base text-foreground">{selectedService}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3 pt-3">
                    <span className="text-sm font-medium text-foreground uppercase tracking-wider">Service Fee</span>
                    <span className="text-base text-foreground">
                      {SERVICE_FEES_CENTS[selectedService] != null && SERVICE_FEES_CENTS[selectedService] > 0
                        ? `$${(SERVICE_FEES_CENTS[selectedService] / 100).toFixed(2)}`
                        : "Contact for pricing"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3 pt-3">
                    <span className="text-sm font-medium text-foreground uppercase tracking-wider">Date</span>
                    <span className="text-base text-foreground">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-sm font-medium text-foreground uppercase tracking-wider">Time</span>
                    <span className="text-base text-foreground">{selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 border border-border text-foreground text-sm tracking-[0.15em] uppercase hover:border-primary transition-colors"
              >
                Back
              </button>
              <button
                disabled={!name || !email || submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const bookingId = await createBooking({
                      name,
                      email,
                      service: selectedService,
                      date: selectedDate,
                      time: selectedTime,
                    });
                    setCreatedBookingId(bookingId);
                    setStep(4);
                  } catch {
                    toast.error("Something went wrong. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Confirm & Pay"} <CreditCard size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-foreground mb-6">
              Complete your booking with payment
            </h3>
            <div className="bg-white/10 backdrop-blur-sm border border-border p-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground">
                  {redirecting ? "Redirecting to secure checkout…" : "Preparing secure checkout…"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
