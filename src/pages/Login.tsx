import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await api.post("/auth/login", form);
    setLoading(false);
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      nav("/");
    } else {
      setError(res.error || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[560px]">

        {/* ── Left: Form ── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 py-12">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/rav-logo-new-logo.png" alt="Golwala College" className="h-14 w-auto object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back 👋</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your CRM admin account</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all pr-14"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #c0392b, #8e1a10)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-8">
            © {new Date().getFullYear()} Golwala College CRM — Admin Portal
          </p>
        </div>

        {/* ── Right: Branding ── */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #c0392b 0%, #7b1510 100%)" }}>

          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10 bg-white" />
          <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full opacity-5 bg-white" />

          {/* Card */}
          <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-xs border border-white/40 shadow-xl">
            <div className="flex justify-center mb-6">
              <img src="/rav-logo-new-logo.png" alt="Golwala College" className="h-20 w-auto object-contain drop-shadow-lg" />
            </div>
            <h3 className="text-gray-800 text-xl font-bold text-center leading-snug mb-1">
              Laxmichand Golwala College
            </h3>
            <p className="text-gray-500 text-sm text-center mb-6">of Commerce & Economics</p>

            <div className="space-y-2.5">
              {[
                { icon: "📋", label: "Lead Management" },
                { icon: "📊", label: "Filter & Reports" },
                { icon: "👥", label: "Team Management" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 bg-gray-100/80 rounded-xl px-4 py-2.5">
                  <span className="text-base">{f.icon}</span>
                  <span className="text-sm text-gray-700 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
