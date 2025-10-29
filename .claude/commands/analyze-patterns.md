# Analyze Codebase Patterns

Analyze this codebase and identify improvement opportunities from design patterns and implementation templates.

## Core Design Patterns to Identify

1. **Factory Pattern** - Look for repeated object instantiation or switch statements
2. **Repository Pattern** - Identify direct database calls that should be abstracted
3. **Adapter Pattern** - Find external service integrations (Stripe, Resend, Airtable, Supabase)
4. **Dependency Injection** - Spot hardcoded dependencies in constructors
5. **Builder Pattern** - Find complex object construction (emails, forms, configurations)
6. **Middleware Pattern** - Identify repeated request processing logic
7. **Command Pattern** - Look for operations that need undo/tracking
8. **Event-Driven** - Find tightly coupled logic that could be event-based

## Pattern Categories to Analyze

### Data Architecture
- Repository Pattern Starter
- Adapter Pattern for Multi-DB
- Data Caching Layer
- Query Builder System

### Service Integration
- Multi-Service Factory (Email/Payment)
- Webhook Handler Framework
- Email Template Builder
- Dynamic Component Factory

### Code Organization
- Dependency Injection Setup
- Service Container Pattern
- Configuration Management

### Request Handling
- Middleware Stack System
- Rate Limiting Implementation
- Validation Patterns
- Error Handling

### Object Creation
- Factory Pattern Implementation
- Builder Pattern for Forms

### State & Events
- Event-Driven Architecture
- Command Pattern System
- Observer Pattern Setup
- Pub/Sub Messaging

### Performance
- React Query/Caching
- Memoization Strategy
- API Response Batching
- Code Splitting

### Type Safety
- JSDoc Type Annotations
- Zod Schema Library
- TypeScript Migration

### Testing
- Mock Service Factory
- Integration Test Patterns
- E2E Test Setup (Playwright)
- Error Boundary System

### Developer Experience
- Logging & Monitoring Setup
- Git Workflow Automation
- HMR Configuration

## Analysis Framework

For each recommendation:

1. **Identify the pattern need** by looking for:
   - Repeated code that could be abstracted
   - Tight coupling between components
   - Performance bottlenecks
   - Missing error handling
   - Hard-to-test code
   - Security concerns
   - Poor scalability patterns

2. **Prioritize recommendations**:
   - **Critical** (security, performance, or blocking issues)
   - **High Value** (significant time savings or maintainability improvement)
   - **Nice to Have** (polish and developer experience)

3. **For each recommendation provide**:
   - Template name from the list above
   - Specific file(s) and line numbers where the issue exists
   - Brief explanation of the problem (2-3 sentences)
   - Expected benefit (time saved, performance gain, or maintainability improvement)
   - Implementation difficulty (Easy/Medium/Hard for student level)
   - Refactored code example (if applicable)
   - Note any breaking changes

## Pattern Implementation Notes

Some patterns require explicit requests:
- **Multi-Service Factory** - Requires explicit pattern request
- **Webhook Handler Framework** - Create one-off handlers by default
- **Dependency Injection Setup** - Implement only when prompted
- **Service Container Pattern** - Advanced pattern, never default
- **Middleware Stack System** - Create individual middleware by default
- **Rate Limiting** - Never implemented without explicit request
- **API Response Batching** - Requires architecture design discussion
- **Zod Schema Library** - Comprehensive library requires planning
- **TypeScript Migration** - Migration is a specific project
- **Logging & Monitoring Setup** - Add console.logs by default, not structured logging
- **Git Workflow Automation** - CI/CD requires explicit setup

## Output Format

Provide analysis in this structure:

### Critical Priority
[List issues that need immediate attention]

### High Value Priority
[List improvements that significantly improve maintainability/performance]

### Nice to Have
[List polish and DX improvements]

For each issue:
- **Pattern**: [Template name]
- **Location**: [file:line_number]
- **Problem**: [2-3 sentence description]
- **Benefit**: [Expected improvement]
- **Difficulty**: [Easy/Medium/Hard]
- **Example**: [Code example if helpful]
