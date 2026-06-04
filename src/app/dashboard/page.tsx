"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activityLabel, isAutoApproved, formatDate } from "@/lib/utils";

const ACTIVITIES = [
  { type: "REEL", icon: "🎬", fields: ["proofUrl"], labels: { proofUrl: "Instagram Reel URL" } },
  { type: "COMMUNITY", icon: "💬", fields: ["proofUrl"], labels: { proofUrl: "Post URL (Quora/Reddit)" } },
  { type: "QUIZ", icon: "📝", fields: ["proofUrl"], labels: { proofUrl: "Screenshot or proof link" } },
  { type: "REFERRAL", icon: "👥", fields: ["proofUrl"], labels: { proofUrl: "Referred user's email" } },
  { type: "DOUBT_SESSION", icon: "🙋", fields: ["proofUrl", "proofNote"], labels: { proofUrl: "Photo/Video link", proofNote: "Description" } },
  { type: "CLASSROOM_SESSION", icon: "🏫", fields: ["proofUrl", "proofNote"], labels: { proofUrl: "Photo/Video link", proofNote: "Description" } },
  { type: "COLLEGE_EVENT", icon: "🎪", fields: ["proofUrl", "proofNote"], labels: { proofUrl: "Photo/Video link", proofNote: "Event name & date" } },
  { type: "REPORT_PIRACY", icon: "🚨", fields: ["proofUrl"], labels: { proofUrl: "Evidence link" } },
  { type: "CASE_CLUB", icon: "💼", fields: ["proofUrl", "proofNote"], labels: { proofUrl: "Photo/Video link", proofNote: "Club & event details" } },
  { type: "NEW_INITIATIVE", icon: "💡", fields: ["proofUrl", "proofNote"], labels: { proofUrl: "Link (optional)", proofNote: "Describe your initiative" } },
];

interface ReelMeta { views: number; likes: number; comments: number; author?: string; isPrivate?: boolean; rejectionReason?: string }

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; college: string; instagramId?: string | null } | null>(null);
  const [onboarding, setOnboarding] = useState<{ status: string; score: number } | null | undefined>(undefined);
  const [submissions, setSubmissions] = useState<Array<{
    id: string; activityType: string; status: string; createdAt: string;
    proofUrl?: string; proofNote?: string; adminNote?: string; autoChecked?: boolean;
    metrics?: Record<string, unknown>;
  }>>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({ activityType: "REEL", proofUrl: "", proofNote: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  // Instagram ID capture state
  const [igInput, setIgInput] = useState("");
  const [igSaving, setIgSaving] = useState(false);
  const [igError, setIgError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
    });
    fetch("/api/onboarding/status").then(r => r.json()).then(d => {
      const ob = d.onboarding;
      if (!ob || ob.status !== "APPROVED") {
        router.replace("/onboarding");
      } else {
        setOnboarding(ob);
      }
    });
    loadSubmissions();
  }, [router]);

  function loadSubmissions() {
    fetch("/api/submissions").then(r => r.json()).then(d => setSubmissions(d.submissions || []));
  }

  async function saveInstagramId() {
    if (!igInput.trim()) return;
    setIgSaving(true);
    setIgError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramId: igInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setIgError(data.error); return; }
      setUser(u => u ? { ...u, instagramId: data.user.instagramId } : u);
      setIgInput("");
    } catch {
      setIgError("Network error.");
    } finally {
      setIgSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitMsg(data.error); return; }
      const status = data.submission.status;
      setSubmitMsg(
        status === "APPROVED" ? "✅ Auto-approved!" :
        status === "REJECTED" ? `❌ Rejected: ${(data.submission.metrics as ReelMeta)?.rejectionReason ?? "Check your submission."}` :
        "📋 Submitted for review."
      );
      setShowForm(false);
      loadSubmissions();
    } catch {
      setSubmitMsg("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedActivity = ACTIVITIES.find(a => a.type === formData.activityType);
  const needsInstagramId = formData.activityType === "REEL" && !user?.instagramId;

  if (!onboarding) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-indigo-700">⚡ Marvels Assemble</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name} · {user?.college}</span>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
            className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Status card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-indigo-200 text-sm font-medium">Your status</p>
          <h2 className="text-2xl font-bold mt-1">✅ Active Marvel</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-indigo-200 text-sm">Onboarding score: {onboarding.score}/100</p>
            {user?.instagramId && (
              <p className="text-indigo-200 text-sm">Instagram: @{user.instagramId}</p>
            )}
          </div>
        </div>

        {/* Submit activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Submit an activity</h2>
            <button onClick={() => { setShowForm(!showForm); setSubmitMsg(""); }}
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
              {showForm ? "Cancel" : "+ New submission"}
            </button>
          </div>

          {submitMsg && (
            <p className={`text-sm rounded-lg px-3 py-2 border ${submitMsg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-800" : submitMsg.startsWith("❌") ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200"}`}>
              {submitMsg}
            </p>
          )}

          {showForm && (
            <div className="space-y-4 pt-2">
              {/* Activity type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity type</label>
                <select
                  value={formData.activityType}
                  onChange={e => setFormData(f => ({ ...f, activityType: e.target.value, proofUrl: "", proofNote: "" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ACTIVITIES.map(a => (
                    <option key={a.type} value={a.type}>{a.icon} {activityLabel(a.type)}{isAutoApproved(a.type) ? " · Auto" : " · Manual review"}</option>
                  ))}
                </select>
              </div>

              {/* REEL: prompt for Instagram ID if not saved */}
              {needsInstagramId ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-amber-900">Instagram username required</p>
                    <p className="text-xs text-amber-700 mt-0.5">Your username is saved once and used to verify all future reel submissions.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                      <input
                        type="text"
                        placeholder="your_username"
                        value={igInput}
                        onChange={e => setIgInput(e.target.value.replace(/^@/, ""))}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={saveInstagramId}
                      disabled={igSaving || !igInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {igSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {igError && <p className="text-red-500 text-xs">{igError}</p>}
                </div>
              ) : (
                /* Normal submission form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formData.activityType === "REEL" && user?.instagramId && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      Verifying as <span className="font-medium">@{user.instagramId}</span> ·{" "}
                      <button type="button" onClick={() => setUser(u => u ? { ...u, instagramId: null } : u)}
                        className="text-indigo-500 hover:underline">change</button>
                    </p>
                  )}
                  {selectedActivity?.fields.map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {selectedActivity.labels[field as keyof typeof selectedActivity.labels]}
                      </label>
                      {field === "proofNote" ? (
                        <textarea
                          value={formData[field] || ""}
                          onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <input
                          type={field === "proofUrl" && formData.activityType !== "REFERRAL" ? "url" : "text"}
                          value={formData[field] || ""}
                          onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Submissions list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">My submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No submissions yet. Start by submitting an activity above.</p>
          ) : (
            <div className="space-y-2">
              {submissions.map(s => {
                const isOpen = expandedId === s.id;
                const reelMetrics = s.activityType === "REEL" && s.metrics ? s.metrics as ReelMeta : null;
                return (
                  <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Header row — always visible */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : s.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{ACTIVITIES.find(a => a.type === s.activityType)?.icon ?? "📄"}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{activityLabel(s.activityType)}</p>
                          <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[s.status]}`}>
                          {s.status}
                        </span>
                        <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="px-4 py-4 space-y-3 border-t border-gray-100 bg-white">
                        {s.proofUrl && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Proof link</p>
                            <a href={s.proofUrl} target="_blank" rel="noreferrer"
                              className="text-sm text-indigo-600 hover:underline break-all">
                              {s.proofUrl}
                            </a>
                          </div>
                        )}
                        {s.proofNote && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                            <p className="text-sm text-gray-700">{s.proofNote}</p>
                          </div>
                        )}
                        {reelMetrics && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Reel metrics</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { label: "Views", value: reelMetrics.views },
                                { label: "Likes", value: reelMetrics.likes },
                                { label: "Comments", value: reelMetrics.comments },
                              ].map(m => (
                                <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                                  <p className="text-xs text-gray-500">{m.label}</p>
                                  <p className="text-sm font-semibold text-gray-800">{String(m.value ?? "—")}</p>
                                </div>
                              ))}
                            </div>
                            {reelMetrics.author ? (
                              <p className="text-xs text-gray-500 mt-2">Author: @{String(reelMetrics.author)}</p>
                            ) : null}
                          </div>
                        )}
                        {reelMetrics?.rejectionReason ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-700">{reelMetrics.rejectionReason}</p>
                          </div>
                        ) : null}
                        {s.adminNote && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                            <p className="text-xs font-medium text-blue-700 mb-0.5">Admin note</p>
                            <p className="text-xs text-blue-700">{s.adminNote}</p>
                          </div>
                        )}
                        {s.autoChecked && (
                          <p className="text-xs text-gray-400">✓ Auto-verified</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
