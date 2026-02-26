import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(
  email: string,
  otp: string,
  type: "signup" | "forgot-password"
) {
  const isSignup = type === "signup";
  const subject = isSignup
    ? `UrbanNest — Your verification code: ${otp}`
    : `UrbanNest — Password reset code: ${otp}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8f6f3;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8;">
    <div style="background:#111;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">
        Urban<span style="color:#66a80f;">Nest</span>
      </h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 8px;font-size:20px;color:#111;">
        ${isSignup ? "Email Verification" : "Password Reset"}
      </h2>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
        ${isSignup
          ? "Use the code below to activate your UrbanNest account."
          : "Use the code below to reset your password."
        }
      </p>
      <div style="background:#f0fbe4;border:2px dashed #66a80f;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
        <p style="margin:0;font-size:36px;font-weight:800;color:#111;letter-spacing:8px;">${otp}</p>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#999;">
        ⏰ This code will expire in <strong>15 minutes</strong>.
      </p>
      <p style="margin:0;font-size:13px;color:#999;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
    <div style="background:#f8f6f3;padding:16px 24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#aaa;">
        © ${new Date().getFullYear()} UrbanNest. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "UrbanNest <onboarding@resend.dev>",
    to: email,
    subject,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send email");
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
