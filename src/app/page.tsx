"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/welcome");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl font-semibold tracking-tight mb-4">
          Pulse <span className="text-[#62C8DF]">Points</span>
        </h1>

        <div className="flex items-center justify-center gap-1 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 bg-[#62C8DF] rounded-full"
              style={{
                height: "32px",
                animation: `pulse-bar 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        <p className="text-[#666666] text-lg">Your impact, measured.</p>
      </div>

      <style jsx>{`
        @keyframes pulse-bar {
          0%, 100% { height: 32px; opacity: 0.4; }
          50% { height: 48px; opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
