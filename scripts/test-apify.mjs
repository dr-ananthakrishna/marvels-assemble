import { ApifyClient } from "apify-client";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of env.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?([^"'\n]*)["']?$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const token = process.env.APIFY_API_TOKEN;
if (!token || token === "your-apify-token") {
  console.error("❌ Set APIFY_API_TOKEN in .env.local first");
  process.exit(1);
}

const client = new ApifyClient({ token });

const input = {
  postUrls: [
    "https://www.instagram.com/reel/DR5fmMgEjWs/",
    "https://www.instagram.com/p/DP1ewP1EbyD/",
  ],
  includeFacebookMetrics: false,
  proxyConfiguration: { useApifyProxy: false },
};

console.log("🚀 Running Apify actor bInft7nKPaSDnHDbm ...\n");

const run = await client.actor("bInft7nKPaSDnHDbm").call(input);
const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`✅ Got ${items.length} result(s)\n`);

items.forEach((item, i) => {
  console.log(`\n──── Post ${i + 1} ────`);
  console.dir(item, { depth: null });

  // Highlight the fields we care about
  console.log("\n📊 Key fields:");
  console.log("  url:           ", item.url ?? item.shortCode ?? "N/A");
  console.log("  isPrivate:     ", item.isPrivate ?? item.ownerIsPrivate ?? item.isAccountPrivate ?? "not in response");
  console.log("  videoViewCount:", item.videoViewCount ?? item.playCount ?? item.videoPlayCount ?? "N/A");
  console.log("  likesCount:    ", item.likesCount ?? item.likes ?? "N/A");
  console.log("  commentsCount: ", item.commentsCount ?? item.comments ?? "N/A");
  console.log("  type:          ", item.type ?? item.productType ?? "N/A");
});
