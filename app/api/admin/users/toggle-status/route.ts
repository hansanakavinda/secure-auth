import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { toggleStatusSchema } from '@/lib/validators/admin-users'
import { toggleUserStatus } from '@/data-access/users'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const session = await requireAuth({ roles: ['SUPER_ADMIN'] })

  const { userId, isActive } = await validateRequest(request, toggleStatusSchema)

  const result = await toggleUserStatus({ userId, isActive, currentUserId: session.user.id })

  return NextResponse.json(result)
}, 'Toggle status')
