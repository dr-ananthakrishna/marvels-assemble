"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Stage = "instructions" | "upload" | "processing" | "result";

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("instructions");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{ approved: boolean; needsHumanReview?: boolean; score: number; reason: string } | null>(null);
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
    window.location.href = "/login";
  }

  async function handleUpload() {
    if (!file) return;
    if (file.size > 14 * 1024 * 1024) {
      setError("Video must be under 14MB (Gemini's inline limit). Compress with HandBrake or trim to under 2 minutes.");
      return;
    }
    setStage("processing");
    setError("");
    setUploadProgress(0);

    try {
      // Step 1: Get a signed upload URL from our server
      const ext = file.name.split(".").pop() || "mp4";
      const urlRes = await fetch(`/api/onboarding/upload-url?ext=${ext}`);
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error);

      // Step 2: Upload directly to Supabase (bypasses Vercel size limits)
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.open("PUT", urlData.signedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });

      // Step 3: Send just the public URL to our API for AI scoring
      const scoreRes = await fetch("/api/onboarding/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: urlData.publicUrl }),
      });
      const scoreData = await scoreRes.json();
      if (!scoreRes.ok) throw new Error(scoreData.error);

      setResult(scoreData.scoring);
      setStage("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
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
                <p className="text-amber-800 text-xs">📹 Keep your video under <strong>2 minutes</strong> and under <strong>14MB</strong>. MP4 preferred. Compress with <a href="https://www.handbrake.fr" target="_blank" rel="noreferrer" className="underline">HandBrake</a> if needed.</p>
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
                    <p className="text-gray-400 text-xs">MP4, MOV — max 14MB</p>
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
              {uploadProgress < 100 ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">Uploading your video...</h2>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-gray-500 text-sm">{uploadProgress}% — please don't close this tab</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">AI is reviewing your video...</h2>
                  <p className="text-gray-500 text-sm">This takes 20–40 seconds. Please don't close this tab.</p>
                  <div className="flex justify-center gap-1 pt-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {stage === "result" && result && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              <div className={`text-center p-6 rounded-xl ${result.approved ? "bg-green-50" : result.needsHumanReview ? "bg-yellow-50" : "bg-red-50"}`}>
                <p className="text-4xl mb-2">{result.approved ? "🎉" : result.needsHumanReview ? "⏳" : "😔"}</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {result.approved ? "You're in! Welcome, Marvel!" : result.needsHumanReview ? "Under review" : "Not this time"}
                </h2>
                <p className="text-3xl font-bold mt-2 text-gray-700">Score: {result.score}/100</p>
                {result.needsHumanReview && !result.approved && (
                  <p className="text-sm text-yellow-700 mt-2">Your application is being reviewed by our team. We'll notify you soon.</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">AI feedback</p>
                <p className="text-sm text-gray-600">{result.reason}</p>
              </div>
              {result.approved ? (
                <button
                  onClick={() => router.push(`/application-success?score=${result.score}&status=approved`)}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  Continue →
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
