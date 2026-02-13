import { requireFreshAuth } from '@/lib/auth-checks'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { toggleStatusSchema } from '@/lib/validators/admin-users'
import { toggleUserStatus } from '@/data-access/users'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  // SECURITY: Uses fresh DB check — not cached JWT — for status toggles
  const { freshUser } = await requireFreshAuth({ roles: ['SUPER_ADMIN'] })

  const { userId, isActive } = await validateRequest(request, toggleStatusSchema)

  const result = await toggleUserStatus({ userId, isActive, currentUserId: freshUser.id })

  return NextResponse.json(result)
}, 'Toggle status')
