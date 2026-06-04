"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Stage = "instructions" | "upload" | "processing" | "result";

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("instructions");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ approved: boolean; score: number; reason: string } | null>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    });
    fetch("/api/onboarding/status").then(r => r.json()).then(d => {
      if (d.onboarding?.status === "APPROVED") router.replace("/dashboard");
    });
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleUpload() {
    if (!file) return;
    setStage("processing");
    setError("");

    const form = new FormData();
    form.append("video", file);

    try {
      const res = await fetch("/api/onboarding/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setStage("upload"); return; }
      setResult(data.scoring);
      setStage("result");
    } catch {
      setError("Upload failed. Try again.");
      setStage("upload");
    }
  }

  const questions = [
    "Introduce yourself — your name, college, and what you study.",
    "Why do you want to be a Marvel ambassador?",
    "How will you promote the platform in your campus? Be specific.",
    "How many students can you realistically reach in the first month?",
    "Share a time you led or organised something in your college.",
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-indigo-700">⚡ Marvels Assemble</h1>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">{user.name}</span>}
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="max-w-lg w-full">

          {stage === "instructions" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Marvel Application Video</h1>
                <p className="text-gray-500 text-sm mt-1">Record a 2–3 minute video answering these questions</p>
              </div>
              <ol className="space-y-3">
                {questions.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <p className="text-sm text-gray-700">{q}</p>
                  </li>
                ))}
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-xs">📹 Record on any device. Keep it under 100MB. MP4 or MOV preferred. Our AI will score your video instantly.</p>
              </div>
              <button
                onClick={() => setStage("upload")}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
              >
                I'm ready — upload my video
              </button>
            </div>
          )}

          {stage === "upload" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Upload your video</h1>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                {file ? (
                  <div className="space-y-1">
                    <p className="text-indigo-700 font-medium text-sm">✅ {file.name}</p>
                    <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-3xl">📹</p>
                    <p className="text-gray-600 text-sm font-medium">Click to choose video</p>
                    <p className="text-gray-400 text-xs">MP4, MOV — max 100MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef} type="file" accept="video/*" className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleUpload} disabled={!file}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors text-sm"
              >
                Submit for AI scoring
              </button>
            </div>
          )}

          {stage === "processing" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center space-y-4">
              <div className="text-5xl animate-pulse">🤖</div>
              <h2 className="text-xl font-bold text-gray-900">AI is reviewing your video...</h2>
              <p className="text-gray-500 text-sm">This takes 20–40 seconds. Please don't close this tab.</p>
              <div className="flex justify-center gap-1 pt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {stage === "result" && result && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              <div className={`text-center p-6 rounded-xl ${result.approved ? "bg-green-50" : "bg-red-50"}`}>
                <p className="text-4xl mb-2">{result.approved ? "🎉" : "😔"}</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {result.approved ? "You're in! Welcome, Marvel!" : "Not this time"}
                </h2>
                <p className="text-3xl font-bold mt-2 text-gray-700">Score: {result.score}/100</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">AI feedback</p>
                <p className="text-sm text-gray-600">{result.reason}</p>
              </div>
              {result.approved ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  Go to my dashboard →
                </button>
              ) : (
                <button
                  onClick={() => { setFile(null); setStage("instructions"); }}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Try again
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
