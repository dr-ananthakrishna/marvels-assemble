/**
 * Auto-approval verifiers for each activity type
 */

// ── Reel verifier via Apify ──────────────────────────────────────────────────
export interface ReelMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  author: string;
  isPrivate: boolean;
  verified: boolean;
  rejectionReason?: string;
}

export async function verifyReel(reelUrl: string, instagramId: string): Promise<ReelMetrics> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN not set");

  const { ApifyClient } = await import("apify-client");
  const client = new ApifyClient({ token });

  const run = await client.actor("bInft7nKPaSDnHDbm").call({
    postUrls: [reelUrl],
    includeFacebookMetrics: false,
    proxyConfiguration: { useApifyProxy: false },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const reel = items[0] as Record<string, unknown>;

  if (!reel) throw new Error("No reel data returned");

  const isPrivate = reel.status !== "available";
  const author = String(reel.author ?? "");
  const normalizedId = instagramId.replace(/^@/, "").toLowerCase();
  const authorMismatch = author.toLowerCase() !== normalizedId;

  const metrics: ReelMetrics = {
    views:    Number(reel.views ?? 0),
    likes:    Number(reel.likes ?? 0),
    comments: Number(reel.comments ?? 0),
    shares:   Number(reel.shares ?? 0),
    author,
    isPrivate,
    verified: true,
  };

  if (isPrivate) {
    metrics.rejectionReason = "Instagram account is private";
  } else if (authorMismatch) {
    metrics.rejectionReason = `Post author @${author} doesn't match your saved Instagram ID @${normalizedId}`;
  }

  return metrics;
}

export function scoreReel(metrics: ReelMetrics): boolean {
  return !metrics.rejectionReason;
}

// ── Quiz verifier via Google Sheets API ─────────────────────────────────────
export async function verifyQuizSheet(
  sheetUrl: string,
  moduleCode: string
): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_SHEETS_API_KEY not set");

  // Extract sheet ID from URL
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("Invalid Google Sheets URL");
  const sheetId = match[1];

  // Read first sheet range
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:Z?key=${apiKey}`
  );
  const data = await res.json();
  if (!data.values) throw new Error("Could not read sheet");

  // Check if module code appears anywhere in the sheet
  const found = data.values.flat().some(
    (cell: string) => String(cell).trim().toLowerCase() === moduleCode.trim().toLowerCase()
  );
  return found;
}

// ── Referral verifier — pure DB lookup ──────────────────────────────────────
// Called from the API route with DB access — see api/submissions/verify-referral
