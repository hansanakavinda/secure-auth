import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { createUser } from '@/data-access/users'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { createUserSchema } from '@/lib/validators/admin-users'

export const POST = asyncCatcher(async (request: Request) => {
  await requireAuth({ roles: ['SUPER_ADMIN'] })

  const { name, email, password, role } = await validateRequest(request, createUserSchema)

  const result = await createUser({ name, email, password, role })
  
  return NextResponse.json(result)
}, 'Create user')
