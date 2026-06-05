"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AtSign, Save, CheckCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface UserData {
  id: string;
  name: string;
  email: string;
  college: string;
  phone?: string | null;
  instagramId?: string | null;
  dob?: string | null;
  state?: string | null;
  admissionYear?: string | null;
  about?: string | null;
  interests?: any;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [instagramId, setInstagramId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/login");
          return;
        }
        // Redirect to application-success if onboarding is still pending
        if (d.user.onboarding?.status === "PENDING") {
          router.push("/application-success");
          return;
        }
        setUser(d.user);
        setInstagramId(d.user.instagramId || "");
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function handleSaveInstagram() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[#666666]">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!user) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <AppLayout user={{ name: user.name, plan: "Plan C", course: "NEET PG" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-[#1A1A2E] hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-semibold text-[#1A1A2E]">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[#D8D8D8] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="48" fill="#D8D8D8" />
                <circle cx="48" cy="36" r="16" fill="#999" />
                <path d="M19 84C19 67 30 55 48 55C66 55 77 67 77 84" fill="#999" />
              </svg>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Full Name</label>
              <input
                type="text"
                value={user.name}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Email Address</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* Contact Number - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Contact Number</label>
              <input
                type="tel"
                value={user.phone || "—"}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* College - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">College Name</label>
              <input
                type="text"
                value={user.college}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* Admission Year - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Admission Year</label>
              <input
                type="text"
                value={user.admissionYear || "—"}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* State - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">State</label>
              <input
                type="text"
                value={user.state || "—"}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* Date of Birth - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Date of Birth</label>
              <input
                type="text"
                value={formatDate(user.dob)}
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] cursor-not-allowed"
              />
            </div>

            {/* About - Read Only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Brief about yourself</label>
              <textarea
                value={user.about || "—"}
                readOnly
                rows={4}
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm text-[#1A1A2E] resize-none cursor-not-allowed"
              />
            </div>

            {/* Instagram ID - Editable */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">
                <span className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Instagram ID
                  <span className="text-xs text-[#62C8DF] font-normal">(Editable)</span>
                </span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] text-sm">@</span>
                  <input
                    type="text"
                    value={instagramId}
                    onChange={(e) => setInstagramId(e.target.value.replace(/^@/, ""))}
                    placeholder="your_instagram_handle"
                    className="w-full pl-9 pr-4 py-3 bg-white rounded-lg border border-border text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#62C8DF] focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={handleSaveInstagram}
                  disabled={saving}
                  className="px-5 py-3 bg-[#62C8DF] hover:bg-[#52b8cf] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  ) : saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              {saved && <p className="mt-2 text-sm text-green-600">Instagram ID updated successfully!</p>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
