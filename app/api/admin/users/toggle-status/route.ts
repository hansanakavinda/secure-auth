import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { toggleStatusSchema } from '@/lib/validators/admin-users'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }
  const { session } = authResult

  const { userId, isActive } = await validateRequest(request, toggleStatusSchema)

  // Prevent self-deactivation
  if (userId === session.user.id && !isActive) {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  })

  return NextResponse.json({ success: true })
}, 'Toggle status')
