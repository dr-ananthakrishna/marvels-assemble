"use client";
import Link from "next/link";
import { Sparkles, LogIn, UserPlus } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Sparkles className="w-8 h-8 text-[#62C8DF]" strokeWidth={1.5} />
          <h1 className="text-4xl font-semibold">MARVELS</h1>
        </div>

        <p className="text-[#666666] mb-12 text-lg">
          Empowering medical students to lead, inspire, and grow with Marrow.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="w-full h-12 rounded-[4px] flex items-center justify-center gap-3 relative"
          >
            <div
              aria-hidden
              className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
            />
            <LogIn className="w-5 h-5 relative z-10 text-white" strokeWidth={2} />
            <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
              LOGIN WITH MARROW
            </span>
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
          </Link>

          <Link
            href="/register"
            className="w-full py-4 px-6 rounded-[4px] flex items-center justify-center gap-3 font-medium text-sm text-[#4a69a2] hover:bg-[#F5F5F7] transition-colors"
          >
            <UserPlus className="w-5 h-5" strokeWidth={2} />
            Register as New Marvel
          </Link>
        </div>
      </div>
    </div>
  );
}
