"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  MessageSquare,
  FileText,
  Video,
  Users,
  Building2,
  UserPlus,
  AlertTriangle,
  Award,
  Lightbulb,
  X,
  Send,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

const ACTIVITIES = [
  {
    type: "REEL",
    name: "Reels",
    icon: Film,
    points: 50,
    verification: "Insta reel link",
  },
  {
    type: "COMMUNITY",
    name: "Community platforms - Quora / Reddit",
    icon: MessageSquare,
    points: 30,
    verification: "Link & Screenshot",
  },
  {
    type: "QUIZ",
    name: "Quiz: Google Form / Creator plus",
    icon: FileText,
    points: 80,
    verification: "Custom module code, Sheet Link with edit access",
  },
  {
    type: "DOUBT_SESSION",
    name: "Doubt solving sessions",
    icon: Video,
    points: 100,
    verification: "Photos & Videos",
  },
  {
    type: "CLASSROOM_SESSION",
    name: "Classroom sessions",
    icon: Users,
    points: 150,
    verification: "Photos & Videos",
  },
  {
    type: "COLLEGE_EVENT",
    name: "College events",
    icon: Building2,
    points: 200,
    verification: "Photos & Videos",
  },
  {
    type: "REFERRAL",
    name: "Referring a captain marvel",
    icon: UserPlus,
    points: 120,
    verification: "Registered email id and mobile",
  },
  {
    type: "REPORT_PIRACY",
    name: "Report Piracy Event",
    icon: AlertTriangle,
    points: 150,
    verification: "Link, Photos, Videos",
  },
  {
    type: "CASE_CLUB",
    name: "Case club",
    icon: Award,
    points: 100,
    verification: "Photos & Videos",
  },
  {
    type: "NEW_INITIATIVE",
    name: "New Initiative",
    icon: Lightbulb,
    points: 180,
    verification: "Link, Photos, Videos",
  },
];

interface SubmissionForm {
  link: string;
  notes: string;
  file: File | null;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<(typeof ACTIVITIES)[0] | null>(null);
  const [form, setForm] = useState<SubmissionForm>({ link: "", notes: "", file: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSubmit = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: selectedActivity.type,
          proofUrl: form.link,
          proofNote: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        return;
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedActivity(null);
        setForm({ link: "", notes: "", file: null });
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.type}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-all cursor-pointer shadow-sm"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#62C8DF]" strokeWidth={1.5} />
                  </div>
                  <div className="bg-[#82C42D] text-white px-3 py-1 rounded-full text-sm font-medium">
                    +{activity.points}
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{activity.name}</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Verification: {activity.verification}
                </p>

                <button
                  className="w-full h-10 rounded-[4px] relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedActivity(activity);
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
                  />
                  <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                    SUBMIT ACTIVITY
                  </span>
                  <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => {
            setSelectedActivity(null);
            setForm({ link: "", notes: "", file: null });
            setError("");
            setSubmitSuccess(false);
          }}
        >
          <div
            className="bg-white drop-shadow-[2px_1px_4px_rgba(0,0,0,0.18)] rounded-[4px] px-6 py-7 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {submitSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-[#626768] mb-2">Submitted!</h3>
                <p className="text-sm text-[#7b8182]">
                  Your activity has been submitted for review.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#626768]">
                    Submit {selectedActivity.name}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      setForm({ link: "", notes: "", file: null });
                      setError("");
                    }}
                    className="text-[#666666] hover:text-[#1A1A2E]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#626768]">Link</label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      placeholder="Paste verification link"
                      className="w-full px-4 py-3 bg-[#F5F5F7] rounded-[4px] border border-[rgba(0,0,0,0.08)] focus:border-[#62C8DF] focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#626768]">
                      Attachment
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf"
                      onChange={(e) =>
                        setForm({ ...form, file: e.target.files?.[0] || null })
                      }
                      className="w-full px-4 py-3 bg-[#F5F5F7] rounded-[4px] border border-[rgba(0,0,0,0.08)] focus:border-[#62C8DF] focus:outline-none text-sm"
                    />
                    <p className="text-xs text-[#7b8182] mt-1">Upload image, video, or PDF</p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#626768]">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any additional context..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F5F5F7] rounded-[4px] border border-[rgba(0,0,0,0.08)] focus:border-[#62C8DF] focus:outline-none resize-none text-sm"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 h-10 px-8 w-52 rounded-[4px] relative disabled:opacity-60"
                  >
                    <div
                      aria-hidden
                      className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
                    />
                    <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                      {submitting ? "SUBMITTING..." : "SUBMIT"}
                    </span>
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      setForm({ link: "", notes: "", file: null });
                      setError("");
                    }}
                    className="h-10 px-8 rounded-[4px] font-medium text-sm text-[#4a69a2]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
