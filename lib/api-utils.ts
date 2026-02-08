import { NextResponse } from 'next/server'

type RouteHandler = (request: Request) => Promise<Response>

export function asyncCatcher(handler: RouteHandler, label = 'Request'): RouteHandler {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      console.error(`${label} error:`, error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
