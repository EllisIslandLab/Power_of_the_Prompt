# Testing Patterns Template

## Quick Start

Set up testing infrastructure for the project. Recommended: Vitest for unit/integration tests.

## Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
```

## Mock Service Factory

```typescript
// tests/mocks/services.ts

import { vi } from 'vitest';

/**
 * Create mock Supabase client
 */
export function createMockSupabase() {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  };
}

/**
 * Create mock email service
 */
export function createMockEmailService() {
  return {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
    },
  };
}

/**
 * Create mock Stripe
 */
export function createMockStripe() {
  return {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_test_123' }),
    },
  };
}

/**
 * Create mock cache
 */
export function createMockCache() {
  const store = new Map();

  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) || null)),
    set: vi.fn((key: string, value: any) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    delete: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
    wrap: vi.fn(async (key: string, fetcher: () => Promise<any>) => {
      const cached = store.get(key);
      if (cached) return cached;
      const fresh = await fetcher();
      store.set(key, fresh);
      return fresh;
    }),
    clear: () => store.clear(),
  };
}
```

## Repository Testing

```typescript
// tests/repositories/StudentRepository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentRepository } from '@/lib/repositories/StudentRepository';
import { createMockSupabase, createMockCache } from '../mocks/services';

// Mock the imports
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/cache', () => ({
  cache: createMockCache(),
}));

describe('StudentRepository', () => {
  let repository: StudentRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.mocked(require('@/lib/supabase').createClient).mockReturnValue(mockSupabase);
    repository = new StudentRepository();
  });

  describe('findById', () => {
    it('should return student when found', async () => {
      const mockStudent = { id: '123', email: 'test@example.com', role: 'student' };

      mockSupabase.from().single.mockResolvedValue({
        data: mockStudent,
        error: null,
      });

      const result = await repository.findById('123');

      expect(result).toEqual(mockStudent);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should return null when not found', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new student', async () => {
      const newStudent = { email: 'new@example.com', role: 'student' };
      const createdStudent = { id: '456', ...newStudent };

      mockSupabase.from().single.mockResolvedValue({
        data: createdStudent,
        error: null,
      });

      const result = await repository.create(newStudent);

      expect(result).toEqual(createdStudent);
    });
  });
});
```

## API Route Testing

```typescript
// tests/api/students.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/students/route';
import { createMockSupabase } from '../mocks/services';

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, headers: {} }),
}));

describe('GET /api/students', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.mocked(require('@/lib/supabase').createClient).mockResolvedValue(mockSupabase);
  });

  it('should return list of students', async () => {
    const mockStudents = [
      { id: '1', email: 'a@test.com' },
      { id: '2', email: 'b@test.com' },
    ];

    mockSupabase.from().select.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockStudents, error: null }),
      }),
    });

    const request = new Request('http://localhost/api/students');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStudents);
  });
});

describe('POST /api/students', () => {
  it('should return 401 without authentication', async () => {
    const mockSupabase = createMockSupabase();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    vi.mocked(require('@/lib/supabase').createClient).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/students', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
```

## Component Testing

```typescript
// tests/components/LoginForm.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  it('should render email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data', async () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });
});
```

## Integration Testing

```typescript
// tests/integration/enrollment.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrollStudent } from '@/lib/services/enrollment';
import { createMockSupabase, createMockEmailService, createMockStripe } from '../mocks/services';

describe('Student Enrollment Flow', () => {
  beforeEach(() => {
    // Setup all mocks
    vi.mocked(require('@/lib/supabase').createClient).mockReturnValue(createMockSupabase());
    vi.mocked(require('@/lib/factories/ServiceFactory').ServiceFactory.create)
      .mockImplementation((type) => {
        if (type === 'email') return createMockEmailService();
        if (type === 'payment') return createMockStripe();
      });
  });

  it('should complete full enrollment flow', async () => {
    const result = await enrollStudent({
      email: 'student@example.com',
      name: 'Test Student',
      courseId: 'course_123',
      paymentMethodId: 'pm_123',
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
    expect(result.checkoutUrl).toBeDefined();
  });
});
```

## Test Utilities

```typescript
// tests/utils.ts

import { vi } from 'vitest';

/**
 * Create a mock Request object
 */
export function createMockRequest(
  url: string,
  options: RequestInit = {}
): Request {
  return new Request(`http://localhost${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Create authenticated mock request
 */
export function createAuthenticatedRequest(
  url: string,
  user: { id: string; email: string },
  options: RequestInit = {}
): Request {
  const request = createMockRequest(url, options);
  (request as any).user = user;
  return request;
}

/**
 * Wait for async operations
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## When to Test

| Layer | What to Test | Priority |
|-------|--------------|----------|
| Repositories | CRUD operations, error handling | High |
| API Routes | Auth, validation, responses | High |
| Services | Business logic | High |
| Components | User interactions, rendering | Medium |
| Utilities | Pure functions | Medium |
| Integration | Critical user flows | High |

## Benefits

1. **Confidence:** Know your code works
2. **Refactoring:** Safe to change code
3. **Documentation:** Tests show how code works
4. **Regression Prevention:** Catch bugs early
5. **Design:** TDD improves code quality

## Related Patterns

- **Mock Service Factory** - Create test doubles
- **Dependency Injection** - Make code testable
- **Error Handling** - Test error scenarios
