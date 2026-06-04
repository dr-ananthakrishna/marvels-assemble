"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activityLabel, formatDate } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

type Marvel = {
  id: string; name: string; email: string; college: string; createdAt: string;
  onboarding: { status: string; score: number; reason: string } | null;
  submissions: Array<{ id: string; activityType: string; status: string; autoChecked: boolean; proofUrl?: string; createdAt: string }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [marvels, setMarvels] = useState<Marvel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Marvel | null>(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

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
                  <button key={m.id} onClick={() => setSelected(m)}
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
                {/* Profile */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      <p className="text-sm text-gray-500">{selected.email} · {selected.college}</p>
                      <p className="text-xs text-gray-400 mt-1">Applied {formatDate(selected.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLE[selected.onboarding?.status || "PENDING"]}`}>
                      {selected.onboarding?.status || "PENDING"}
                    </span>
                  </div>
                  {selected.onboarding && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-1">
                      <p className="text-sm font-medium text-gray-700">Onboarding score: <span className="text-indigo-600">{selected.onboarding.score}/100</span></p>
                      <p className="text-xs text-gray-500">{selected.onboarding.reason}</p>
                    </div>
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
