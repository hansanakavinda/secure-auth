import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { changeRoleSchema } from '@/lib/validators/admin-users'
import { changeUserRole } from '@/data-access/users'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  await requireAuth({ roles: ['SUPER_ADMIN'] })

  const { userId, role } = await validateRequest(request, changeRoleSchema)

  const result = await changeUserRole({ userId, role })

  return NextResponse.json(result)
}, 'Change role')
