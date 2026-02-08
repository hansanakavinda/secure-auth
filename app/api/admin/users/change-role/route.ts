import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error('Change role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
