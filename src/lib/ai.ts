/**
 * AI scoring via OpenRouter — model configurable via OPENROUTER_MODEL env var
 */

import { OpenRouter } from "@openrouter/sdk";

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

── DESIRABLE SIGNALS (additive — not mentioning one does NOT penalise) ─────
For each signal: clearly mentioned with detail → 9–10 pts | mentioned → 7–8 | vaguely implied → 5–6 | not mentioned → 5 (neutral)

3. Leadership (10 pts max) — class rep, club officer, team captain, event organiser
4. Academics (10 pts max) — topper, rank holder, gold medal, scholarship
5. Extracurriculars (10 pts max) — sports, arts, volunteering, cultural activities
6. Love for Marrow (10 pts max) — uses the app, names specific features, expresses genuine love
7. Entrepreneurial mindset (5 pts max) — startup interest, built something, self-starter attitude
8. Social media presence (5 pts max) — follower count, content creator, runs a community

── DECISION ─────────────────────────────────────────────────────────────────
Score > 80  → approved: true,  needsHumanReview: false
Score ≤ 80  → approved: false, needsHumanReview: true  (admin will review manually)

Respond ONLY as valid JSON with no markdown or explanation:
{
  "approved": false,
  "needsHumanReview": true,
  "score": 74,
  "breakdown": {
    "communication": 20,
    "confidence": 19,
    "leadership": 8,
    "academics": 5,
    "extracurriculars": 7,
    "loveForMarrow": 8,
    "entrepreneurial": 5,
    "socialMedia": 5
  },
  "reason": "Good communicator with clear leadership experience. Marrow usage mentioned but could be more specific. Score below 80 — flagged for human review.",
  "transcript": "Full verbatim transcript of everything the candidate said in the video."
}`;

function mockResult(): ScoringResult {
  const score = Math.floor(Math.random() * 61) + 30; // 30–90
  const approved = score > 80;
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

  const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const result = await client.chat.send({
    chatRequest: {
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "video_url", videoUrl: { url: videoUrl } },
          ],
        },
      ],
      stream: false,
    },
    httpReferer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  const text = (result as { choices: Array<{ message: { content: string } }> })
    .choices[0].message.content.trim();

  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as ScoringResult;
}
