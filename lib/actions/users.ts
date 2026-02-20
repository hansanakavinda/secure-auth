'use server'

import { createUser } from '@/data-access/users'
import { ApiError } from '@/lib/api/api-utils'
import type { Role } from '@/types/auth'
import { requireFreshAuth } from '../api/auth-checks'

export async function createUserAction(formData: FormData) {
  try {

    await requireFreshAuth({ roles: ['SUPER_ADMIN'] })

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as Role

    // Validate inputs
    if (!name || !email || !password || !role) {
      return { success: false, error: 'All fields are required' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    if (password.length > 128) {
      return { success: false, error: 'Password must be at most 128 characters' }
    }

    // Use existing data-access function
    const result = await createUser({ name, email, password, role })
    return { success: true, data: result }
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
