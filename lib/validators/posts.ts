import { z } from 'zod'
export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'Title and content are required').max(200, 'Title must be 200 characters or less'),
  content: z.string().trim().min(1, 'Title and content are required').max(5000, 'Content must be 5000 characters or less'),
})
