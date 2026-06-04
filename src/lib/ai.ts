/**
 * AI scoring via OpenRouter — model configurable via OPENROUTER_MODEL env var
 */

import { OpenRouter } from "@openrouter/sdk";

export interface ScoringResult {
  approved: boolean;
  score: number; // 0–100
  breakdown: {
    energy: number;        // 0–25
    campusReach: number;   // 0–25
    motivation: number;    // 0–25
    communication: number; // 0–25
  };
  reason: string;
}

const SYSTEM_PROMPT = `You are screening college ambassador applicants called "Marvels" for a student platform.
Watch the uploaded video and score the applicant on these 4 criteria (each 0–25):

1. Energy & personality on camera — Are they confident, engaging, enthusiastic?
2. Campus reach potential — Do they mention specific groups, networks, or strategies?
3. Motivation for the Marvel role — Is their reason genuine and specific?
4. Communication clarity — Are they clear, articulate, easy to follow?

Total is out of 100. Approve if total >= 60.

Respond ONLY as valid JSON with no markdown or explanation:
{
  "approved": true,
  "score": 72,
  "breakdown": { "energy": 20, "campusReach": 18, "motivation": 19, "communication": 15 },
  "reason": "Strong campus network mentioned, good energy. Motivation could be more specific."
}`;

function mockResult(): ScoringResult {
  const score = Math.floor(Math.random() * 61) + 30; // 30–90
  const approved = score >= 60;
  const q = Math.floor(score / 4);
  return {
    approved,
    score,
    breakdown: { energy: q, campusReach: q, motivation: q, communication: score - q * 3 },
    reason: approved
      ? `[MOCK] Strong application. Score ${score}/100 — approved.`
      : `[MOCK] Below threshold. Score ${score}/100 — needs improvement.`,
  };
}

export async function scoreOnboardingVideo(
  videoBuffer: Buffer,
  mimeType: string
): Promise<ScoringResult> {
  if (process.env.MOCK_AI === "true") return mockResult();

  const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  const base64 = `data:${mimeType};base64,${videoBuffer.toString("base64")}`;

  const result = await client.chat.send({
    chatRequest: {
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "video_url", videoUrl: { url: base64 } },
          ],
        },
      ],
      stream: false,
    },
    httpReferer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  const text = (result as { choices: Array<{ message: { content: string } }> })
    .choices[0].message.content.trim();

  // Strip markdown code fences if model wraps the JSON
  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as ScoringResult;
}
