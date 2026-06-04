"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activityLabel, formatDate } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const BREAKDOWN_LABELS: Record<string, { label: string; max: number }> = {
  communication:    { label: "Communication",        max: 25 },
  confidence:       { label: "Confidence",           max: 25 },
  leadership:       { label: "Leadership",           max: 10 },
  academics:        { label: "Academics",            max: 10 },
  extracurriculars: { label: "Extracurriculars",     max: 10 },
  loveForMarrow:    { label: "Love for Marrow",      max: 10 },
  entrepreneurial:  { label: "Entrepreneurial",      max: 5  },
  socialMedia:      { label: "Social Media",         max: 5  },
};

type Onboarding = {
  status: string;
  score: number;
  reason: string;
  breakdown?: Record<string, number>;
};

type Marvel = {
  id: string; name: string; email: string; college: string; createdAt: string;
  onboarding: Onboarding | null;
  submissions: Array<{ id: string; activityType: string; status: string; autoChecked: boolean; proofUrl?: string; createdAt: string }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [marvels, setMarvels] = useState<Marvel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Marvel | null>(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [onboardingNote, setOnboardingNote] = useState("");
  const [onboardingUpdating, setOnboardingUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== "ADMIN") { router.push("/login"); }
    });
    loadMarvels();
  }, [router]);

  function loadMarvels() {
    fetch("/api/admin/marvels").then(r => r.json()).then(d => {
      const list: Marvel[] = d.marvels || [];
      setMarvels(list);
      setStats({
        total: list.length,
        approved: list.filter(m => m.onboarding?.status === "APPROVED").length,
        pending: list.filter(m => m.onboarding?.status === "PENDING").length,
      });
      setLoading(false);
    });
  }

  async function updateOnboarding(userId: string, status: "APPROVED" | "REJECTED") {
    setOnboardingUpdating(true);
    await fetch("/api/admin/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, adminNote: onboardingNote || undefined }),
    });
    setOnboardingNote("");
    setOnboardingUpdating(false);
    loadMarvels();
    setSelected(prev => prev ? { ...prev, onboarding: prev.onboarding ? { ...prev.onboarding, status } : null } : null);
  }

  async function updateSubmission(submissionId: string, status: string) {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, status }),
    });
    loadMarvels();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-indigo-700">⚡ Admin — Marvels Assemble</h1>
        <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
          className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total applicants", value: stats.total, color: "text-gray-900" },
            { label: "Active Marvels", value: stats.approved, color: "text-green-600" },
            { label: "Pending review", value: stats.pending, color: "text-yellow-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Marvels list */}
          <div className="col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">All Marvels</h2>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {marvels.map(m => (
                  <button key={m.id} onClick={() => { setSelected(m); setOnboardingNote(""); }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id === m.id ? "bg-indigo-50" : ""}`}>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.college}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[m.onboarding?.status || "PENDING"]}`}>
                        {m.onboarding?.status || "NO VIDEO"}
                      </span>
                      <span className="text-xs text-gray-400">{m.submissions.length} activities</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Marvel detail */}
          <div className="col-span-2 space-y-4">
            {!selected ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-400 text-sm">Select a Marvel to view details</p>
              </div>
            ) : (
              <>
                {/* Profile + Onboarding */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      <p className="text-sm text-gray-500">{selected.email} · {selected.college}</p>
                      <p className="text-xs text-gray-400 mt-1">Applied {formatDate(selected.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLE[selected.onboarding?.status || "PENDING"]}`}>
                      {selected.onboarding?.status || "NO VIDEO"}
                    </span>
                  </div>

                  {selected.onboarding && (
                    <>
                      {/* Score + reason */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-700">AI Score</p>
                          <p className="text-lg font-bold text-indigo-600">{selected.onboarding.score}/100</p>
                        </div>
                        <p className="text-xs text-gray-500">{selected.onboarding.reason}</p>
                      </div>

                      {/* Breakdown */}
                      {selected.onboarding.breakdown && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Score breakdown</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selected.onboarding.breakdown).map(([key, val]) => {
                              const meta = BREAKDOWN_LABELS[key];
                              if (!meta) return null;
                              const pct = Math.round((val / meta.max) * 100);
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-0.5">
                                      <span className="text-gray-600">{meta.label}</span>
                                      <span className="text-gray-500 font-medium">{val}/{meta.max}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Admin review — show for PENDING only */}
                      {selected.onboarding.status === "PENDING" && (
                        <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-medium text-yellow-900">Human review required</p>
                          <textarea
                            value={onboardingNote}
                            onChange={e => setOnboardingNote(e.target.value)}
                            placeholder="Optional note for the applicant..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-yellow-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOnboarding(selected.id, "APPROVED")}
                              disabled={onboardingUpdating}
                              className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => updateOnboarding(selected.id, "REJECTED")}
                              disabled={onboardingUpdating}
                              className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Submissions */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">Activity submissions ({selected.submissions.length})</h3>
                  {selected.submissions.length === 0 ? (
                    <p className="text-gray-400 text-sm">No submissions yet.</p>
                  ) : (
                    selected.submissions.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activityLabel(sub.activityType)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-400">{formatDate(sub.createdAt)}</p>
                            {sub.autoChecked && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Auto</span>}
                          </div>
                          {sub.proofUrl && <a href={sub.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">View proof →</a>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[sub.status]}`}>{sub.status}</span>
                          {sub.status === "PENDING" && (
                            <div className="flex gap-1">
                              <button onClick={() => updateSubmission(sub.id, "APPROVED")}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">✓</button>
                              <button onClick={() => updateSubmission(sub.id, "REJECTED")}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors">✗</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
