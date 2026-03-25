import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "@/components/Layout";
import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const type = searchParams.get("type") ?? "";
  const verifyPayment = useAction(api.payments.verifyPayment);

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setVerifying(false);
        setVerified(false);
        return;
      }
      try {
        const result = await verifyPayment({ sessionId });
        setVerified(!!result.success);
      } catch {
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };
    void run();
  }, [sessionId, verifyPayment]);

  const label = type === "membership" ? "membership" : "appointment";

  return (
    <Layout>
      <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-2xl bg-[#0f0f0f] border border-[#2a2a2a] p-10 md:p-12 text-center">
          {verifying ? (
            <div className="flex flex-col items-center gap-5">
              <div className="w-7 h-7 border-2 border-[#d5b16b] border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-300 tracking-[0.12em] uppercase text-xs">
                Verifying payment…
              </p>
            </div>
          ) : verified ? (
            <>
              <CheckCircle2 size={54} className="mx-auto mb-6 text-[#d5b16b]" />
              <h1 className="font-display text-3xl md:text-4xl text-[#f5d48b] mb-3">
                Payment Successful
              </h1>
              <p className="text-zinc-300 mb-2">
                Thank you, your {label} has been confirmed.
              </p>
              <p className="text-zinc-400 mb-10">
                A confirmation will be sent to your email.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#d5b16b] text-black text-sm tracking-[0.15em] uppercase font-medium hover:opacity-95 transition-colors"
              >
                Return to Home
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl md:text-3xl text-[#f5d48b] mb-3">
                Payment Verification Failed
              </h1>
              <p className="text-zinc-300">
                We couldn't verify your payment. Please contact support.
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

