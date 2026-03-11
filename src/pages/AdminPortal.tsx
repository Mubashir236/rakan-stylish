import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LogOut, Trash2, CheckCircle, Users, CalendarDays, Clock, XCircle, Hash, Mail, Briefcase, CalendarCheck, Crown } from "lucide-react";
import HeroWebGLBackground from "@/components/HeroWebGLBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import heroBgMain from "@/assets/heroBG-1.jpg";

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const AdminPortal = () => {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<"bookings" | "memberships">("bookings");
  const isMobile = useIsMobile();

  const login = useAction(api.admin.login);

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "true") {
      setAuthed(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const passwordHash = await sha256(password);
      const result = await login({ email, passwordHash });
      if (result.success) {
        sessionStorage.setItem("admin_authed", "true");
        setAuthed(true);
      } else {
        setLoginError("Invalid credentials.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authed");
    setAuthed(false);
    setEmail("");
    setPassword("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <HeroWebGLBackground imageUrl={heroBgMain} isMobile={isMobile} fixed />
        <div className="fixed inset-0 z-[1] pointer-events-none bg-white/60" aria-hidden />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-md px-6"
        >
          <div className="bg-white/80 backdrop-blur-md border border-border p-10 md:p-12">
            <h1 className="font-display text-3xl md:text-4xl text-foreground text-center mb-2">
              Admin Portal
            </h1>
            <p className="text-center text-muted-foreground text-xs tracking-[0.3em] uppercase mb-10">
              Authorized Access Only
            </p>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium tracking-[0.2em] uppercase text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-[0.2em] uppercase text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              {loginError && (
                <p className="text-destructive text-sm">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-4 bg-primary text-primary-foreground text-sm font-medium tracking-[0.15em] uppercase hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {loggingIn ? "Signing In…" : "Sign In"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroWebGLBackground imageUrl={heroBgMain} isMobile={isMobile} fixed />
      <div className="fixed inset-0 z-[1] pointer-events-none bg-white/60" aria-hidden />

      <div className="relative z-10">
        <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border bg-white/80 backdrop-blur-md">
          <h1 className="font-display text-xl md:text-2xl text-foreground">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        <div className="section-padding max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="flex gap-2 mb-10">
            <button
              onClick={() => setTab("bookings")}
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-[0.15em] uppercase transition-colors ${
                tab === "bookings"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <CalendarDays size={16} /> Bookings
            </button>
            <button
              onClick={() => setTab("memberships")}
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-[0.15em] uppercase transition-colors ${
                tab === "memberships"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <Users size={16} /> Memberships
            </button>
          </motion.div>

          {tab === "bookings" && <BookingsTable />}
          {tab === "memberships" && <MembershipsTable />}
        </div>
      </div>
    </div>
  );
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

function BookingsTable() {
  const bookings = useQuery(api.bookings.listAllBookings);
  const updateStatus = useMutation(api.bookings.updateStatus);
  const deleteBooking = useMutation(api.bookings.deleteBooking);

  if (!bookings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  if (totalCount === 0) {
    return (
      <motion.div {...fadeUp} className="bg-white/80 backdrop-blur-md border border-border p-16 text-center">
        <CalendarDays size={40} className="mx-auto mb-4 text-border" />
        <h3 className="font-display text-xl text-foreground mb-2">No Bookings Yet</h3>
        <p className="text-muted-foreground text-sm">
          Bookings will appear here in real-time as clients submit them.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: totalCount, icon: Hash },
          { label: "Confirmed", value: confirmedCount, icon: CheckCircle },
          { label: "Pending", value: pendingCount, icon: Clock },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white/70 backdrop-blur-md border border-border p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon size={16} className="text-muted-foreground" />
            </div>
            <span className="font-display text-3xl md:text-4xl text-foreground">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp} className="bg-white/70 backdrop-blur-md border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">All Bookings</h3>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <motion.tr
                  key={b._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-all duration-300 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium tracking-wider shrink-0">
                        {getInitials(b.name)}
                      </div>
                      <div>
                        <p className="text-foreground font-medium text-sm">{b.name}</p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {b.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-foreground text-sm">
                      <Briefcase size={13} className="text-muted-foreground shrink-0" />
                      {b.service}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-0.5">
                      <p className="text-foreground text-sm flex items-center gap-1.5">
                        <CalendarCheck size={13} className="text-muted-foreground" />
                        {b.date}
                      </p>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <Clock size={11} className="text-muted-foreground" />
                        {b.time}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[b.status] ?? ""}`} />
                      <span
                        className={`text-xs font-medium tracking-[0.12em] uppercase ${STATUS_COLORS[b.status] ?? ""} px-2.5 py-1`}
                      >
                        {b.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {b.status !== "confirmed" && (
                        <button
                          onClick={() =>
                            updateStatus({ id: b._id, status: "confirmed" })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-700 text-[11px] font-medium tracking-[0.12em] uppercase hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCircle size={13} /> Confirm
                        </button>
                      )}
                      <button
                        onClick={() => deleteBooking({ id: b._id })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase hover:border-destructive hover:text-destructive transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {bookings.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium tracking-wider shrink-0">
                    {getInitials(b.name)}
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">{b.name}</p>
                    <p className="text-muted-foreground text-xs">{b.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[b.status] ?? ""}`} />
                  <span className={`text-[10px] font-medium tracking-[0.12em] uppercase ${STATUS_COLORS[b.status] ?? ""} px-2 py-0.5`}>
                    {b.status}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase size={11} /> {b.service}</span>
                <span className="flex items-center gap-1"><CalendarCheck size={11} /> {b.date}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {b.time}</span>
              </div>
              <div className="flex gap-2 pt-1">
                {b.status !== "confirmed" && (
                  <button
                    onClick={() => updateStatus({ id: b._id, status: "confirmed" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-700 text-[11px] font-medium tracking-[0.12em] uppercase hover:bg-emerald-50 transition-colors"
                  >
                    <CheckCircle size={13} /> Confirm
                  </button>
                )}
                <button
                  onClick={() => deleteBooking({ id: b._id })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase hover:border-destructive hover:text-destructive transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MembershipsTable() {
  const memberships = useQuery(api.memberships.listAllMemberships);

  if (!memberships) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalCount = memberships.length;
  const activeCount = memberships.filter((m) => m.active).length;
  const annualCount = memberships.filter((m) => m.tier === "annual").length;

  if (totalCount === 0) {
    return (
      <motion.div {...fadeUp} className="bg-white/80 backdrop-blur-md border border-border p-16 text-center">
        <Users size={40} className="mx-auto mb-4 text-border" />
        <h3 className="font-display text-xl text-foreground mb-2">No Members Yet</h3>
        <p className="text-muted-foreground text-sm">
          Memberships will appear here in real-time as clients subscribe.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Members", value: totalCount, icon: Users },
          { label: "Active", value: activeCount, icon: CheckCircle },
          { label: "Annual Tier", value: annualCount, icon: Crown },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white/70 backdrop-blur-md border border-border p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon size={16} className="text-muted-foreground" />
            </div>
            <span className="font-display text-3xl md:text-4xl text-foreground">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp} className="bg-white/70 backdrop-blur-md border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">All Members</h3>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Tier
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m, i) => (
                <motion.tr
                  key={m._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-all duration-300 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium tracking-wider shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <p className="text-foreground font-medium text-sm">{m.name}</p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {m.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-[0.15em] uppercase border ${
                        m.tier === "annual"
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      {m.tier === "annual" && <Crown size={12} />}
                      {m.tier}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.active ? "bg-emerald-500" : "bg-border"}`} />
                      <span
                        className={`text-xs font-medium tracking-[0.12em] uppercase px-2.5 py-1 ${
                          m.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {m.active ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {memberships.map((m, i) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium tracking-wider shrink-0">
                    {getInitials(m.name)}
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">{m.name}</p>
                    <p className="text-muted-foreground text-xs">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium tracking-[0.12em] uppercase border ${
                      m.tier === "annual"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {m.tier === "annual" && <Crown size={10} />}
                    {m.tier}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${m.active ? "bg-emerald-500" : "bg-border"}`} />
                    <span className={`text-[10px] font-medium tracking-[0.12em] uppercase ${m.active ? "text-emerald-700" : "text-muted-foreground"}`}>
                      {m.active ? "Active" : "Inactive"}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default AdminPortal;
