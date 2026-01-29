import { z } from 'zod'

export const emailSchema = z
  .string()
  .email('Please enter a valid email')

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')

export const usernameSchema = z
  .string()
  .min(2, 'Username must be at least 2 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const profileSchema = z.object({
  username: usernameSchema.optional(),
})

export const passwordChangeSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
