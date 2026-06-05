"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Play, CheckCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const MASTERCLASSES = [
  {
    id: "mc-1",
    title: "Social Media Influencer",
    description:
      "Master the art of creating engaging content and growing your digital presence",
    duration: "2.5 hours",
    publishDate: "Jan 15, 2026",
    requiredPoints: 1000,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "mc-2",
    title: "Public Speaking",
    description:
      "Develop confidence and techniques for impactful presentations and speeches",
    duration: "3 hours",
    publishDate: "Feb 20, 2026",
    requiredPoints: 1000,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "mc-3",
    title: "Storytelling",
    description: "Learn to craft compelling narratives that inspire and engage audiences",
    duration: "2 hours",
    publishDate: "Mar 10, 2026",
    requiredPoints: 2500,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "mc-4",
    title: "Career Paths",
    description:
      "Navigate your medical career with insights from industry leaders and mentors",
    duration: "4 hours",
    publishDate: "Apr 5, 2026",
    requiredPoints: 2500,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "mc-5",
    title: "AI in Healthcare",
    description: "Explore the future of medicine with AI and emerging technologies",
    duration: "3.5 hours",
    publishDate: "May 12, 2026",
    requiredPoints: 2500,
    gradient: "from-indigo-500 to-purple-500",
  },
];

export default function MasterclassesPage() {
  const router = useRouter();
  const [currentPoints, setCurrentPoints] = useState(0);

  useEffect(() => {
    // Fetch user points from API
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
        if (d.user?.points !== undefined) setCurrentPoints(d.user.points);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Current Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-[#666666]">Your Points</div>
            <div className="text-2xl font-semibold text-[#62C8DF]">{currentPoints}</div>
          </div>
          <div className="w-full bg-[#E8E8ED] rounded-full h-2 mb-3">
            <div
              className="bg-[#62C8DF] h-2 rounded-full transition-all"
              style={{ width: `${Math.min((currentPoints / 1000) * 100, 100)}%` }}
            />
          </div>
          <div className="text-sm text-[#666666]">
            {currentPoints < 1000
              ? `${1000 - currentPoints} more points to unlock your first master classes`
              : "You've unlocked the first tier of master classes!"}
          </div>
        </div>

        {/* Masterclass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MASTERCLASSES.map((masterclass) => {
            const isLocked = currentPoints < masterclass.requiredPoints;

            return (
              <div
                key={masterclass.id}
                className={`rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-sm ${
                  isLocked
                    ? "border-[rgba(0,0,0,0.08)] opacity-60"
                    : "border-[#62C8DF] hover:shadow-lg hover:shadow-[#62C8DF]/10 cursor-pointer"
                }`}
              >
                {/* Thumbnail */}
                <div
                  className={`h-40 flex items-center justify-center ${
                    isLocked
                      ? "bg-[#F5F5F5]"
                      : `bg-gradient-to-br ${masterclass.gradient}`
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-12 h-12 text-[#666666]" />
                  ) : (
                    <Play className="w-16 h-16 text-white" strokeWidth={1.5} />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className={`font-semibold mb-3 ${
                      isLocked ? "text-[#666666]" : "text-[#1A1A2E]"
                    }`}
                  >
                    {masterclass.title}
                  </h3>

                  <p className="text-sm text-[#666666] mb-4">{masterclass.description}</p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-[#666666]">{masterclass.duration}</span>
                    <span className="text-[#666666]">{masterclass.publishDate}</span>
                  </div>

                  {isLocked ? (
                    <div className="bg-[#E8E8ED] rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-[#666666]">
                        <Lock className="w-4 h-4" strokeWidth={2} />
                        <span>
                          {masterclass.requiredPoints.toLocaleString()} points to unlock
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button className="w-full h-10 rounded-[4px] relative">
                      <div
                        aria-hidden
                        className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
                      />
                      <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                        WATCH NOW
                      </span>
                      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#62C8DF]/20 shadow-sm">
          <h3 className="text-xl font-semibold mb-3">How to Unlock Master Classes</h3>
          <ul className="space-y-2">
            {[
              "Complete activities to earn points and advance through ranks",
              "Each rank unlocks exclusive master classes tailored to your growth",
              "Learn from industry experts and Marrow leaders",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle
                  className="w-5 h-5 text-[#62C8DF] flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-[#666666]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
