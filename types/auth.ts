// Type definitions for Secure Auth V2

import { DefaultSession } from "next-auth"

// Extend Next-Auth types
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

// Utility types
export type Role = "SUPER_ADMIN" | "ADMIN" | "USER"
export type AuthProvider = "MANUAL" | "GOOGLE"

export interface RolePermissions {
  canCreatePost: boolean
  canModeratePost: boolean
  canManageUsers: boolean
  canAccessAdmin: boolean
}

// Helper function to check permissions
export function getRolePermissions(role: Role): RolePermissions {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        canCreatePost: true,
        canModeratePost: true,
        canManageUsers: true,
        canAccessAdmin: true,
      }
    case "ADMIN":
      return {
        canCreatePost: true,
        canModeratePost: true,
        canManageUsers: false,
        canAccessAdmin: true,
      }
    case "USER":
      return {
        canCreatePost: true,
        canModeratePost: false,
        canManageUsers: false,
        canAccessAdmin: false,
      }
  }
}
