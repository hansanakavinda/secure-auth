import { z } from 'zod'
const roleSchema = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN'])

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: roleSchema,
})

export const changeRoleSchema = z.object({
  userId: z.string().trim().min(1, 'Invalid request'),
  role: roleSchema,
})

export const toggleStatusSchema = z.object({
  userId: z.string().trim().min(1, 'Invalid request'),
  isActive: z.boolean(),
})
