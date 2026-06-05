"use client";
import { useEffect, useState } from "react";
import {
  Shield,
  Star,
  Heart,
  BookOpen,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Eye,
  Target,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

const BADGE_SECTIONS = [
  {
    title: "Influencer",
    label: "Milestone",
    badges: [
      { name: "Influence", points: 3, icon: TrendingUp, requiredPoints: 50 },
      { name: "Visionary", points: 5, icon: Eye, requiredPoints: 150 },
      { name: "Impact", points: 10, icon: Target, requiredPoints: 300 },
    ],
  },
  {
    title: "Academic",
    label: "Milestone",
    badges: [
      { name: "Honor", points: 3, icon: BookOpen, requiredPoints: 500 },
      { name: "Excellence", points: 5, icon: Lightbulb, requiredPoints: 750 },
      { name: "Brilliance", points: 10, icon: Sparkles, requiredPoints: 1000 },
    ],
  },
  {
    title: "Leadership",
    label: "Milestone",
    badges: [
      { name: "Distinction", points: 3, icon: Shield, requiredPoints: 1500 },
      { name: "Promise", points: 5, icon: Star, requiredPoints: 2000 },
      { name: "Integrity", points: 10, icon: Heart, requiredPoints: 2500 },
    ],
  },
];

export default function BadgesPage() {
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.points) setUserPoints(d.user.points);
      })
      .catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Badge Sections */}
        <div className="space-y-6">
          {BADGE_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <span className="text-xs bg-[#62C8DF]/10 text-[#62C8DF] px-2 py-1 rounded-full font-medium">
                  {section.label}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-3 pb-2">
                {section.badges.map((badge) => {
                  const Icon = badge.icon;
                  const unlocked = userPoints >= badge.requiredPoints;
                  return (
                    <div
                      key={badge.name}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(0,0,0,0.08)] flex flex-col items-center text-center min-w-[140px] lg:min-w-0 lg:flex-row lg:gap-4 lg:text-left lg:p-8"
                    >
                      {/* Badge Circle */}
                      <div
                        className={`w-[50px] h-[50px] lg:w-[80px] lg:h-[80px] rounded-full flex items-center justify-center mb-3 lg:mb-0 flex-shrink-0 ${
                          unlocked
                            ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E]"
                            : "bg-[#E8E8ED]"
                        }`}
                      >
                        <Icon
                          className="w-6 h-6 lg:w-10 lg:h-10"
                          strokeWidth={1.5}
                          color={unlocked ? "white" : "#959A9B"}
                        />
                      </div>

                      <div className="flex-1">
                        <h3
                          className={`text-sm lg:text-base font-semibold mb-2 ${
                            unlocked ? "text-[#1A1A2E]" : "text-[#959A9B]"
                          }`}
                        >
                          {badge.name}
                        </h3>
                        <div
                          className={`text-sm ${
                            unlocked ? "text-[#1A1A2E]" : "text-[#959A9B]"
                          }`}
                        >
                          {badge.points} pts
                        </div>
                        {unlocked && (
                          <div className="mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Unlocked ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* How to Earn Badges */}
        <div className="bg-white rounded-2xl p-8 border border-[#62C8DF]/20 shadow-sm">
          <h3 className="text-xl font-semibold mb-3">How to Earn Badges</h3>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Complete Activities",
                desc: "Submit activities in different tracks to earn points toward badges",
              },
              {
                step: "2",
                title: "Accumulate Points",
                desc: "Each badge requires specific points: 3pts, 5pts, or 10pts",
              },
              {
                step: "3",
                title: "Unlock Achievements",
                desc: "Earn badges across Leadership, Academic, and Influencer categories",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#62C8DF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#62C8DF] font-semibold text-sm">{item.step}</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-[#666666]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
