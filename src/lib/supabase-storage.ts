import { createClient } from "@supabase/supabase-js";

const BUCKET = "onboarding-videos";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key);
}

export async function uploadOnboardingVideo(
  userId: string,
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const supabase = client();
  const ext = fileName.split(".").pop() || "mp4";
  const path = `onboarding/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
