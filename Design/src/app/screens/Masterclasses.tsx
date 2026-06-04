import { Lock, Play, CheckCircle } from 'lucide-react';

const MASTERCLASSES = [
  {
    title: 'Social Media Influencer',
    description: 'Master the art of creating engaging content and growing your digital presence',
    duration: '2.5 hours',
    publishDate: 'Jan 15, 2026',
    requiredPoints: 1000,
    locked: true,
  },
  {
    title: 'Public Speaking',
    description: 'Develop confidence and techniques for impactful presentations and speeches',
    duration: '3 hours',
    publishDate: 'Feb 20, 2026',
    requiredPoints: 1000,
    locked: true,
  },
  {
    title: 'Storytelling',
    description: 'Learn to craft compelling narratives that inspire and engage audiences',
    duration: '2 hours',
    publishDate: 'Mar 10, 2026',
    requiredPoints: 2500,
    locked: true,
  },
  {
    title: 'Career Paths',
    description: 'Navigate your medical career with insights from industry leaders and mentors',
    duration: '4 hours',
    publishDate: 'Apr 5, 2026',
    requiredPoints: 2500,
    locked: true,
  },
  {
    title: 'AI in Healthcare',
    description: 'Explore the future of medicine with AI and emerging technologies',
    duration: '3.5 hours',
    publishDate: 'May 12, 2026',
    requiredPoints: 2500,
    locked: true,
  },
];

export default function Masterclasses() {
  const currentPoints = 450;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Current Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">Your Points</div>
            <div className="text-2xl font-semibold text-[#62C8DF]">{currentPoints}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Reach 1,000 points to unlock your first master classes
          </div>
        </div>

        {/* Masterclass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MASTERCLASSES.map((masterclass, index) => {
            const isLocked = currentPoints < masterclass.requiredPoints;
            const thumbnailColors = [
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-orange-500 to-red-500',
              'from-green-500 to-emerald-500',
              'from-indigo-500 to-purple-500',
            ];

            return (
              <div
                key={masterclass.title}
                className={`rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-sm ${
                  isLocked
                    ? 'border-border opacity-60'
                    : 'border-[#62C8DF] hover:shadow-lg hover:shadow-[#62C8DF]/10'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className={`h-40 flex items-center justify-center ${
                    isLocked
                      ? 'bg-[#F5F5F5]'
                      : `bg-gradient-to-br ${thumbnailColors[index % thumbnailColors.length]}`
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-12 h-12 text-muted-foreground" />
                  ) : (
                    <Play className="w-16 h-16 text-white" strokeWidth={1.5} />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-semibold ${isLocked && 'text-muted-foreground'}`}>
                      {masterclass.title}
                    </h3>
                  </div>

                  <p
                    className={`text-sm mb-4 ${
                      isLocked ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {masterclass.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">{masterclass.duration}</span>
                    <span className="text-muted-foreground">{masterclass.publishDate}</span>
                  </div>

                  {isLocked && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" strokeWidth={2} />
                        <span>{masterclass.requiredPoints.toLocaleString()} points to unlock</span>
                      </div>
                    </div>
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
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#62C8DF] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span className="text-muted-foreground">
                Complete activities to earn points and advance through ranks
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#62C8DF] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span className="text-muted-foreground">
                Each rank unlocks exclusive master classes tailored to your growth
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#62C8DF] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span className="text-muted-foreground">
                Learn from industry experts and Marrow leaders
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
