"use client";
import { useState, useRef } from "react";

type Stage = "upload" | "processing" | "result";

interface ScoringResult {
  approved: boolean;
  needsHumanReview: boolean;
  score: number;
  breakdown: {
    communication: number;
    confidence: number;
    leadership: number;
    academics: number;
    extracurriculars: number;
    loveForMarrow: number;
    entrepreneurial: number;
    socialMedia: number;
  };
  reason: string;
  transcript: string;
}

export default function InterviewScorerPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState("");
  const [rawJson, setRawJson] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 50;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  async function handleUpload() {
    if (!file) return;

    // Client-side file size validation (Supabase storage limit is 50 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `Video is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
        `Maximum allowed size is ${MAX_FILE_SIZE_MB} MB. ` +
        `Please compress your video or trim it to under 3 minutes before uploading.`
      );
      return;
    }

    setStage("processing");
    setError("");
    setUploadProgress(0);

    try {
      // Step 1: Get a signed upload URL (no auth required)
      const ext = file.name.split(".").pop() || "mp4";
      const urlRes = await fetch(
        `/api/interview-scorer/upload-url?ext=${ext}`
      );
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error);

      // Step 2: Upload directly to Supabase storage
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status < 300) {
            resolve();
          } else {
            // Parse Supabase error response for better error messages
            let errorMsg = `Upload failed (HTTP ${xhr.status})`;
            try {
              const body = JSON.parse(xhr.responseText);
              if (body.message) errorMsg = body.message;
            } catch {
              // Use default error message
            }
            reject(new Error(errorMsg));
          }
        };
        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.open("PUT", urlData.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });

      // Step 3: Send the public URL to our scoring API (no auth, no DB)
      const scoreRes = await fetch("/api/interview-scorer/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: urlData.publicUrl }),
      });
      const scoreData = await scoreRes.json();
      if (!scoreRes.ok) throw new Error(scoreData.error);

      setResult(scoreData.scoring);
      setRawJson(JSON.stringify(scoreData.scoring, null, 2));
      setStage("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
      setStage("upload");
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setRawJson("");
    setUploadProgress(0);
    setError("");
    setStage("upload");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
          🎯 Interview Scorer
          <span className="text-xs font-medium bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">v4</span>
        </h1>
        <span className="text-xs text-gray-400">
          No login required · No data stored
        </span>
      </nav>

      <div className="flex items-start justify-center p-4 pt-12">
        <div className="max-w-2xl w-full space-y-6">
          {/* ── Upload Stage ── */}
          {stage === "upload" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Upload Interview Video
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Drop a video and get instant AI scoring — no sign-up needed.
                </p>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                {file ? (
                  <div className="space-y-1">
                    <p className="text-indigo-700 font-medium text-sm">
                      ✅ {file.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-3xl">📹</p>
                    <p className="text-gray-600 text-sm font-medium">
                      Click to choose video
                    </p>
                    <p className="text-gray-400 text-xs">
                      MP4, MOV — max 50 MB · 2–3 minutes recommended
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleUpload}
                disabled={!file}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors text-sm"
              >
                Score this video
              </button>
            </div>
          )}

          {/* ── Processing Stage ── */}
          {stage === "processing" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center space-y-4">
              <div className="text-5xl animate-pulse">🤖</div>
              {uploadProgress < 100 ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">
                    Uploading your video…
                  </h2>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {uploadProgress}% — please don't close this tab
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">
                    Analysing the video…
                  </h2>
                  <div className="space-y-2 text-sm text-gray-500 pt-1">
                    <p>🎵 Extracting audio</p>
                    <p>📝 Transcribing speech</p>
                    <p>🧠 Scoring the answers</p>
                  </div>
                  <p className="text-gray-400 text-xs pt-1">
                    This takes up to 60 seconds. Please don't close this tab.
                  </p>
                  <div className="flex justify-center gap-1 pt-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Result Stage ── */}
          {stage === "result" && result && (
            <>
              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
                <div
                  className={`text-center p-6 rounded-xl ${
                    result.approved
                      ? "bg-green-50"
                      : result.needsHumanReview
                        ? "bg-yellow-50"
                        : "bg-red-50"
                  }`}
                >
                  <p className="text-4xl mb-2">
                    {result.approved
                      ? "🎉"
                      : result.needsHumanReview
                        ? "⏳"
                        : "😔"}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {result.approved
                      ? "Approved!"
                      : result.needsHumanReview
                        ? "Needs Human Review"
                        : "Not Approved"}
                  </h2>
                  <p className="text-3xl font-bold mt-2 text-gray-700">
                    Score: {result.score}/100
                  </p>
                </div>

                {/* Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Score Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.breakdown).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Feedback */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    AI Feedback
                  </p>
                  <p className="text-sm text-gray-600">{result.reason}</p>
                </div>

                {/* Transcript */}
                {result.transcript && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Transcript
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {result.transcript}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Score another video
                </button>
              </div>

              {/* Raw JSON Output */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Raw JSON Output
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(rawJson)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto max-h-[500px] overflow-y-auto">
                  {rawJson}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
