"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

interface Marvel {
  id: string;
  name: string;
  email: string;
  college: string;
  phone?: string;
  instagramId?: string;
  dob?: string;
  state?: string;
  admissionYear?: string;
  referredBy?: string;
  about?: string;
  interests?: Record<string, number>;
  createdAt: string;
  onboarding?: {
    status: string;
    score?: number;
    videoUrl?: string;
    reason?: string;
    idCardUrl?: string;
    transcript?: string;
    breakdown?: Record<string, number> | null;
  };
}

interface Submission {
  id: string;
  userId: string;
  activityType: string;
  status: string;
  proofUrl?: string;
  proofNote?: string;
  adminNote?: string;
  createdAt: string;
  user?: { name: string; email: string; college: string };
}

type Tab = "overview" | "applications" | "submissions";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

const ACTIVITY_LABELS: Record<string, string> = {
  REEL: "Reels",
  COMMUNITY: "Community Platform",
  QUIZ: "Quiz",
  DOUBT_SESSION: "Doubt Session",
  CLASSROOM_SESSION: "Classroom Session",
  COLLEGE_EVENT: "College Event",
  REFERRAL: "Referral",
  REPORT_PIRACY: "Report Piracy",
  CASE_CLUB: "Case Club",
  NEW_INITIATIVE: "New Initiative",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [marvels, setMarvels] = useState<Marvel[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    about: true,
    interests: true,
    categoryScores: true,
    transcript: true,
  });

  function toggleSection(section: string) {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  useEffect(() => {
    // Verify admin access
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== "ADMIN") {
          router.push("/admin-login");
          return;
        }
        loadData();
      })
      .catch(() => router.push("/admin-login"));
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const [marvelsRes, submissionsRes] = await Promise.all([
        fetch("/api/admin/onboarding"),
        fetch("/api/admin/submissions"),
      ]);
      const marvelsData = await marvelsRes.json();
      const submissionsData = await submissionsRes.json();
      setMarvels(marvelsData.marvels || []);
      setSubmissions(submissionsData.submissions || []);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleOnboardingAction(
    marvelId: string,
    action: "APPROVED" | "REJECTED"
  ) {
    setActionLoading(marvelId);
    try {
      await fetch("/api/admin/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: marvelId, status: action }),
      });
      await loadData();
    } catch {
      // Handle error
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSubmissionAction(
    submissionId: string,
    action: "APPROVED" | "REJECTED"
  ) {
    setActionLoading(submissionId);
    try {
      await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          status: action,
          adminNote: adminNote[submissionId] || "",
        }),
      });
      await loadData();
    } catch {
      // Handle error
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  }

  const pendingApplications = marvels.filter(
    (m) => !m.onboarding || m.onboarding.status === "PENDING"
  );
  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");
  const approvedMarvels = marvels.filter((m) => m.onboarding?.status === "APPROVED");

  const filteredMarvels = marvels.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.activityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#073640] flex items-center justify-center">
        <div className="text-[#72A1AB]">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#073640] flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 pt-8">
          <span className="text-white font-bold text-xl tracking-tight">
            Pulse <span className="text-[#62C8DF]">Points</span>
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-[#62C8DF]" />
            <span className="text-[#72A1AB] text-xs">Admin Portal</span>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="mx-6 mb-4 bg-[#05272e] rounded-xl p-4 border border-[#3E5157]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#62C8DF]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#62C8DF]" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Admin</div>
              <div className="text-[#72A1AB] text-xs">Full Access</div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#3E5157] mx-6 mb-4" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {(
            [
              { id: "overview", label: "Overview", icon: Users },
              { id: "applications", label: "Applications", icon: Clock },
              { id: "submissions", label: "Submissions", icon: CheckCircle },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 pl-6 pr-6 py-3 transition-colors relative ${
                  active ? "text-white" : "text-[#72A1AB] hover:bg-white/10"
                }`}
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />}
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
                {item.id === "applications" && pendingApplications.length > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingApplications.length}
                  </span>
                )}
                {item.id === "submissions" && pendingSubmissions.length > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingSubmissions.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 pl-6 pr-6 py-3 text-[#72A1AB] hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-[#1A1A2E]">
              {activeTab === "overview"
                ? "Overview"
                : activeTab === "applications"
                ? "Marvel Applications"
                : "Activity Submissions"}
            </h1>
            {(activeTab === "applications" || activeTab === "submissions") && (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 bg-[#F5F5F7] rounded-lg border border-transparent focus:border-[#62C8DF] focus:outline-none text-sm w-64"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Marvels",
                    value: marvels.length,
                    color: "text-[#62C8DF]",
                    bg: "bg-[#62C8DF]/10",
                    icon: Users,
                  },
                  {
                    label: "Approved",
                    value: approvedMarvels.length,
                    color: "text-green-600",
                    bg: "bg-green-50",
                    icon: CheckCircle,
                  },
                  {
                    label: "Pending Applications",
                    value: pendingApplications.length,
                    color: "text-yellow-600",
                    bg: "bg-yellow-50",
                    icon: Clock,
                  },
                  {
                    label: "Pending Submissions",
                    value: pendingSubmissions.length,
                    color: "text-orange-600",
                    bg: "bg-orange-50",
                    icon: Eye,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(0,0,0,0.08)]"
                    >
                      <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
                      </div>
                      <div className={`text-3xl font-semibold ${stat.color} mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-[#666666]">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.08)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
                  <h3 className="font-semibold text-[#1A1A2E]">Recent Submissions</h3>
                </div>
                <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                  {submissions.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-[#1A1A2E]">
                          {sub.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-[#666666]">
                          {ACTIVITY_LABELS[sub.activityType] || sub.activityType}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border font-medium ${
                          STATUS_COLORS[sub.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  ))}
                  {submissions.length === 0 && (
                    <div className="px-6 py-8 text-center text-[#666666] text-sm">
                      No submissions yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              {filteredMarvels.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-[#666666] shadow-sm">
                  No applications found
                </div>
              ) : (
                filteredMarvels.map((marvel) => {
                  const status = marvel.onboarding?.status || "NO_VIDEO";
                  const isExpanded = expandedId === marvel.id;
                  return (
                    <div
                      key={marvel.id}
                      className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.08)] overflow-hidden"
                    >
                      <div
                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F5F5F7] transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : marvel.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#62C8DF]/10 flex items-center justify-center">
                            <span className="text-[#62C8DF] font-semibold text-sm">
                              {marvel.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#1A1A2E]">{marvel.name}</div>
                            <div className="text-sm text-[#666666]">
                              {marvel.email} · {marvel.college}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border font-medium ${
                              STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {status}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#666666]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#666666]" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-[rgba(0,0,0,0.06)]">
                          {/* User Info Section */}
                          <div className="pt-4 mb-4">
                            <h4 className="text-xs font-semibold text-[#073640] uppercase tracking-wider mb-3">User Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <div className="text-xs text-[#666666] mb-1">Phone</div>
                                <div className="text-sm font-medium">
                                  {marvel.phone || "Not provided"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-[#666666] mb-1">Applied</div>
                                <div className="text-sm font-medium">
                                  {new Date(marvel.createdAt).toLocaleDateString("en-IN")}
                                </div>
                              </div>
                              {marvel.instagramId && (
                                <div>
                                  <div className="text-xs text-[#666666] mb-1">Instagram</div>
                                  <div className="text-sm font-medium">{marvel.instagramId}</div>
                                </div>
                              )}
                              {marvel.dob && (
                                <div>
                                  <div className="text-xs text-[#666666] mb-1">Date of Birth</div>
                                  <div className="text-sm font-medium">
                                    {new Date(marvel.dob).toLocaleDateString("en-IN")}
                                  </div>
                                </div>
                              )}
                              {marvel.state && (
                                <div>
                                  <div className="text-xs text-[#666666] mb-1">State</div>
                                  <div className="text-sm font-medium">{marvel.state}</div>
                                </div>
                              )}
                              {marvel.admissionYear && (
                                <div>
                                  <div className="text-xs text-[#666666] mb-1">Admission Year</div>
                                  <div className="text-sm font-medium">{marvel.admissionYear}</div>
                                </div>
                              )}
                              {marvel.referredBy && (
                                <div>
                                  <div className="text-xs text-[#666666] mb-1">Referred By</div>
                                  <div className="text-sm font-medium">{marvel.referredBy}</div>
                                </div>
                              )}
                            </div>
                            {marvel.about && (
                              <div className="mt-3">
                                <button
                                  onClick={() => toggleSection("about")}
                                  className="flex items-center gap-2 text-xs text-[#666666] mb-1 hover:text-[#073640] transition-colors"
                                >
                                  {collapsedSections.about ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronUp className="w-3 h-3" />
                                  )}
                                  About
                                </button>
                                {!collapsedSections.about && (
                                  <div className="text-sm bg-[#F5F5F7] rounded-lg p-3">{marvel.about}</div>
                                )}
                              </div>
                            )}
                            {marvel.interests && Object.keys(marvel.interests).length > 0 && (
                              <div className="mt-3">
                                <button
                                  onClick={() => toggleSection("interests")}
                                  className="flex items-center gap-2 text-xs text-[#666666] mb-1 hover:text-[#073640] transition-colors"
                                >
                                  {collapsedSections.interests ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronUp className="w-3 h-3" />
                                  )}
                                  Interests
                                </button>
                                {!collapsedSections.interests && (
                                  <div className="space-y-2">
                                    {Object.entries(marvel.interests).map(([interest, score], i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between bg-[#F5F5F7] rounded-lg p-3"
                                      >
                                        <span className="text-sm text-[#073640]">{interest}</span>
                                        <span className="text-sm font-semibold text-[#62C8DF]">
                                          {score} / 5
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Onboarding Data Section */}
                          {marvel.onboarding && (
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-[#073640] uppercase tracking-wider mb-3 border-t border-[rgba(0,0,0,0.06)] pt-4">Onboarding Data</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {marvel.onboarding.score !== undefined && marvel.onboarding.score !== null && (
                                  <div>
                                    <div className="text-xs text-[#666666] mb-1">Overall AI Score</div>
                                    <div className="text-sm font-medium">
                                      {marvel.onboarding.score.toFixed(1)} / 100
                                    </div>
                                  </div>
                                )}
                                {marvel.onboarding.videoUrl && (
                                  <div>
                                    <div className="text-xs text-[#666666] mb-1">Video</div>
                                    <a
                                      href={marvel.onboarding.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-[#62C8DF] hover:underline"
                                    >
                                      View Video →
                                    </a>
                                  </div>
                                )}
                                {marvel.onboarding.idCardUrl && (
                                  <div>
                                    <div className="text-xs text-[#666666] mb-1">ID Card</div>
                                    <a
                                      href={marvel.onboarding.idCardUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-[#62C8DF] hover:underline"
                                    >
                                      View ID Card →
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Category Breakdown Scores */}
                              {marvel.onboarding.breakdown && typeof marvel.onboarding.breakdown === "object" && (
                                <div className="mb-4">
                                  <button
                                    onClick={() => toggleSection("categoryScores")}
                                    className="flex items-center gap-2 text-xs text-[#666666] mb-2 hover:text-[#073640] transition-colors"
                                  >
                                    {collapsedSections.categoryScores ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronUp className="w-3 h-3" />
                                    )}
                                    Category Scores
                                  </button>
                                  {!collapsedSections.categoryScores && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {Object.entries(marvel.onboarding.breakdown).map(([category, score]) => {
                                        const maxScores: Record<string, number> = {
                                          communication: 25,
                                          confidence: 25,
                                          leadership: 10,
                                          academics: 10,
                                          extracurriculars: 10,
                                          loveForMarrow: 10,
                                          entrepreneurial: 5,
                                          socialMedia: 5,
                                        };
                                        const max = maxScores[category] || 10;
                                        return (
                                          <div
                                            key={category}
                                            className="bg-[#F5F5F7] rounded-lg p-3 flex items-center justify-between"
                                          >
                                            <div className="text-sm font-medium capitalize">
                                              {category.replace(/([A-Z])/g, " $1").trim()}
                                            </div>
                                            <div className="text-sm font-semibold text-[#073640]">
                                              {score} <span className="text-xs text-[#666666] font-normal">/ {max}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Transcript */}
                              {marvel.onboarding.transcript && (
                                <div className="mb-4">
                                  <button
                                    onClick={() => toggleSection("transcript")}
                                    className="flex items-center gap-2 text-xs text-[#666666] mb-1 hover:text-[#073640] transition-colors"
                                  >
                                    {collapsedSections.transcript ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronUp className="w-3 h-3" />
                                    )}
                                    Transcript
                                  </button>
                                  {!collapsedSections.transcript && (
                                    <div className="text-sm bg-[#F5F5F7] rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                      {marvel.onboarding.transcript}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* AI Reason / Feedback */}
                              {marvel.onboarding.reason && (
                                <div className="mb-4">
                                  <div className="text-xs text-[#666666] mb-1">AI Feedback / Reason</div>
                                  <div className="text-sm bg-yellow-50 rounded-lg p-3 text-yellow-900 border border-yellow-200">
                                    {marvel.onboarding.reason}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {status === "PENDING" && (
                            <div className="flex gap-3 border-t border-[rgba(0,0,0,0.06)] pt-4">
                              <button
                                onClick={() =>
                                  handleOnboardingAction(marvel.id, "APPROVED")
                                }
                                disabled={actionLoading === marvel.id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleOnboardingAction(marvel.id, "REJECTED")
                                }
                                disabled={actionLoading === marvel.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-[#666666] shadow-sm">
                  No submissions found
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isExpanded = expandedId === sub.id;
                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.08)] overflow-hidden"
                    >
                      <div
                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F5F5F7] transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#62C8DF]/10 flex items-center justify-center">
                            <span className="text-[#62C8DF] font-semibold text-sm">
                              {(sub.user?.name || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#1A1A2E]">
                              {sub.user?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-[#666666]">
                              {ACTIVITY_LABELS[sub.activityType] || sub.activityType} ·{" "}
                              {new Date(sub.createdAt).toLocaleDateString("en-IN")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border font-medium ${
                              STATUS_COLORS[sub.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {sub.status}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#666666]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#666666]" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-[rgba(0,0,0,0.06)]">
                          <div className="pt-4 space-y-3 mb-4">
                            {sub.proofUrl && (
                              <div>
                                <div className="text-xs text-[#666666] mb-1">Proof Link</div>
                                <a
                                  href={sub.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#62C8DF] hover:underline break-all"
                                >
                                  {sub.proofUrl}
                                </a>
                              </div>
                            )}
                            {sub.proofNote && (
                              <div>
                                <div className="text-xs text-[#666666] mb-1">Notes</div>
                                <div className="text-sm bg-[#F5F5F7] rounded-lg p-3">
                                  {sub.proofNote}
                                </div>
                              </div>
                            )}
                            {sub.adminNote && (
                              <div>
                                <div className="text-xs text-[#666666] mb-1">Admin Note</div>
                                <div className="text-sm bg-yellow-50 rounded-lg p-3 text-yellow-800">
                                  {sub.adminNote}
                                </div>
                              </div>
                            )}
                          </div>

                          {sub.status === "PENDING" && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs text-[#666666] mb-1">
                                  Admin Note (optional)
                                </label>
                                <textarea
                                  value={adminNote[sub.id] || ""}
                                  onChange={(e) =>
                                    setAdminNote((n) => ({ ...n, [sub.id]: e.target.value }))
                                  }
                                  placeholder="Add a note for the Marvel..."
                                  rows={2}
                                  className="w-full px-3 py-2 bg-[#F5F5F7] rounded-lg border border-transparent focus:border-[#62C8DF] focus:outline-none resize-none text-sm"
                                />
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    handleSubmissionAction(sub.id, "APPROVED")
                                  }
                                  disabled={actionLoading === sub.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleSubmissionAction(sub.id, "REJECTED")
                                  }
                                  disabled={actionLoading === sub.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
