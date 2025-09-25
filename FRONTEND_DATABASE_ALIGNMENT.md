# Frontend-Database Alignment Checklist

## Critical Rule
**NEVER assume the frontend is working just because the backend exists.**

## Required Verification Steps for Every Feature

### 1. Before Starting
- [ ] Identify what database tables will be used
- [ ] Check if data exists in those tables
- [ ] Verify authentication requirements

### 2. When Creating API Endpoints
- [ ] Test the API endpoint with curl/Postman FIRST
- [ ] Verify it returns actual database data
- [ ] Check authentication/authorization works
- [ ] Handle error cases (401, 404, 500)

### 3. When Creating Frontend Pages
- [ ] Check if the API call succeeds in browser DevTools
- [ ] Look for 401/403 errors (authentication issues)
- [ ] Verify the data structure matches what frontend expects
- [ ] Add proper error handling for failed API calls
- [ ] Display meaningful messages when no data exists

### 4. Common Issues to Check

#### Authentication Problems
- System admin pages require `isSystemAdmin: true`
- Regular dashboard requires team membership
- Check session cookies are valid

#### Data Existence
- Run seed scripts if tables are empty
- Verify data is for the correct organization/team
- Check if filters are too restrictive

#### API Response Format
- Frontend expects specific field names
- Check for null/undefined handling
- Verify array vs object responses

### 5. Testing Checklist
- [ ] Open browser DevTools Network tab
- [ ] Check API response status (200 vs 401/500)
- [ ] Verify response data structure
- [ ] Check console for JavaScript errors
- [ ] Test with correct user permissions

## Quick Debug Commands

```bash
# Check if data exists in database
npx tsx -e "
import { db } from './lib/db/drizzle';
import { invoices } from './lib/db/schema-billing';
db.select().from(invoices).then(r => console.log('Invoices:', r.length));
"

# Test API endpoint with authentication
curl -H "Cookie: session=YOUR_SESSION_COOKIE" http://localhost:3000/api/system-admin/billing/invoices

# Check current user session
# Look in browser DevTools > Application > Cookies for session value
```

## Red Flags 🚩
1. Creating UI without testing the API
2. Assuming seed scripts ran successfully
3. Not checking authentication requirements
4. Not looking at browser console/network errors
5. Saying "it should work" without verification

## The Golden Rule
**Always verify end-to-end:**
Database → API → Frontend → User sees data

Not just: Database ✓ "It should work"