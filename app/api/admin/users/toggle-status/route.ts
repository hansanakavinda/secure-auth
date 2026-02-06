import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

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
  } catch (error) {
    console.error('Toggle status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
