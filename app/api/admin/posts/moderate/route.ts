import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { moderatePostSchema } from '@/lib/validators/admin-posts'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ roles: ['ADMIN', 'SUPER_ADMIN'] })
  if ('response' in authResult) {
    return authResult.response
  }

  const { postId, action } = await validateRequest(request, moderatePostSchema)

  if (action === 'approve') {
    await prisma.post.update({
      where: { id: postId },
      data: { isApproved: true },
    })
  } else {
    await prisma.post.delete({
      where: { id: postId },
    })
  }

  return NextResponse.json({ success: true })
}, 'Moderation')
