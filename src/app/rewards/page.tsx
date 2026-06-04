"use client";
import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const REWARDS = [
  {
    id: "r-1",
    name: "Plan C 3 month",
    points: 50,
    image: "📋",
    description: "3-month Plan C subscription",
    category: "Subscription",
  },
  {
    id: "r-2",
    name: "Marrow Hoodies",
    points: 100,
    image: "👕",
    description: "Exclusive Marrow branded hoodie",
    category: "Merchandise",
  },
  {
    id: "r-3",
    name: "Stethoscope",
    points: 200,
    image: "🩺",
    description: "Professional medical stethoscope",
    category: "Medical",
  },
  {
    id: "r-4",
    name: "Amazon Voucher (Rs 10,000)",
    points: 300,
    image: "🎁",
    description: "Amazon gift voucher worth Rs 10,000",
    category: "Voucher",
  },
  {
    id: "r-5",
    name: "iPad 11th gen",
    points: 500,
    image: "📱",
    description: "Apple iPad 11th generation",
    category: "Electronics",
  },
];

export default function RewardsPage() {
  const [availablePoints, setAvailablePoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [selectedReward, setSelectedReward] = useState<(typeof REWARDS)[0] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.availablePoints !== undefined) setAvailablePoints(d.user.availablePoints);
        if (d.user?.totalPoints !== undefined) setTotalEarned(d.user.totalPoints);
      })
      .catch(() => {});
  }, []);

  const handleRedeem = async () => {
    if (!selectedReward) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: selectedReward.id }),
      });
      if (res.ok) {
        setShowSuccess(true);
        setAvailablePoints((p) => p - selectedReward.points);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedReward(null);
        }, 2500);
      }
    } catch {
      // Handle error
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Points Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[rgba(0,0,0,0.08)]">
            <div className="text-sm text-[#666666] mb-1">Points Available</div>
            <div className="text-3xl font-semibold text-[#62C8DF]">{availablePoints}</div>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[rgba(0,0,0,0.08)]">
            <div className="text-sm text-[#666666] mb-1">Total Earned</div>
            <div className="text-3xl font-semibold text-[#62C8DF]">{totalEarned}</div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REWARDS.map((reward) => {
            const canAfford = availablePoints >= reward.points;

            return (
              <div
                key={reward.id}
                className={`rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-sm ${
                  canAfford
                    ? "border-[#62C8DF]/20 hover:shadow-lg hover:shadow-[#62C8DF]/10 cursor-pointer"
                    : "border-[rgba(0,0,0,0.08)] opacity-60"
                }`}
                onClick={() => canAfford && setSelectedReward(reward)}
              >
                {/* Image */}
                <div className="h-32 flex items-center justify-center text-5xl bg-white">
                  {reward.image}
                </div>

                {/* Separator */}
                <div className="h-px bg-[rgba(0,0,0,0.08)]" />

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`font-semibold ${
                        !canAfford ? "text-[#666666]" : "text-[#1A1A2E]"
                      }`}
                    >
                      {reward.name}
                    </h3>
                    {canAfford && (
                      <Gift className="w-5 h-5 text-[#62C8DF]" strokeWidth={1.5} />
                    )}
                  </div>

                  <p className="text-sm text-[#666666] mb-4">{reward.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs bg-[#F5F5F7] px-3 py-1 rounded-full">
                      {reward.category}
                    </div>
                    <div
                      className={`font-semibold ${
                        canAfford ? "text-[#62C8DF]" : "text-[#666666]"
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
                      className="w-full h-10 rounded-[4px] relative"
                    >
                      <div
                        aria-hidden
                        className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
                      />
                      <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                        REDEEM
                      </span>
                      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
                    </button>
                  ) : (
                    <div className="w-full bg-[#E8E8ED] text-[#666666] py-3 rounded-lg text-center text-sm">
                      Need {reward.points - availablePoints} more points
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* How Redemption Works */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-3">How Redemption Works</h3>
          <ul className="space-y-2 text-sm text-[#666666]">
            {[
              "Choose a reward you can afford with your current points",
              'Click "Redeem" and confirm your shipping details',
              "Your reward will be shipped within 7–10 business days",
              "Points will be deducted only after successful redemption",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#62C8DF] font-bold">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => {
            setSelectedReward(null);
            setShowSuccess(false);
          }}
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
                  This will cost {selectedReward.points} points. You&apos;ll have{" "}
                  {availablePoints - selectedReward.points} points remaining.
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    className="h-10 px-8 w-52 rounded-[4px] relative disabled:opacity-60"
                  >
                    <div
                      aria-hidden
                      className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
                    />
                    <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                      {redeeming ? "CONFIRMING..." : "CONFIRM"}
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
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-green-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#626768]">
                  Redemption Successful!
                </h3>
                <p className="text-[#7b8182] text-sm">
                  Your reward will be shipped soon. Check your email for tracking details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
