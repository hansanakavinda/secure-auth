import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { changeRoleSchema } from '@/lib/validators/admin-users'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }

  const { userId, role } = await validateRequest(request, changeRoleSchema)

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return NextResponse.json({ success: true })
}, 'Change role')
