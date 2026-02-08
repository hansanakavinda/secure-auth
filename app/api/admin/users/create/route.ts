import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { createUserSchema } from '@/lib/validators/admin-users'
import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }

  const { name, email, password, role } = await validateRequest(request, createUserSchema)

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
