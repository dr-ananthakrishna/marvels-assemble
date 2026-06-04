import { useState } from 'react';
import { Link2, Instagram, MessageSquare, Users, Award, Send, Video, Building2, UserPlus, AlertTriangle, Lightbulb, ClipboardList } from 'lucide-react';

const ACTIVITIES = [
  { name: 'Reels', icon: Instagram, points: 50, verification: 'Insta reel link' },
  { name: 'Community platforms - Quora / Reddit', icon: MessageSquare, points: 30, verification: 'Link & Screenshot' },
  { name: 'Quiz: Google Form / Creator plus', icon: ClipboardList, points: 80, verification: 'Custom module code, Sheet Link with edit access' },
  { name: 'Doubt solving sessions', icon: Video, points: 100, verification: 'Photos & Videos' },
  { name: 'Classroom sessions', icon: Users, points: 150, verification: 'Photos & Videos' },
  { name: 'College events', icon: Building2, points: 200, verification: 'Photos & Videos' },
  { name: 'Referring a captain marvel', icon: UserPlus, points: 120, verification: 'Registered email id and mobile' },
  { name: 'Report Piracy Event', icon: AlertTriangle, points: 150, verification: 'Link, Photos, Videos' },
  { name: 'Case club', icon: Award, points: 100, verification: 'Photos & Videos' },
  { name: 'New Initiative', icon: Lightbulb, points: 180, verification: 'Link, Photos, Videos' },
];

export default function Activities() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.name}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-all cursor-pointer shadow-sm"
                onClick={() => setSelectedActivity(activity.name)}
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
                <p className="text-sm text-muted-foreground mb-4">
                  Verification: {activity.verification}
                </p>

                <button className="w-full h-10 rounded-[4px] relative">
                  <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
                  <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                    SUBMIT ACTIVITY
                  </span>
                  <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Submission Modal */}
        {selectedActivity && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedActivity(null)}
          >
            <div
              className="bg-white drop-shadow-[2px_1px_4px_rgba(0,0,0,0.18)] rounded-[4px] px-6 py-7 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-6 text-[#626768] text-center">
                Submit {selectedActivity}
              </h3>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#626768]">Link</label>
                  <input
                    type="url"
                    placeholder="Paste verification link"
                    className="w-full px-4 py-3 bg-input-background rounded-[4px] border border-border focus:border-[#62C8DF] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#626768]">Attachment</label>
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    className="w-full px-4 py-3 bg-input-background rounded-[4px] border border-border focus:border-[#62C8DF] focus:outline-none text-sm"
                  />
                  <p className="text-xs text-[#7b8182] mt-1">Upload image, video, or PDF</p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#626768]">Notes</label>
                  <textarea
                    placeholder="Any additional context..."
                    rows={4}
                    className="w-full px-4 py-3 bg-input-background rounded-[4px] border border-border focus:border-[#62C8DF] focus:outline-none resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <button className="flex items-center justify-center gap-2 h-10 px-8 w-52 rounded-[4px] relative">
                  <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
                  <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                    SUBMIT
                  </span>
                  <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                </button>

                <button
                  onClick={() => setSelectedActivity(null)}
                  className="h-10 px-8 rounded-[4px] font-medium text-sm text-[#4a69a2]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
