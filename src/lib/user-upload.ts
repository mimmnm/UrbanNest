/**
 * Client-side direct upload to Cloudinary for user avatars.
 * Uses /api/user/upload-signature (authenticated via NextAuth session).
 */
export async function uploadUserAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be under 5MB");
  }

  const sigRes = await fetch("/api/user/upload-signature", { method: "POST" });
  if (!sigRes.ok) {
    let errMsg = `Upload signature failed (${sigRes.status})`;
    try {
      const errData = await sigRes.json();
      if (errData.error) errMsg = errData.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();
  if (!cloudName || !apiKey || !signature) {
    throw new Error("Invalid signature response");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  if (!data.secure_url) throw new Error("No URL returned from upload");
  return data.secure_url;
}
