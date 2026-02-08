import { prisma } from '@/lib/prisma'
import { isValidEmail } from '@/lib/utils'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher } from '@/lib/api-utils'
import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

const MIN_PASSWORD_LENGTH = 8

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }

  const { name, email, password, role } = await request.json()

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 })
  }

  if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
  }

  const hashedPassword = await hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      authProvider: 'MANUAL',
      isActive: true,
    },
    select: { id: true },
  })

  return NextResponse.json({ success: true, userId: user.id })
}, 'Create user')
