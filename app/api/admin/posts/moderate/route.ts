import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['ADMIN', 'SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }

  const { postId, action } = await request.json()

  if (!postId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (action === 'approve') {
    await prisma.post.update({
      where: { id: postId },
      data: { isApproved: true },
    })
  } else {
    await prisma.post.delete({
      where: { id: postId },
    })
  }

  return NextResponse.json({ success: true })
}, 'Moderation')
