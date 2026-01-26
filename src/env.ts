import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Detect if we're on the server
const isServer = typeof window === 'undefined'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    API_SERVER_URL: z.string().url().default('http://localhost:8000'),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },

  runtimeEnv: {
    // Server variables - only available in server context
    DATABASE_URL: isServer ? process.env.DATABASE_URL : undefined,
    API_SERVER_URL: isServer ? process.env.API_SERVER_URL : undefined,
    // Client variables - available everywhere
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },

  // Skip validation of server vars on client
  skipValidation: !isServer,
  emptyStringAsUndefined: true,
})
