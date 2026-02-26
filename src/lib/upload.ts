/**
 * Client-side direct upload to Cloudinary.
 * Gets a signed upload URL from the server, then uploads directly from the browser.
 * This bypasses Vercel's 4.5MB serverless function body size limit.
 */
export async function uploadFiles(files: FileList | File[]): Promise<string[]> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return [];

  // 1. Get signature from our server
  const sigRes = await fetch("/api/admin/upload-signature", { method: "POST" });
  if (!sigRes.ok) throw new Error("Failed to get upload signature");
  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  // 2. Upload each file directly to Cloudinary
  const urls: string[] = [];
  for (const file of fileArray) {
    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      continue;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) continue;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const res = await fetch(uploadUrl, { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      urls.push(data.secure_url);
    }
  }

  return urls;
}
