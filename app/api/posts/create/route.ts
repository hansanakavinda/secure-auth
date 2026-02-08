import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const authResult = await requireAuth({ status: 401 })
  if ('response' in authResult) {
    return authResult.response
  }
  const { session } = authResult

  const { title, content } = await request.json()

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  if (title.length > 200) {
    return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: 'Content must be 5000 characters or less' }, { status: 400 })
  }

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
