/**
 * Admin session token utilities
 * Uses HMAC-SHA256 signed tokens for admin_session cookie
 * Compatible with both Edge Runtime (middleware) and Node.js (server components)
 */

export async function createAdminToken(secret: string): Promise<string> {
  const payload = `v1:${Date.now()}:${crypto.randomUUID()}`;
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminToken(
  token: string,
  secret: string
): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const lastDotIndex = token.lastIndexOf(".");
  if (lastDotIndex === -1) return false;

  const payload = token.substring(0, lastDotIndex);
  const signature = token.substring(lastDotIndex + 1);

  if (!payload.startsWith("v1:")) return false;

  const expected = await hmacSign(payload, secret);
  return timingSafeEqual(signature, expected);
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
