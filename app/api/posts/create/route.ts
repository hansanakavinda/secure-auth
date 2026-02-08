import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { createPostSchema } from '@/lib/validators/posts'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ status: 401 })
  if ('response' in authResult) {
    return authResult.response
  }
  const { session } = authResult

  const { title, content } = await validateRequest(request, createPostSchema)

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorId: session.user.id,
      isApproved: false, // Requires moderation
    },
  })

  return NextResponse.json({ success: true, post })
}, 'Create post')
