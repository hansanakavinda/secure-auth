import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { moderatePostSchema } from '@/lib/validators/admin-posts'
import { moderatePost } from '@/data-access/posts'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  await requireAuth({ roles: ['ADMIN', 'SUPER_ADMIN'] })

  const { postId, action } = await validateRequest(request, moderatePostSchema)

  const result = await moderatePost({ postId, action })

  return NextResponse.json(result)
}, 'Moderation')
