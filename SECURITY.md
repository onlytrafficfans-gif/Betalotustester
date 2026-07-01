# Security Guidelines

## Environment Variables

**REQUIRED - Must be set in production:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional:**
- `VITE_GROQ_API_KEY` - Groq API key (recommended provider)
- `VITE_OPENAI_API_KEY` - OpenAI API key
- `VITE_GITHUB_TOKEN` - GitHub personal access token (for exports)

⚠️ **Never commit `.env` files to version control. Use `.env.example` for template.**

## API Key Handling

### Current Architecture (DEMO MODE)
- Demo mode uses mock responses, no API key needed
- When using real providers, keys are validated server-side via Supabase Edge Functions
- Backend proxy routes all AI requests to prevent client-side key exposure

### Production Recommendations
1. Use Supabase Edge Functions as proxy for all AI API calls
2. Store long-lived API keys in Supabase with RLS protection
3. Implement key rotation policies
4. Monitor and audit key usage

## Database Security

### Row Level Security (RLS)
All tables use RLS policies to ensure users can only access their own data:
- `user_profiles` - filtered by `auth.uid()`
- `projects` - filtered by `user_id` column
- `user_files` - filtered by `user_id` column

### Data Protection
- API keys are encrypted at rest in Supabase Vault
- Session tokens use Supabase Auth (auto-managed)
- All user data is scoped to authenticated user

## Supabase Configuration

Create a `.env` file with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The application **will fail to start** if these variables are not set.

## Third-Party Integrations

### GitHub Integration
- Uses GitHub OAuth for authentication
- Personal Access Tokens are stored encrypted
- Limited scope: `repo, gist` only
- Tokens can be revoked per user at any time

### AI Providers
- Requests go through Supabase Edge Function proxy
- Direct provider endpoints are never exposed to client
- Rate limiting enforced at edge function level

## Reporting Security Issues

⚠️ **Do not open public issues for security vulnerabilities.**

If you discover a security vulnerability, please email the maintainers with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Headers

The following headers are configured in `vercel.json`:

- `Strict-Transport-Security` - Enforces HTTPS
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `Content-Security-Policy` - Restricts resource loading

## Dependencies

Security is maintained through:
- Regular `npm audit` checks
- Automated dependency updates
- No hardcoded secrets in source code
- No sensitive data in logs

