"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get("score");
  const status = searchParams.get("status");
  
  const numericScore = score ? parseInt(score, 10) : null;
  const isApproved = numericScore !== null && numericScore > 80;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {isApproved ? (
          <>
            <div className="w-24 h-24 bg-[#62C8DF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#62C8DF]" strokeWidth={2} />
            </div>

            <h1 className="text-3xl font-semibold mb-3">Application submitted!</h1>
            <p className="text-[#666666] mb-8 text-lg">
              We'll review your profile and get back to you soon. Meanwhile, explore what being a
              Marvel looks like.
            </p>

            <Link
              href="/dashboard"
              className="h-12 px-8 rounded-[4px] relative inline-flex items-center gap-2"
            >
              <div
                aria-hidden
                className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
              />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                EXPLORE THE PLATFORM
              </span>
              <ArrowRight className="w-5 h-5 relative z-10 text-white" strokeWidth={2} />
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </Link>

            <div className="mt-8 p-6 bg-[#F5F5F7] rounded-2xl text-left">
              <h3 className="font-semibold mb-3 text-[#1A1A2E]">What happens next?</h3>
              <ul className="space-y-3 text-sm text-[#666666]">
                <li className="flex items-start gap-2">
                  <span className="text-[#62C8DF] font-bold mt-0.5">1.</span>
                  <span>Our team will review your application within 3–5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#62C8DF] font-bold mt-0.5">2.</span>
                  <span>You'll receive an email with the decision</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#62C8DF] font-bold mt-0.5">3.</span>
                  <span>If approved, you'll get full access to activities, badges, and rewards</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-[#666666]" strokeWidth={2} />
            </div>

            <h1 className="text-3xl font-semibold mb-3">Application received!</h1>
            <p className="text-[#666666] mb-8 text-lg">
              Thank you for applying to become a Marvel Ambassador. Our team is reviewing your application.
            </p>

            <div className="p-6 bg-[#F5F5F7] rounded-2xl text-left">
              <h3 className="font-semibold mb-3 text-[#1A1A2E]">What happens next?</h3>
              <ul className="space-y-3 text-sm text-[#666666]">
                <li className="flex items-start gap-2">
                  <span className="text-[#62C8DF] font-bold mt-0.5">1.</span>
                  <span>Our team will review your application within 3–5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#62C8DF] font-bold mt-0.5">2.</span>
                  <span>You'll receive an email with the decision</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#62C8DF] font-bold mt-0.5">3.</span>
                  <span>If approved, you'll get full access to activities, badges, and rewards</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#666666]">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
