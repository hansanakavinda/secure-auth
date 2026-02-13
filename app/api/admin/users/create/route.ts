import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { createUser } from '@/data-access/users'
import { NextResponse } from 'next/server'
import { requireFreshAuth } from '@/lib/auth-checks'
import { createUserSchema } from '@/lib/validators/admin-users'

export const POST = asyncCatcher(async (request: Request) => {
  // SECURITY: Uses fresh DB check — not cached JWT — for user creation
  await requireFreshAuth({ roles: ['SUPER_ADMIN'] })

  const { name, email, password, role } = await validateRequest(request, createUserSchema)

  const result = await createUser({ name, email, password, role })
  
  return NextResponse.json(result)
}, 'Create user')
