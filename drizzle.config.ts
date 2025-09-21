import type { Config } from 'drizzle-kit';

export default {
  schema: ['./lib/db/schema.ts', './lib/db/schema-ir.ts', './lib/db/schema-tags.ts'],
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config;
