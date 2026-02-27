import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(
  email: string,
  otp: string,
  type: "signup" | "forgot-password"
) {
  const isSignup = type === "signup";
  const subject = isSignup
    ? `Your UrbanNest verification code`
    : `Reset your UrbanNest password`;

  const digits = otp.split("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f2ee;">
    Your verification code is ${otp} — valid for 15 minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#111111 0%,#1a1a1a 100%);padding:36px 32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                      <span style="color:#ffffff;">Urban</span><span style="color:#66a80f;">Nest</span>
                    </h1>
                    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:3px;font-weight:500;">
                      Premium Shopping Experience
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Icon + Title -->
          <tr>
            <td style="padding:40px 32px 0;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 20px;background:${isSignup ? "linear-gradient(135deg,#e8f5d6 0%,#d4e8c2 100%)" : "linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)"};border-radius:16px;line-height:64px;font-size:28px;">
                ${isSignup ? "✉️" : "🔐"}
              </div>
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">
                ${isSignup ? "Verify Your Email" : "Reset Your Password"}
              </h2>
              <p style="margin:0;font-size:15px;color:#71717a;line-height:1.6;">
                ${isSignup
                  ? "Welcome to UrbanNest! Enter the code below to activate your account."
                  : "We received a request to reset your password. Enter the code below to proceed."
                }
              </p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td style="padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf8;border:2px solid #e8f5d6;border-radius:16px;">
                <tr>
                  <td style="padding:24px 16px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:3px;">
                      Verification Code
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        ${digits.map(d => `<td style="padding:0 4px;"><div style="width:44px;height:52px;background:#ffffff;border:2px solid #d4e8c2;border-radius:10px;line-height:52px;text-align:center;font-size:24px;font-weight:800;color:#111111;">${d}</div></td>`).join("")}
                      </tr>
                    </table>
                    <p style="margin:14px 0 0;font-size:12px;color:#a1a1aa;">
                      ⏱ Expires in <strong style="color:#71717a;">15 minutes</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefce8;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;font-size:16px;">🔒</td>
                        <td>
                          <p style="margin:0;font-size:13px;font-weight:600;color:#92400e;">Security Notice</p>
                          <p style="margin:4px 0 0;font-size:12px;color:#a16207;line-height:1.5;">
                            Never share this code with anyone. UrbanNest will never ask for your code via phone or message.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#e5e5e5,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;line-height:1.5;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:11px;color:#d4d4d8;">
                © ${new Date().getFullYear()} UrbanNest · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "UrbanNest <no-reply@mehedihasan.codes>",
    to: email,
    subject,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = "Welcome to UrbanNest — Account Activated! 🎉";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f2ee;">
    Your UrbanNest account is now active. Start exploring premium products today!
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#111111 0%,#1a1a1a 100%);padding:36px 32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                      <span style="color:#ffffff;">Urban</span><span style="color:#66a80f;">Nest</span>
                    </h1>
                    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:3px;font-weight:500;">
                      Premium Shopping Experience
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Success Icon + Title -->
          <tr>
            <td style="padding:40px 32px 0;text-align:center;">
              <div style="width:80px;height:80px;margin:0 auto 20px;background:linear-gradient(135deg,#d4edda 0%,#c3e6cb 100%);border-radius:50%;line-height:80px;font-size:36px;">
                ✅
              </div>
              <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111111;letter-spacing:-0.3px;">
                Account Activated!
              </h2>
              <p style="margin:0;font-size:15px;color:#71717a;line-height:1.6;">
                Congratulations <strong style="color:#111;">${name}</strong>, your email has been verified and your account is now fully active.
              </p>
            </td>
          </tr>

          <!-- What's Next Section -->
          <tr>
            <td style="padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf8;border:2px solid #e8f5d6;border-radius:16px;">
                <tr>
                  <td style="padding:24px 20px;">
                    <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#111;text-align:center;">
                      🚀 Here's what you can do now
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:top;padding-right:12px;font-size:18px;">🛍️</td>
                              <td>
                                <p style="margin:0;font-size:13px;font-weight:600;color:#333;">Browse Products</p>
                                <p style="margin:2px 0 0;font-size:12px;color:#888;">Discover our premium collection of products</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:top;padding-right:12px;font-size:18px;">❤️</td>
                              <td>
                                <p style="margin:0;font-size:13px;font-weight:600;color:#333;">Create Wishlists</p>
                                <p style="margin:2px 0 0;font-size:12px;color:#888;">Save your favorite items for later</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:top;padding-right:12px;font-size:18px;">📦</td>
                              <td>
                                <p style="margin:0;font-size:13px;font-weight:600;color:#333;">Place Orders</p>
                                <p style="margin:2px 0 0;font-size:12px;color:#888;">Shop with confidence and track your orders</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 32px 28px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#66a80f 0%,#5a9a0d 100%);border-radius:50px;text-align:center;">
                    <a href="${process.env.NEXTAUTH_URL || "https://urbannest.mehedihasan.codes"}" style="display:inline-block;padding:14px 40px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
                      Start Shopping →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thank You Note -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#15803d;line-height:1.6;">
                      💚 Thank you for joining <strong>UrbanNest</strong>. We're excited to have you!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#e5e5e5,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;line-height:1.5;">
                You're receiving this because you created an account on UrbanNest.
              </p>
              <p style="margin:0;font-size:11px;color:#d4d4d8;">
                © ${new Date().getFullYear()} UrbanNest · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "UrbanNest <no-reply@mehedihasan.codes>",
    to: email,
    subject,
    html,
  });

  if (error) {
    console.error("Resend welcome email error:", error);
    // Don't throw — welcome email failure shouldn't block verification
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
