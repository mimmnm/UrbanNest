import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier as string;
        const password = credentials?.password as string;

        if (!identifier || !password) {
          throw new Error("Credentials are required");
        }

        await connectDB();

        // Find by email OR username
        const isEmail = identifier.includes("@");
        const user = isEmail
          ? await User.findOne({ email: identifier.toLowerCase() })
          : await User.findOne({ username: identifier.toLowerCase() });

        if (!user) {
          throw new Error("No account found");
        }

        // Check if account is verified
        if (!user.isVerified) {
          throw new Error("UNVERIFIED:" + user.email);
        }

        // Check if account is locked (brute force protection)
        if (user.lockUntil && user.lockUntil > new Date()) {
          const mins = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Account locked. Try again in ${mins} minute(s)`);
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          // Increment failed attempts
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          // Lock after 5 failed attempts for 15 minutes
          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            user.loginAttempts = 0;
          }
          await user.save();
          throw new Error("Invalid password");
        }

        // Reset login attempts on success
        if (user.loginAttempts > 0) {
          user.loginAttempts = 0;
          user.lockUntil = undefined;
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar || null,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For OAuth providers, upsert user in MongoDB
      if (account?.provider === "google" || account?.provider === "facebook") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "",
            avatar: user.image || "",
            isVerified: true,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" || account?.provider === "facebook") {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          token.id = dbUser?._id?.toString() || user.id;
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
  },
});
