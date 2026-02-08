import { z } from 'zod'
export const moderatePostSchema = z.object({
  postId: z.string().trim().min(1, 'Invalid request'),
  action: z.enum(['approve', 'reject']),
})
