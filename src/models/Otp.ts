import mongoose, { Schema, type Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: "signup" | "forgot-password";
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  resendCount: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["signup", "forgot-password"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ email: 1, type: 1 });

export const Otp =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
