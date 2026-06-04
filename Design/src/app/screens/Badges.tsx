import { Shield, Star, Heart, BookOpen, Lightbulb, Sparkles, TrendingUp, Eye, Target } from 'lucide-react';

const BADGE_SECTIONS = [
  {
    title: 'Influencer',
    label: 'Milestone',
    badges: [
      { name: 'Influence', points: 3, icon: TrendingUp, unlocked: true },
      { name: 'Visionary', points: 5, icon: Eye, unlocked: false },
      { name: 'Impact', points: 10, icon: Target, unlocked: false },
    ],
  },
  {
    title: 'Academic',
    label: 'Milestone',
    badges: [
      { name: 'Honor', points: 3, icon: BookOpen, unlocked: false },
      { name: 'Excellence', points: 5, icon: Lightbulb, unlocked: false },
      { name: 'Brilliance', points: 10, icon: Sparkles, unlocked: false },
    ],
  },
  {
    title: 'Leadership',
    label: 'Milestone',
    badges: [
      { name: 'Distinction', points: 3, icon: Shield, unlocked: false },
      { name: 'Promise', points: 5, icon: Star, unlocked: false },
      { name: 'Integrity', points: 10, icon: Heart, unlocked: false },
    ],
  },
];

export default function Badges() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Badge Sections */}
        <div className="space-y-6">
          {BADGE_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-3">
                {section.badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.name}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center text-center min-w-[140px] lg:min-w-0 lg:flex-row lg:gap-4 lg:text-left lg:p-8"
                    >
                      {/* Badge Circle */}
                      <div
                        className={`w-[50px] h-[50px] lg:w-[80px] lg:h-[80px] rounded-full flex items-center justify-center mb-3 lg:mb-0 flex-shrink-0 ${
                          badge.unlocked
                            ? 'bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E]'
                            : 'bg-[#E8E8ED]'
                        }`}
                      >
                        <Icon
                          className="w-6 h-6 lg:w-10 lg:h-10"
                          strokeWidth={1.5}
                          color={badge.unlocked ? 'white' : '#959A9B'}
                        />
                      </div>

                      <div className="flex-1">
                        {/* Badge Name */}
                        <h3
                          className={`text-sm lg:text-base font-semibold mb-2 ${
                            badge.unlocked ? 'text-foreground' : 'text-[#959A9B]'
                          }`}
                        >
                          {badge.name}
                        </h3>

                        {/* Points */}
                        <div
                          className={`text-sm ${
                            badge.unlocked ? 'text-foreground' : 'text-[#959A9B]'
                          }`}
                        >
                          {badge.points} pts
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#62C8DF]/20 shadow-sm">
          <h3 className="text-xl font-semibold mb-3">How to Earn Badges</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#62C8DF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#62C8DF] font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Complete Activities</h4>
                <p className="text-sm text-muted-foreground">
                  Submit activities in different tracks to earn points toward badges
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#62C8DF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#62C8DF] font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Accumulate Points</h4>
                <p className="text-sm text-muted-foreground">
                  Each badge requires specific points: 3pts, 5pts, or 10pts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#62C8DF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#62C8DF] font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Unlock Achievements</h4>
                <p className="text-sm text-muted-foreground">
                  Earn badges across Leadership, Academic, and Influencer categories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
