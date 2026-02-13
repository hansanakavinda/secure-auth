import type { Session } from 'next-auth'
import type { Role } from '@/types/auth'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-utils'

/**
 * SECURITY: Freshness Check for High-Risk Operations
 * 
 * This utility bypasses the JWT cache entirely and queries the database
 * directly to verify the user's current role and active status.
 * 
 * Use this instead of `requireAuth` for any operation that modifies
 * user privileges, moderates content, or performs admin actions.
 * 
 * This eliminates the ~5-minute stale JWT window where a deactivated
 * or demoted user could still perform privileged actions.
 */

interface FreshAuthResult {
  session: Session
  freshUser: {
    id: string
    role: Role
    isActive: boolean
    email: string
    authProvider: 'MANUAL' | 'GOOGLE'
  }
}

interface RequireFreshAuthOptions {
  roles?: Role[]
}

/**
 * Performs a fresh database check to verify the user's current status.
 * Always queries the DB — never relies on JWT cache.
 * 
 * @throws ApiError 401 if no session exists
 * @throws ApiError 403 if user is deactivated or lacks required role
 */
export async function requireFreshAuth(
  options: RequireFreshAuthOptions = {}
): Promise<FreshAuthResult> {
  const { roles } = options
  const session = await auth()

  if (!session?.user?.id) {
    throw new ApiError('Unauthorized', 401)
  }

  // SECURITY: Always query DB directly — bypass JWT cache
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      isActive: true,
      email: true,
      authProvider: true,
    },
  })

  if (!dbUser) {
    throw new ApiError('User not found', 401)
  }

  if (!dbUser.isActive) {
    throw new ApiError('Account has been deactivated', 403)
  }

  if (roles?.length && !roles.includes(dbUser.role)) {
    throw new ApiError(`unauthorized`,403)
  }

  return {
    session,
    freshUser: {
      id: dbUser.id,
      role: dbUser.role as Role,
      isActive: dbUser.isActive,
      email: dbUser.email,
      authProvider: dbUser.authProvider as 'MANUAL' | 'GOOGLE',
    },
  }
}

/**
 * Higher-order function that wraps an async handler with a fresh
 * database role/status check. Use this to protect Server Actions
 * or route handlers that require real-time authorization.
 * 
 * @example
 * ```ts
 * const moderatePost = withFreshnessCheck(
 *   { roles: ['ADMIN', 'SUPER_ADMIN'] },
 *   async (freshUser, postId: string, action: string) => {
 *     // freshUser is verified from DB, not JWT cache
 *     return await moderate({ postId, action })
 *   }
 * )
 * ```
 */
export function withFreshnessCheck<TArgs extends unknown[], TResult>(
  options: RequireFreshAuthOptions,
  handler: (freshUser: FreshAuthResult['freshUser'], ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const { freshUser } = await requireFreshAuth(options)
    return handler(freshUser, ...args)
  }
}
