import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import type { Role } from '@/types/auth'
import { auth } from '@/lib/auth'

interface RequireAuthOptions {
  roles?: Role[]
  status?: number
}

type RequireAuthResult =
  | { session: Session }
  | { response: NextResponse }

export async function requireAuth(options: RequireAuthOptions = {}): Promise<RequireAuthResult> {
  const { roles, status = 403 } = options
  const session = await auth()

  if (!session) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status }) }
  }

  if (roles?.length && !roles.includes(session.user.role)) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status }) }
  }

  return { session }
}
