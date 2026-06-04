"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.user?.role !== "ADMIN") {
        setError("Access denied. Admin credentials required.");
        return;
      }
      router.push("/admin-dashboard");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#073640] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#62C8DF]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#62C8DF]" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Pulse <span className="text-[#62C8DF]">Points</span>
          </h1>
          <p className="text-[#72A1AB] text-sm">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#05272e] rounded-2xl p-8 shadow-xl border border-[#3E5157]">
          <h2 className="text-xl font-semibold text-white mb-1">Admin Sign In</h2>
          <p className="text-[#72A1AB] text-sm mb-8">
            Restricted access — authorized personnel only
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#72A1AB]">
                Admin Email
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#72A1AB]"
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-[#073640] text-white rounded-xl border border-[#3E5157] focus:border-[#62C8DF] focus:outline-none transition-colors placeholder:text-[#3E5157]"
                  placeholder="admin@marrow.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#72A1AB]">Password</label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#72A1AB]"
                  strokeWidth={1.5}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-[#073640] text-white rounded-xl border border-[#3E5157] focus:border-[#62C8DF] focus:outline-none transition-colors placeholder:text-[#3E5157]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[4px] relative mt-2 disabled:opacity-60"
            >
              <div
                aria-hidden
                className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
              />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                {loading ? "SIGNING IN..." : "SIGN IN AS ADMIN"}
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          </form>
        </div>

        <p className="text-center text-[#3E5157] text-xs mt-6">
          Not an admin?{" "}
          <a href="/login" className="text-[#72A1AB] hover:text-[#62C8DF] transition-colors">
            Go to Marvel login
          </a>
        </p>
      </div>
    </div>
  );
}
