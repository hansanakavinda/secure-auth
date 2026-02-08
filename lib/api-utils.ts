import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'

export type RouteHandler = (request: Request) => Promise<Response>

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Invalid request') {
    super(message, 400)
  }
}

export async function validateRequest<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const payload = await request.json()
  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? 'Invalid request')
  }
  return result.data
}

export function asyncCatcher(handler: RouteHandler, label = 'Request'): RouteHandler {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status })
      }

      console.error(`${label} error:`, error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
