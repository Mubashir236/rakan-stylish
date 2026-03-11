import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, CreditCard } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const serviceOptions = [
  "Personal Styling",
  "Event Styling",
  "Wardrobe Audit",
  "Executive Image",
  "The Cultural Bridge",
  "Workshop",
];

const timeSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"];

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createBooking = useMutation(api.bookings.createBooking);

  const steps = [
    { num: 1, label: "Service", icon: Calendar },
    { num: 2, label: "Schedule", icon: Clock },
    { num: 3, label: "Confirm", icon: CreditCard },
  ];

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
                      : "border-border hover:border-primary/30"
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
                className="bg-secondary border border-border px-4 py-3 text-foreground text-base w-full max-w-xs focus:border-primary focus:outline-none transition-colors"
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
                        : "border-border text-muted-foreground hover:border-primary/30"
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
                    className="bg-secondary border border-border px-4 py-3 text-foreground text-base w-full focus:border-primary focus:outline-none transition-colors"
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
                    className="bg-secondary border border-border px-4 py-3 text-foreground text-base w-full focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-sm font-medium text-foreground uppercase tracking-wider">Service</span>
                    <span className="text-base text-foreground">{selectedService}</span>
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
                    await createBooking({
                      name,
                      email,
                      service: selectedService,
                      date: selectedDate,
                      time: selectedTime,
                    });
                    toast.success("Booking confirmed! We'll be in touch shortly.");
                    setStep(1);
                    setSelectedService("");
                    setSelectedDate("");
                    setSelectedTime("");
                    setName("");
                    setEmail("");
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
      </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
