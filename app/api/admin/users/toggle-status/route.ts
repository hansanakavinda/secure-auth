import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }
  const { session } = authResult

  const { userId, isActive } = await request.json()

  if (!userId || typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

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
