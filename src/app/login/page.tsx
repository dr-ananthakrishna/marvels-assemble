"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, User } from "lucide-react";

export default function LoginPage() {
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
      if (data.user?.role === "ADMIN") {
        router.push("/admin-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6">
        <Link
          href="/welcome"
          className="flex items-center gap-2 text-[#959A9B] hover:text-[#1A1A2E] transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <div className="mb-6">
              <span className="text-2xl font-bold tracking-tight">
                Pulse <span className="text-[#62C8DF]">Points</span>
              </span>
            </div>
            <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
            <p className="text-[#666666]">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Marrow registered email ID</label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]"
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none transition-colors"
                  placeholder="Enter your registered email ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]"
                  strokeWidth={1.5}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              className="text-[#4a69a2] text-sm font-medium hover:underline"
            >
              Forgot password?
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[4px] relative disabled:opacity-60"
            >
              <div
                aria-hidden
                className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
              />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                {loading ? "LOGGING IN..." : "LOGIN WITH MARROW"}
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>

            <p className="text-center text-sm text-[#666666]">
              New here?{" "}
              <Link href="/register" className="text-[#4a69a2] font-medium hover:underline">
                Register as a Marvel
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
