import type { Session } from 'next-auth'
import type { Role } from '@/types/auth'
import { auth } from '@/lib/auth'
import { ApiError } from '@/lib/api/api-utils'

interface RequireAuthOptions {
  roles?: Role[]
}

export async function requireAuth(options: RequireAuthOptions = {}): Promise<Session> {
  const { roles } = options
  const session = await auth()

  if (!session) {
    throw new ApiError('Unauthorized', 401)
  }

  if (roles?.length && !roles.includes(session.user.role)) {
    throw new ApiError('Forbidden', 403)
  }

  return session
}
