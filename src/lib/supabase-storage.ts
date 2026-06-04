import { createClient } from "@supabase/supabase-js";

const BUCKET = "onboarding-videos";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key);
}

export async function createSignedUploadUrl(
  userId: string,
  ext: string
): Promise<{ signedUrl: string; path: string; publicUrl: string }> {
  const supabase = client();
  const path = `onboarding/${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) throw new Error(`Failed to create upload URL: ${error?.message}`);

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { signedUrl: data.signedUrl, path, publicUrl: pub.publicUrl };
}
