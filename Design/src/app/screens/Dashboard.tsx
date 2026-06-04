import { TrendingUp, Users, Target, CheckCircle, Star, TrendingUp as InfluenceIcon, Play } from 'lucide-react';

const RANK_DATA = {
  name: 'Dr. Nawaz M',
  currentRank: 'APPOINTED',
  currentSales: 0,
  nextRank: 'NOMINATED',
  salesNeeded: 5,
  ranks: [
    { name: 'NOMINATED', sales: 5 },
    { name: 'CAPTAIN', sales: 25 },
    { name: 'MAJOR', sales: 40 },
  ],
};

const METRICS = [
  { label: 'Total Rewards', value: '3', icon: Target },
  { label: 'Activities Completed', value: '12', icon: CheckCircle },
];

const RECENT_BADGES = [
  { name: 'Influence', points: 3, icon: InfluenceIcon, unlocked: true },
];

const LATEST_MASTERCLASS = {
  title: 'Social Media Influencer',
  description: 'Master the art of creating engaging content and growing your digital presence',
  duration: '2.5 hours',
  publishDate: 'Jan 15, 2026',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Rank Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Top Section - Cyan Background */}
          <div className="bg-[#62C8DF] px-4 py-6 md:px-8 md:py-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#4A4A4A] mb-1 md:mb-2">{RANK_DATA.name}</h2>
            <div className="text-white font-bold text-base md:text-lg mb-4 md:mb-6 tracking-wide">
              {RANK_DATA.currentRank}
            </div>

            {/* Badge Circle */}
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="relative">
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-[#2A2A2A] border-4 md:border-8 border-[#FFB800] flex items-center justify-center">
                  <Star className="w-12 h-12 md:w-20 md:h-20 text-[#62C8DF] fill-[#62C8DF]" strokeWidth={0} />
                </div>
                {/* Sales Ribbon Banner */}
                <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 flex items-center">
                  {/* Left ribbon tail */}
                  <svg className="w-4 h-6 md:w-6 md:h-8" viewBox="0 0 24 32" fill="none">
                    <path d="M24 0 L0 16 L24 32 L24 0Z" fill="white"/>
                  </svg>

                  {/* Center banner */}
                  <div className="bg-white px-4 py-1 md:px-6 md:py-2 border-t-2 border-b-2 border-[#2A2A2A] relative">
                    {/* Top golden accents */}
                    <div className="absolute -top-1 left-0 w-3 h-2 md:w-4 md:h-3 bg-[#FFB800]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                    <div className="absolute -top-1 right-0 w-3 h-2 md:w-4 md:h-3 bg-[#FFB800]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>

                    <div className="font-bold text-sm md:text-lg text-[#2A2A2A]">
                      {RANK_DATA.currentSales} SALES
                    </div>
                  </div>

                  {/* Right ribbon tail */}
                  <svg className="w-4 h-6 md:w-6 md:h-8" viewBox="0 0 24 32" fill="none">
                    <path d="M0 0 L24 16 L0 32 L0 0Z" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="text-white font-medium text-sm md:text-base mt-5 md:mt-8">
              {RANK_DATA.salesNeeded} sales away from {RANK_DATA.nextRank}
            </div>
          </div>

          {/* Bottom Section - Rank Progression */}
          <div className="bg-white px-4 py-5 md:px-8 md:py-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {RANK_DATA.ranks.map((rank, index) => (
                <div key={rank.name} className="flex items-center">
                  <div className="text-center">
                    {/* Rank Badge Circle */}
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#2A2A2A] border-2 md:border-4 border-[#62C8DF] flex items-center justify-center mb-1 md:mb-2 mx-auto">
                      <div className="text-[#62C8DF]">
                        <Star className="w-6 h-6 md:w-10 md:h-10" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="font-bold text-xs md:text-sm text-[#2A2A2A] mb-0.5 md:mb-1">{rank.name}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{rank.sales} sales</div>
                  </div>
                  {index < RANK_DATA.ranks.length - 1 && (
                    <div className="w-8 md:w-16 h-0.5 bg-[#D8D8D8] mx-1 md:mx-2 mb-8 md:mb-12" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Strip */}
        <div className="grid grid-cols-2 gap-4">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-8 h-8 text-[#62C8DF]" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-semibold mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Badges */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Badges</h3>
          <div className="flex gap-4">
            {RECENT_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.name}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center text-center min-w-[140px]"
                >
                  <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-3 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E]">
                    <Icon className="w-6 h-6" strokeWidth={1.5} color="white" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2 text-foreground">{badge.name}</h3>
                  <div className="text-sm text-foreground">{badge.points} pts</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Masterclasses */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Masterclasses</h3>
          <div className="rounded-2xl overflow-hidden border-2 bg-white shadow-sm border-border opacity-60 max-w-sm">
            <div className="h-40 flex items-center justify-center bg-[#F5F5F5]">
              <Play className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-muted-foreground mb-3">{LATEST_MASTERCLASS.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{LATEST_MASTERCLASS.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{LATEST_MASTERCLASS.duration}</span>
                <span className="text-muted-foreground">{LATEST_MASTERCLASS.publishDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
