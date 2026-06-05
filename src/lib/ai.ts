/**
 * AI scoring pipeline:
 *   1. Download video from Supabase public URL
 *   2. Extract audio → .mp3 via ffmpeg (child_process)
 *   3. Transcribe via OpenRouter → openai/gpt-4o-mini-transcribe
 *   4. Score via OpenRouter → openai/gpt-5.4-mini (transcript in prompt)
 */

import { spawn, execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";

export interface ScoringResult {
  approved: boolean;
  needsHumanReview: boolean;
  score: number; // 0–100
  breakdown: {
    communication: number;    // 0–25
    confidence: number;       // 0–25
    leadership: number;       // 0–10
    academics: number;        // 0–10
    extracurriculars: number; // 0–10
    loveForMarrow: number;    // 0–10
    entrepreneurial: number;  // 0–5
    socialMedia: number;      // 0–5
  };
  reason: string;
  transcript: string;
}

const SYSTEM_PROMPT = `You are screening applicants for the "Marvel Ambassador" programme run by Marrow (a medical education platform).

Read the transcript below and score the candidate using this rubric. Total score is out of 100.

── FIXED CRITERIA (always scored) ──────────────────────────────────────────
1. Communication (25 pts max)
   Clear, structured, articulate — can they hold attention?
   Scoring: detailed & excellent → 23–25 | good → 18–22 | adequate → 12–17 | poor → 0–11

2. Confidence (25 pts max)
   Assertive tone, steady delivery, no excessive hesitation.
   Scoring: detailed & excellent → 23–25 | good → 18–22 | adequate → 12–17 | poor → 0–11

── DESIRABLE SIGNALS (earned only — 0 if not mentioned) ────────────────────
These signals are only scored if the candidate explicitly mentions them.
If a signal is absent from the transcript, assign exactly 0. Do not infer or assume.

For each signal that IS mentioned:
  clearly mentioned with detail → 9–10 pts
  mentioned                    → 7–8 pts
  vaguely implied              → 5–6 pts
  not mentioned                → 0 pts (no score awarded)

3. Leadership (10 pts max) — class rep, club officer, team captain, event organiser
4. Academics (10 pts max) — topper, rank holder, gold medal, scholarship
5. Extracurriculars (10 pts max) — sports, arts, volunteering, cultural activities
6. Love for Marrow (10 pts max) — uses the app, names specific features, expresses genuine love
7. Entrepreneurial mindset (5 pts max) — startup interest, built something, self-starter attitude
8. Social media presence (5 pts max) — follower count, content creator, runs a community

── DECISION ─────────────────────────────────────────────────────────────────
Score > 30  → approved: true,  needsHumanReview: false
Score ≤ 30  → approved: false, needsHumanReview: true  (admin will review manually)

Respond ONLY as valid JSON with no markdown or explanation:
{
  "approved": false,
  "needsHumanReview": true,
  "score": 61,
  "breakdown": {
    "communication": 20,
    "confidence": 19,
    "leadership": 8,
    "academics": 0,
    "extracurriculars": 7,
    "loveForMarrow": 7,
    "entrepreneurial": 0,
    "socialMedia": 0
  },
  "reason": "Good communicator with clear leadership experience and extracurricular involvement. Academics, entrepreneurial mindset, and social media not mentioned. Score below 80 — flagged for human review."
}`;

function mockResult(): ScoringResult {
  const score = Math.floor(Math.random() * 61) + 30; // 30–90
  const approved = score > 30;
  const needsHumanReview = !approved;
  const comm = Math.round(score * 0.25);
  const conf = Math.round(score * 0.25);
  const rem = score - comm - conf;
  return {
    approved,
    needsHumanReview,
    score,
    breakdown: {
      communication: comm,
      confidence: conf,
      leadership: Math.round(rem * 0.286),
      academics: Math.round(rem * 0.286),
      extracurriculars: Math.round(rem * 0.143),
      loveForMarrow: Math.round(rem * 0.143),
      entrepreneurial: Math.round(rem * 0.071),
      socialMedia: rem - Math.round(rem * 0.929),
    },
    reason: approved
      ? `[MOCK] Strong application. Score ${score}/100 — auto-approved.`
      : `[MOCK] Score ${score}/100 — flagged for human review.`,
    transcript: "[MOCK] Transcript not available in mock mode.",
  };
}

/** Download a URL to a temp file, return the file path */
async function downloadToTmp(url: string, ext: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const tmpPath = path.join(os.tmpdir(), `${crypto.randomUUID()}.${ext}`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
}

/** Resolve the ffmpeg binary path — checks common Homebrew locations on macOS */
function ffmpegBin(): string {
  // Allow override via env var (useful for production/Docker)
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  // Try to find it on PATH first
  try {
    const found = execSync("which ffmpeg 2>/dev/null || command -v ffmpeg 2>/dev/null", { encoding: "utf8" }).trim();
    if (found) return found;
  } catch { /* ignore */ }
  // Homebrew Apple Silicon
  if (require("fs").existsSync("/opt/homebrew/bin/ffmpeg")) return "/opt/homebrew/bin/ffmpeg";
  // Homebrew Intel
  if (require("fs").existsSync("/usr/local/bin/ffmpeg")) return "/usr/local/bin/ffmpeg";
  // Last resort — let spawn fail with a clear error
  return "ffmpeg";
}

/** Run ffmpeg to extract audio from videoPath → mp3Path */
function extractAudio(videoPath: string, mp3Path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBin(), [
      "-y",           // overwrite output
      "-i", videoPath,
      "-vn",          // no video
      "-ar", "16000", // 16 kHz sample rate (sufficient for speech)
      "-ac", "1",     // mono
      "-b:a", "64k",  // 64 kbps bitrate
      mp3Path,
    ]);

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}:\n${stderr}`));
    });
    proc.on("error", (err) => reject(new Error(`ffmpeg spawn error: ${err.message}`)));
  });
}

/** Transcribe an mp3 file via OpenRouter → openai/gpt-4o-mini-transcribe */
async function transcribeAudio(mp3Path: string): Promise<string> {
  const audioBase64 = fs.readFileSync(mp3Path).toString("base64");

  const res = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-transcribe",
      input_audio: {
        data: audioBase64,
        format: "mp3",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter transcription ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`OpenRouter transcription error: ${JSON.stringify(data.error)}`);

  // Response shape: { text: "..." }
  const transcript = (data.text as string | undefined)?.trim() ?? "";
  if (!transcript) throw new Error("Transcription returned empty text");
  return transcript;
}

/** Score a transcript via OpenRouter → openai/gpt-5.4-mini */
async function scoreTranscript(transcript: string): Promise<Omit<ScoringResult, "transcript">> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.4-mini",
      stream: false,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `TRANSCRIPT:\n\n${transcript}` },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter scoring ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`OpenRouter scoring error: ${JSON.stringify(data.error)}`);
  if (!data.choices?.length) throw new Error(`Unexpected OpenRouter response: ${JSON.stringify(data)}`);

  const text = (data.choices[0].message.content as string).trim();
  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as Omit<ScoringResult, "transcript">;
}

export async function scoreOnboardingVideo(videoUrl: string): Promise<ScoringResult> {
  if (process.env.MOCK_AI === "true") return mockResult();

  // Derive extension from URL (default mp4)
  const urlExt = videoUrl.split("?")[0].split(".").pop()?.toLowerCase() || "mp4";
  const videoPath = path.join(os.tmpdir(), `${crypto.randomUUID()}.${urlExt}`);
  const mp3Path = videoPath.replace(/\.[^.]+$/, ".mp3");

  try {
    // Step 1: Download video from Supabase
    const videoBuffer = await fetch(videoUrl).then(async (r) => {
      if (!r.ok) throw new Error(`Failed to download video: ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    });
    fs.writeFileSync(videoPath, videoBuffer);

    // Step 2: Extract audio → .mp3
    await extractAudio(videoPath, mp3Path);

    // Step 3: Transcribe audio
    const transcript = await transcribeAudio(mp3Path);

    // Step 4: Score transcript
    const scoring = await scoreTranscript(transcript);

    return { ...scoring, transcript };
  } finally {
    // Clean up temp files
    for (const p of [videoPath, mp3Path]) {
      try { fs.unlinkSync(p); } catch { /* ignore */ }
    }
  }
}
