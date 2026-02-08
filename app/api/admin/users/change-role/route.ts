import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }

  const { userId, role } = await request.json()

  if (!userId || !['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return NextResponse.json({ success: true })
}, 'Change role')
