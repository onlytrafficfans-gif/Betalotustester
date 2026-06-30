# Security & Quality Fixes Checklist

## CRITICAL FIXES (In Progress)

### 1. API Key Security
- [ ] Wire sendMessage through backend proxy (remove direct fetch)
- [ ] Remove plaintext key storage from localStorage
- [ ] Encrypt keys at rest in Supabase
- [ ] Audit trail for key access

### 2. Custom Provider Validation
- [ ] Add baseUrl allowlist for custom providers
- [ ] Validate URLs before storing
- [ ] Prevent SSRF attacks via custom endpoints

### 3. Supabase Configuration
- [ ] Remove hardcoded fallback credentials
- [ ] Fail fast if env vars missing
- [ ] Add RLS policies to all tables
- [ ] Add explicit user_id filters to queries

### 4. Export Security
- [ ] HTML escape schema field interpolations
- [ ] Prevent stored XSS in exported apps
- [ ] Sanitize all user-controlled content

## HIGH PRIORITY FIXES

### 5. Test Coverage
- [ ] Add AuthScreen component tests
- [ ] Add SettingsPanel component tests
- [ ] Add ChatPanel component tests
- [ ] Reach 80% component coverage

### 6. Code Refactoring
- [ ] Split appRenderer.tsx (1356 lines)
- [ ] Split exportGenerator.ts (1029 lines)
- [ ] Extract carousel, tabs, task-list renderers
- [ ] Extract HTML/CSS generation logic

## MEDIUM PRIORITY FIXES

### 7. State Management
- [ ] Remove duplicate state fields
- [ ] Replace any types with proper schemas
- [ ] Fix index-as-key warnings in lists
- [ ] Improve Zustand store consistency

### 8. Security Headers
- [ ] Add CSP header configuration
- [ ] Add HSTS header
- [ ] Add X-Frame-Options
- [ ] Add X-Content-Type-Options
- [ ] Configure in vercel.json

## Deployment Readiness

- [ ] All CRITICAL fixes applied
- [ ] Build passes without errors
- [ ] Tests pass (80%+ coverage)
- [ ] Security audit clean
- [ ] Performance acceptable
- [ ] Vercel deployment successful
- [ ] Environment variables documented

