import NextAuth, { DefaultSession, NextAuthConfig, CredentialsSignin } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

class DeactivatedAccountError extends CredentialsSignin {
  code = "AccountDeactivated"
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false, // Prevent account hijacking
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER" as const,
          authProvider: "GOOGLE" as const,
          isActive: true,
          emailVerified: new Date(),
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.password) {
            return null
          }

          if (!user.isActive) {
            throw new DeactivatedAccountError()
          }

          if (user.authProvider !== "MANUAL") {
            return null
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isActive: user.isActive,
            authProvider: user.authProvider,
            emailVerified: user.emailVerified,
          }
        }
        catch (err) {
          return null
        }

      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("OAuth sign-in denied: no email provided by provider")
          return false
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        // SECURITY: Strictly block OAuth if a MANUAL account exists with this email.
        // This prevents OAuth account hijacking where an attacker could claim
        // an existing manual account by signing in with a matching OAuth email.
        if (existingUser && existingUser.authProvider === "MANUAL") {
          console.warn(
            `OAuth sign-in BLOCKED: email ${user.email} is registered as a MANUAL account. ` +
            `OAuth provider cannot claim this account.`
          )
          return false
        }

        // SECURITY: Block sign-in if the existing OAuth account has been deactivated
        if (existingUser && !existingUser.isActive) {
          console.warn(
            `OAuth sign-in BLOCKED: account ${user.email} has been deactivated.`
          )
          return false
        }

        // Update existing OAuth user profile data
        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
          })
        }
      }

      return true
    },
    async jwt({ token, user, trigger }) {

      const now = Date.now()

      // Spread DB verification requests across a window to avoid thundering herd
      const baseInterval = 5 * 60 * 1000; // 5 minutes
      const jitter = Math.random() * 60 * 1000; // Up to 60 seconds of random jitter
      const VERIFICATION_INTERVAL = baseInterval + jitter;

      // Initial sign in — populate token from the authenticated user object
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
        token.authProvider = user.authProvider
        token.lastVerified = now
      }

      // SECURITY FIX: On session update trigger, NEVER trust client-supplied data.
      // Instead, force an immediate DB re-fetch to get the real role and status.
      // The old code did `return { ...token, ...session.user }` which allowed
      // a malicious client to escalate their role via the update() call.
      if (trigger === "update") {
        token.lastVerified = 0; // Force DB verification on the next check below
      }

      // Periodic Verification: Only query the DB if the interval has passed
      const shouldVerify = !token.lastVerified || (now - (token.lastVerified as number)) > VERIFICATION_INTERVAL;

      if (token.id && shouldVerify) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true, authProvider: true },
          });

          if (!dbUser || !dbUser.isActive) {
            // Force logout if user is deleted or deactivated
            return {};
          }

          // Update token ONLY with DB-sourced data — never client data
          token.role = dbUser.role;
          token.isActive = dbUser.isActive;
          token.authProvider = dbUser.authProvider;
          token.lastVerified = now;
        } catch (error) {
          // If DB is down, fall back to existing token data to keep app running.
          // This is acceptable since the token was originally DB-sourced.
          console.error("Periodic verification failed, using cached token data", error);
        }
      }

      return token
    },
    async session({ session, token }) {
      if (!token || !session.user) {
        return session
      }

      session.user.id = token.id as string
      session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "USER"
      session.user.isActive = token.isActive as boolean
      session.user.authProvider = token.authProvider as "MANUAL" | "GOOGLE"

      return session
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`✅ User signed in: ${user.email}`)
      // You can log to database here for audit trail
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
