<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Security Deny List

- Never read `.env`, `.env.local`, or any `.env.*` file.
- Never touch `secrets/`, service-role keys, Clerk secret keys, or similar credential files without explicit review.
- Treat `supabase/migrations/` and deployment config as sensitive change areas; do not edit them casually.
