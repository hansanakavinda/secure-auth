// Type definitions for Secure Auth V2

import { DefaultSession } from "next-auth"

// Extend Next-Auth types
declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"]
  }

  interface User {
    role: Role
    isActive: boolean
    authProvider: AuthProvider
  }
}

// Utility types
export type Role = "SUPER_ADMIN" | "ADMIN" | "USER"
export type AuthProvider = "MANUAL" | "GOOGLE"

export interface RolePermissions {
  canCreatePost: boolean
  canModeratePost: boolean
  canManageUsers: boolean
  canAccessAdmin: boolean
}

