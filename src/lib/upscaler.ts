import { supabaseAdmin } from "./supabaseClient";

/**
 * Basic helper to generate a hash string from url
 */
function getHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export async function getUpscaledAvatar(originalUrl: string): Promise<string> {
  if (!originalUrl) return originalUrl;

  const avatarHash = getHash(originalUrl);
  const bucketName = "avatars";
  const filePath = `upscaled/${avatarHash}.png`;

  // 1. Check if Supabase storage is active
  if (supabaseAdmin) {
    try {
      const { data } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (data && data.publicUrl) {
        // Quick HEAD request to check if file actually exists (getPublicUrl doesn't verify existence)
        const checkRes = await fetch(data.publicUrl, { method: "HEAD" });
        if (checkRes.ok) {
          console.log(`Storage Cache Hit: Served upscaled avatar for hash ${avatarHash}`);
          return data.publicUrl;
        }
      }
    } catch (e) {
      console.warn("Storage check failed, bypassing cache:", e);
    }
  }

  // 2. Try calling Real-ESRGAN AI service if configured
  const modalApiKey = process.env.MODAL_API_KEY;
  const runpodApiKey = process.env.RUNPOD_API_KEY;

  if ((modalApiKey || runpodApiKey) && supabaseAdmin) {
    try {
      // Simulate/Trigger AI upscaler microservice request
      // We set a 3-second timeout limit as specified in the blueprint
      console.log(`Triggering Real-ESRGAN upscaling for avatar: ${originalUrl}`);
      
      const upscaleEndpoint = process.env.AI_UPSCALER_ENDPOINT || "https://api.runpod.ai/v1/real-esrgan/run";
      
      const upscaleRes = await fetch(upscaleEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${runpodApiKey || modalApiKey}`,
        },
        body: JSON.stringify({ input: { image_url: originalUrl } }),
        signal: AbortSignal.timeout(3000), // 3 seconds timeout
      });

      if (upscaleRes.ok) {
        const result = await upscaleRes.json();
        const upscaledImageBase64 = result?.output?.image_base64; // base64 response

        if (upscaledImageBase64) {
          // Convert base64 to binary buffer
          const buffer = Buffer.from(upscaledImageBase64, "base64");

          // Upload to Supabase Storage for caching
          const { error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(filePath, buffer, {
              contentType: "image/png",
              cacheControl: "31536000",
              upsert: true,
            });

          if (!uploadError) {
            const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
            if (data?.publicUrl) return data.publicUrl;
          }
        }
      }
    } catch (err) {
      console.warn("AI upscaling failed or timed out. Bypassing to original image:", err);
    }
  }

  // 3. Fallback: Return original avatar URL
  return originalUrl;
}
