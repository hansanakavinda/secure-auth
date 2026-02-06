import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "SUPER_ADMIN" | "ADMIN" | "USER"
      isActive: boolean
      authProvider: "MANUAL" | "GOOGLE"
    } & DefaultSession["user"]
  }

  interface User {
    role: "SUPER_ADMIN" | "ADMIN" | "USER"
    isActive: boolean
    authProvider: "MANUAL" | "GOOGLE"
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
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
          throw new Error("Email and password required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated. Contact administrator.")
        }

        if (user.authProvider !== "MANUAL") {
          throw new Error(`This account uses ${user.authProvider} login. Please use that method.`)
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
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
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        // Prevent account hijacking: if email exists with different provider, deny
        if (existingUser && existingUser.authProvider !== "GOOGLE") {
          return false // Deny sign-in
        }

        // Update or create user
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
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
        token.authProvider = user.authProvider
      }

      // Refresh session data on update
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
      }

      // Verify user still exists and is active
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isActive: true, role: true },
        })

        if (!dbUser || !dbUser.isActive) {
          return {} // Force logout
        }

        token.role = dbUser.role
        token.isActive = dbUser.isActive
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "USER"
        session.user.isActive = token.isActive as boolean
        session.user.authProvider = token.authProvider as "MANUAL" | "GOOGLE"
      }

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
