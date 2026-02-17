import { requireAuth } from '@/lib/api-auth'
import { asyncCatcher, validateRequest } from '@/lib/api-utils'
import { createPostSchema } from '@/lib/validators/posts'
import { createPost } from '@/data-access/posts'
import { NextResponse } from 'next/server'

export const POST = asyncCatcher(async (request: Request) => {
  const session = await requireAuth()

  if (!session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { title, content } = await validateRequest(request, createPostSchema)

  const result = await createPost({ title, content, authorId: session.user.id })

  return NextResponse.json(result)
}, 'Create post')
