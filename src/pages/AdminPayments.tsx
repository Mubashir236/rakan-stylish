import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BadgeDollarSign, CreditCard, Hash, Hourglass, Mail, User } from "lucide-react";

function formatMoney(amountCents: number, currency: string) {
  const amount = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "symbol",
  }).format(amount);
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-zinc-100 text-zinc-700",
};

export default function AdminPayments() {
  const payments = useQuery(api.payments.getAllPayments);

  const stats = useMemo(() => {
    if (!payments) {
      return {
        totalRevenueCents: 0,
        membershipCount: 0,
        bookingCount: 0,
        pendingCount: 0,
      };
    }
    const paid = payments.filter((p) => p.status === "paid");
    return {
      totalRevenueCents: paid.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      membershipCount: payments.filter((p) => p.type === "membership").length,
      bookingCount: payments.filter((p) => p.type === "booking").length,
      pendingCount: payments.filter((p) => p.status === "pending").length,
    };
  }, [payments]);

  if (!payments) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatMoney(stats.totalRevenueCents, "usd"),
            icon: BadgeDollarSign,
          },
          { label: "Membership Payments", value: stats.membershipCount, icon: CreditCard },
          { label: "Booking Payments", value: stats.bookingCount, icon: Hash },
          { label: "Pending", value: stats.pendingCount, icon: Hourglass },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white/70 backdrop-blur-md border border-border p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon size={16} className="text-muted-foreground" />
            </div>
            <span className="font-display text-2xl md:text-3xl text-foreground">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">All Payments</h3>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Plan / Service
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-all duration-300"
                >
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-foreground">
                        <User size={13} className="text-muted-foreground" />
                        <span className="font-medium">{p.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Mail size={12} />
                        {p.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-foreground">
                    {p.type === "membership" ? "Membership" : "Booking"}
                  </td>
                  <td className="px-6 py-5 text-muted-foreground">
                    {p.type === "membership" ? (p.planType ?? "-") : "-"}
                  </td>
                  <td className="px-6 py-5 text-foreground">
                    {formatMoney(p.amount, p.currency)}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`text-xs font-medium tracking-[0.12em] uppercase px-2.5 py-1 ${STATUS_BADGE[p.status] ?? "bg-secondary text-muted-foreground"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {payments.map((p) => (
            <div key={p._id} className="p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-foreground font-medium">{p.customerName}</p>
                  <p className="text-muted-foreground text-xs">{p.customerEmail}</p>
                </div>
                <span
                  className={`text-[10px] font-medium tracking-[0.12em] uppercase px-2 py-0.5 ${STATUS_BADGE[p.status] ?? "bg-secondary text-muted-foreground"}`}
                >
                  {p.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.type === "membership" ? "Membership" : "Booking"}</span>
                <span>{formatMoney(p.amount, p.currency)}</span>
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

