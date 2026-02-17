import { asyncCatcher } from '@/lib/api/api-utils'
import { getApprovedPostsPaginated } from '@/data-access/posts'
import { NextResponse } from 'next/server'

export const GET = asyncCatcher(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const take = parseInt(searchParams.get('take') ?? '4')
  const skip = parseInt(searchParams.get('skip') ?? '0')

  const posts = await getApprovedPostsPaginated({ take, skip })

  return NextResponse.json({ posts })
}, 'List posts')
