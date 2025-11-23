# Pattern Detection & Recommendation Rules

When analyzing code in this project, detect these anti-patterns and recommend solutions.

## Detection Rules

### 1. Direct Database Access in Components

**Detect:**
```typescript
// BAD - Direct Supabase call in component
export default function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('users').select('*').then(({ data }) => setStudents(data));
  }, []);
}
```

**Recommend:**
- Repository Pattern (see `.claudeconfig/templates/repository.md`)
- Move data fetching to server components or API routes

**Why:** Separates data access logic, makes code testable, enables caching.

---

### 2. Repeated Service Instantiation

**Detect:**
```typescript
// BAD - Creating service instances everywhere
async function handleEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send(...);
}

async function handlePayment() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  await stripe.charges.create(...);
}
```

**Recommend:**
- Multi-Service Factory (see `.claudeconfig/templates/factory.md`)
- Use existing services in `src/lib/stripe.ts` and email utilities

**Why:** Centralized configuration, easier testing, consistent setup.

---

### 3. No Input Validation

**Detect:**
```typescript
// BAD - No validation
export async function POST(request: Request) {
  const { email, name } = await request.json();
  // Directly using unvalidated data
  await createStudent({ email, name });
}
```

**Recommend:**
- Use existing Zod schemas from `src/lib/schemas.ts`
- Add validation middleware (see `.claudeconfig/templates/middleware.md`)

**Why:** Prevents invalid data, provides clear error messages, documents data shape.

**Example Fix:**
```typescript
import { signUpSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const body = await request.json();
  const result = signUpSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  await createStudent(result.data);
}
```

---

### 4. Repeated Auth Checks Across Routes

**Detect:**
```typescript
// BAD - Same auth check in every route
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ... actual logic
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ... actual logic
}
```

**Recommend:**
- Middleware Stack System (see `.claudeconfig/templates/middleware.md`)
- Use the existing `src/middleware.ts` for route-level protection

**Why:** DRY principle, consistent security, easier to update.

---

### 5. No Error Handling

**Detect:**
```typescript
// BAD - No try/catch
export async function POST(request: Request) {
  const data = await request.json();
  const result = await supabase.from('users').insert(data); // Could throw!
  return Response.json(result);
}
```

**Recommend:**
- Error Handling Framework (see `.claudeconfig/templates/error-handling.md`)
- Use `src/lib/logger.ts` for structured error logging

**Why:** Prevents crashes, provides user feedback, enables debugging.

**Example Fix:**
```typescript
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { data: result, error } = await supabase.from('users').insert(data);

    if (error) throw error;
    return Response.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Failed to create user');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### 6. Fetching Same Data Multiple Times

**Detect:**
```typescript
// BAD - No caching, fetching same data repeatedly
function StudentProfile({ id }) {
  const [student, setStudent] = useState(null);
  useEffect(() => {
    fetch(`/api/students/${id}`).then(r => r.json()).then(setStudent);
  }, [id]);
}

function StudentCourses({ id }) {
  const [student, setStudent] = useState(null);
  useEffect(() => {
    fetch(`/api/students/${id}`).then(r => r.json()).then(setStudent);
    // Same call as above!
  }, [id]);
}
```

**Recommend:**
- Use `src/lib/cache.ts` for server-side caching
- Consider React Server Components for data fetching
- Use `src/lib/api-client.ts` for batch requests

**Why:** Faster performance, reduced API costs, better UX.

---

### 7. No Rate Limiting on Public APIs

**Detect:**
```typescript
// BAD - Public API with no protection
export async function POST(request: Request) {
  const data = await request.json();
  // Anyone can call this unlimited times!
  return Response.json(await processData(data));
}
```

**Recommend:**
- Use `src/lib/rate-limiter.ts` which is already configured

**Example Fix:**
```typescript
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  const { success, headers } = await checkRateLimit(request, 'api');

  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429, headers });
  }

  // Continue with protected logic...
}
```

---

### 8. Tightly Coupled Features

**Detect:**
```typescript
// BAD - One function does everything
async function enrollStudent(studentId: string, courseId: string) {
  await database.update('users', studentId, { enrolled: true });
  await sendWelcomeEmail(studentId);
  await updateAnalytics(studentId, courseId);
  await notifyInstructor(courseId);
  await addStudentPoints(studentId, 'enrollment', 100);
  // Adding new feature? Edit this function!
}
```

**Recommend:**
- Event-Driven Architecture
- Pub/Sub Messaging pattern

**Why:** Modular code, easy to extend, independent features.

---

### 9. Missing Permission Checks

**Detect:**
```typescript
// BAD - No role/tier check
export async function DELETE(request: Request, { params }) {
  // Anyone authenticated can delete!
  await supabase.from('users').delete().eq('id', params.id);
}
```

**Recommend:**
- Use `src/lib/permissions.ts` for role-based access
- Use `src/lib/tier-permissions.ts` for feature gating

**Example Fix:**
```typescript
import { hasPermission } from '@/lib/permissions';

export async function DELETE(request: Request, { params }) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!hasPermission(user, 'admin')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  await supabase.from('users').delete().eq('id', params.id);
}
```

---

### 10. Hardcoded Configuration

**Detect:**
```typescript
// BAD - Hardcoded values
const stripe = new Stripe('sk_live_xxxxx'); // API key in code!
const RATE_LIMIT = 100; // Magic number
const API_URL = 'https://api.example.com'; // Hardcoded URL
```

**Recommend:**
- Use environment variables
- Create configuration files in `src/lib/config/`

**Why:** Security, flexibility across environments, easier updates.

---

### 11. Missing TypeScript Types

**Detect:**
```typescript
// BAD - Using 'any' or missing types
async function processUser(user: any) {
  return user.email; // No type safety!
}

// BAD - Implicit any
function handleData(data) {
  return data.value;
}
```

**Recommend:**
- Use types from `src/types/database.ts`
- Create Zod schemas in `src/lib/schemas.ts` and infer types

**Example Fix:**
```typescript
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

async function processUser(user: User): Promise<string> {
  return user.email;
}
```

---

### 12. Inconsistent Error Responses

**Detect:**
```typescript
// BAD - Different error formats in different routes
return Response.json({ msg: 'Not found' }, { status: 404 });
return Response.json({ error: { message: 'Invalid' } }, { status: 400 });
return Response.json({ err: 'Server error' }, { status: 500 });
```

**Recommend:**
- Standardize error responses
- Use error handling framework

**Correct Format:**
```typescript
// Consistent format
return Response.json({ error: 'Not found' }, { status: 404 });
return Response.json({ error: 'Validation failed', details: {...} }, { status: 400 });
return Response.json({ error: 'Internal server error' }, { status: 500 });
```

---

### 13. No Logging

**Detect:**
```typescript
// BAD - No logging, or using console.log
export async function POST(request: Request) {
  try {
    await doSomething();
  } catch (error) {
    console.log('Error:', error); // Not production-ready!
    throw error;
  }
}
```

**Recommend:**
- Use `src/lib/logger.ts` (Pino structured logging)

**Example Fix:**
```typescript
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    await doSomething();
  } catch (error) {
    logger.error({ err: error, context: 'POST /api/route' }, 'Operation failed');
    throw error;
  }
}
```

---

## Recommendation Priority

When multiple patterns apply, recommend in this order:

1. **Security first:** Rate Limiting, Input Validation, Auth/Permission Checks
2. **Architecture foundation:** Repository Pattern, Dependency Injection
3. **Error handling:** Error Handling Framework, Logging
4. **Performance:** Caching, Static Generation
5. **Code quality:** Factory Pattern, Middleware Stack
6. **Advanced:** Event-Driven, Command Pattern

---

## Output Format

When suggesting patterns, use this format:

```markdown
## Recommended Improvements

### High Priority: [Pattern Name]

**Issue Found:** [Specific file and line or description]

**Why This Matters:** [Impact on security/performance/maintenance]

**Suggested Fix:** [Code example or reference to template]

**Reference:** See `.claudeconfig/templates/[pattern].md`

---

[Repeat for each recommendation, max 3 per analysis]
```

---

## Existing Project Utilities

Before creating new utilities, check these existing files:

| Need | Existing Solution |
|------|-------------------|
| Input validation | `src/lib/schemas.ts` |
| Rate limiting | `src/lib/rate-limiter.ts` |
| Caching | `src/lib/cache.ts` |
| Logging | `src/lib/logger.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Stripe client | `src/lib/stripe.ts` |
| Role permissions | `src/lib/permissions.ts` |
| Tier permissions | `src/lib/tier-permissions.ts` |
| Database types | `src/types/database.ts` |
