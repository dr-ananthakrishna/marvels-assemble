import { Gift, Headphones, BookOpen, Watch, Smartphone, Zap } from 'lucide-react';
import { useState } from 'react';

const REWARDS = [
  {
    name: 'Plan C 3 month',
    points: 50,
    icon: Gift,
    image: '📋',
    description: '3-month Plan C subscription',
    category: 'Subscription',
  },
  {
    name: 'Marrow Hoodies',
    points: 100,
    icon: Gift,
    image: '👕',
    description: 'Exclusive Marrow branded hoodie',
    category: 'Merchandise',
  },
  {
    name: 'Stethoscope',
    points: 200,
    icon: Gift,
    image: '🩺',
    description: 'Professional medical stethoscope',
    category: 'Medical',
  },
  {
    name: 'Amazon Voucher (Rs 10,000)',
    points: 300,
    icon: Gift,
    image: '🎁',
    description: 'Amazon gift voucher worth Rs 10,000',
    category: 'Voucher',
  },
  {
    name: 'iPad 11th gen',
    points: 500,
    icon: Gift,
    image: '📱',
    description: 'Apple iPad 11th generation',
    category: 'Electronics',
  },
];

export default function Rewards() {
  const availablePoints = 50;
  const totalEarned = 100;
  const [selectedReward, setSelectedReward] = useState<typeof REWARDS[0] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRedeem = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedReward(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Points Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-border">
            <div className="text-sm text-muted-foreground mb-1">Points Available</div>
            <div className="text-3xl font-semibold text-[#62C8DF]">{availablePoints}</div>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total earned</div>
            <div className="text-3xl font-semibold text-[#62C8DF]">{totalEarned}</div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REWARDS.map((reward) => {
            const Icon = reward.icon;
            const canAfford = availablePoints >= reward.points;

            return (
              <div
                key={reward.name}
                className={`rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-sm ${
                  canAfford
                    ? 'border-[#62C8DF]/20 hover:shadow-lg hover:shadow-[#62C8DF]/10 cursor-pointer'
                    : 'border-border opacity-60'
                }`}
                onClick={() => canAfford && setSelectedReward(reward)}
              >
                {/* Image */}
                <div className="h-32 flex items-center justify-center text-5xl bg-white">
                  {reward.image}
                </div>

                {/* Separator */}
                <div className="h-px bg-border" />

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${!canAfford && 'text-muted-foreground'}`}>
                      {reward.name}
                    </h3>
                    {canAfford && <Icon className="w-5 h-5 text-[#62C8DF]" strokeWidth={1.5} />}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs bg-secondary px-3 py-1 rounded-full">
                      {reward.category}
                    </div>
                    <div
                      className={`font-semibold ${
                        canAfford ? 'text-[#62C8DF]' : 'text-muted-foreground'
                      }`}
                    >
                      {reward.points} pts
                    </div>
                  </div>

                  {canAfford ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReward(reward);
                      }}
                      className="w-full mt-4 h-10 rounded-[4px] relative"
                    >
                      <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
                      <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                        REDEEM
                      </span>
                      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                    </button>
                  ) : (
                    <div className="w-full mt-4 bg-muted text-muted-foreground py-3 rounded-lg text-center text-sm">
                      Need {reward.points - availablePoints} more points
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-3">How Redemption Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-[#62C8DF]">1.</span>
              <span>Choose a reward you can afford with your current points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#62C8DF]">2.</span>
              <span>Click "Redeem" and confirm your shipping details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#62C8DF]">3.</span>
              <span>Your reward will be shipped within 7-10 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#62C8DF]">4.</span>
              <span>Points will be deducted only after successful redemption</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedReward(null)}
        >
          <div
            className="bg-white drop-shadow-[2px_1px_4px_rgba(0,0,0,0.18)] rounded-[4px] px-6 py-7 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {!showSuccess ? (
              <>
                <div className="text-5xl text-center mb-4">{selectedReward.image}</div>
                <h3 className="text-xl font-semibold text-center mb-2 text-[#626768]">
                  Redeem {selectedReward.name}?
                </h3>
                <p className="text-center text-[#7b8182] text-sm mb-6">
                  This will cost {selectedReward.points} points. You'll have{' '}
                  {availablePoints - selectedReward.points} points remaining.
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={handleRedeem}
                    className="h-10 px-8 w-52 rounded-[4px] relative"
                  >
                    <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
                    <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                      CONFIRM
                    </span>
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                  </button>
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="h-10 px-8 rounded-[4px] font-medium text-sm text-[#4a69a2]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-green-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#626768]">Redemption Successful!</h3>
                <p className="text-[#7b8182] text-sm">
                  Your reward will be shipped soon. Check your email for tracking details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
