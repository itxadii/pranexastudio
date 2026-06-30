import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || ""
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({
            where: { email }
          });
          
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        let localUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        if (!localUser) {
          localUser = await prisma.user.create({
            data: {
              name: user.name || "Google User",
              email: user.email,
              password: "",
              role: "CUSTOMER",
              status: "ACTIVE",
              timezone: "UTC",
              country: "India"
            }
          });
        }
        user.id = localUser.id;
        (user as any).role = localUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      
      if (token.email) {
        let localUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (!localUser) {
          // Re-create user record dynamically if missing in the database (e.g. after db resets)
          localUser = await prisma.user.create({
            data: {
              name: token.name || "Google User",
              email: token.email,
              password: "",
              role: "CUSTOMER",
              status: "ACTIVE",
              timezone: "UTC",
              country: "India"
            }
          });
        }
        token.id = localUser.id;
        token.role = localUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
