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
  if (!sigRes.ok) {
    const errText = await sigRes.text().catch(() => "Unknown error");
    console.error("Signature request failed:", sigRes.status, errText);
    throw new Error(`Signature failed (${sigRes.status})`);
  }

  const sigData = await sigRes.json();
  const { signature, timestamp, folder, cloudName, apiKey } = sigData;

  if (!cloudName || !apiKey || !signature) {
    console.error("Missing signature data:", sigData);
    throw new Error("Invalid signature response");
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  // 2. Upload each file directly to Cloudinary
  const urls: string[] = [];
  for (const file of fileArray) {
    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      console.warn("Skipping unsupported file type:", file.type);
      continue;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      console.warn("Skipping oversized file:", file.name, file.size);
      continue;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    try {
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          urls.push(data.secure_url);
        }
      } else {
        const errBody = await res.json().catch(() => ({}));
        console.error("Cloudinary upload failed:", res.status, errBody);
        throw new Error(errBody?.error?.message || `Upload failed (${res.status})`);
      }
    } catch (err) {
      console.error("Upload error for file:", file.name, err);
      throw err;
    }
  }

  return urls;
}
