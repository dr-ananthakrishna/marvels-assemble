/**
 * AI scoring via OpenRouter — model configurable via OPENROUTER_MODEL env var
 */


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

Watch the video and score the candidate using this rubric. Total score is out of 100.

── FIXED CRITERIA (always scored) ──────────────────────────────────────────
1. Communication (25 pts max)
   Clear, structured, articulate — can they hold attention?
   Scoring: detailed & excellent → 23–25 | good → 18–22 | adequate → 12–17 | poor → 0–11

2. Confidence (25 pts max)
   Eye contact, steady voice, no excessive hesitation.
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
  "reason": "Good communicator with clear leadership experience and extracurricular involvement. Academics, entrepreneurial mindset, and social media not mentioned. Score below 80 — flagged for human review.",
  "transcript": "Full verbatim transcript of everything the candidate said in the video."
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

export async function scoreOnboardingVideo(
  videoUrl: string
): Promise<ScoringResult> {
  if (process.env.MOCK_AI === "true") return mockResult();

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "video_url", video_url: { url: videoUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`OpenRouter error: ${JSON.stringify(data.error)}`);
  }
  if (!data.choices?.length) {
    throw new Error(`Unexpected OpenRouter response: ${JSON.stringify(data)}`);
  }

  const text = (data.choices[0].message.content as string).trim();
  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as ScoringResult;
}
