import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
