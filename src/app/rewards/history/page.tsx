"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Star } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";

interface HistoryEntry {
  id: string;
  type: "earned" | "spent";
  description: string;
  activityType?: string;
  points: number;
  date: string;
}

interface Summary {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
}

const ACTIVITY_ICONS: Record<string, string> = {
  REEL: "🎬",
  COMMUNITY: "💬",
  QUIZ: "📝",
  DOUBT_SESSION: "🎥",
  CLASSROOM_SESSION: "👥",
  COLLEGE_EVENT: "🏛️",
  REFERRAL: "👤",
  REPORT_PIRACY: "⚠️",
  CASE_CLUB: "🏆",
  NEW_INITIATIVE: "💡",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function RewardsHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalEarned: 0, totalSpent: 0, currentBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rewards/history")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setHistory(d.history ?? []);
          setSummary(d.summary ?? { totalEarned: 0, totalSpent: 0, currentBalance: 0 });
        }
      })
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/rewards"
          className="inline-flex items-center gap-2 text-sm text-[#62C8DF] hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rewards
        </Link>

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Points History</h1>
          <p className="text-sm text-[#666666] mt-1">Track your earned and spent points</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-[rgba(0,0,0,0.08)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs text-[#666666]">Total Earned</div>
              <div className="text-2xl font-bold text-green-600">{summary.totalEarned}</div>
              <div className="text-xs text-[#999]">pts</div>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-[rgba(0,0,0,0.08)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-red-500" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs text-[#666666]">Total Spent</div>
              <div className="text-2xl font-bold text-red-500">{summary.totalSpent}</div>
              <div className="text-xs text-[#999]">pts</div>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-[rgba(0,0,0,0.08)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#62C8DF]/15 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-[#62C8DF]" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs text-[#666666]">Current Balance</div>
              <div className="text-2xl font-bold text-[#62C8DF]">{summary.currentBalance}</div>
              <div className="text-xs text-[#999]">pts</div>
            </div>
          </div>
        </div>

        {/* Transaction Log */}
        <div className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
            <h2 className="font-semibold text-[#1A1A2E]">Transaction Log</h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-[#666666] text-sm">
              Loading history…
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-red-500 text-sm">{error}</div>
          ) : history.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#CCCCCC]" strokeWidth={1.5} />
              </div>
              <p className="text-[#666666] font-medium">No transactions yet</p>
              <p className="text-sm text-[#999] mt-1">
                Complete activities to start earning points
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(0,0,0,0.05)]">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                      entry.type === "earned"
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    {entry.type === "earned"
                      ? (entry.activityType ? ACTIVITY_ICONS[entry.activityType] ?? "⭐" : "⭐")
                      : "🎁"}
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#1A1A2E] text-sm truncate">
                      {entry.description}
                    </div>
                    <div className="text-xs text-[#999] mt-0.5">
                      {formatDate(entry.date)} · {formatTime(entry.date)}
                    </div>
                  </div>

                  {/* Points badge */}
                  <div
                    className={`text-sm font-bold flex-shrink-0 ${
                      entry.type === "earned" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {entry.type === "earned" ? "+" : "−"}
                    {entry.points} pts
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
