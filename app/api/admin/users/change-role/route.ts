import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
  } catch (error) {
    console.error('Change role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
