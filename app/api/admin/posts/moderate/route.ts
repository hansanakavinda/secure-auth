import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error('Moderation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
