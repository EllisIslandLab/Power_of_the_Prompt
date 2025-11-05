# Claude CLI Commands Guide - Architecture Mastery Toolkit

Welcome to your Architecture Mastery Toolkit! This guide will teach you how to use the Claude CLI commands included with your purchase to rapidly implement professional architectural patterns in your codebase.

---

## Table of Contents

1. [Getting Started with Claude CLI](#getting-started-with-claude-cli)
2. [How to Use Toolkit Commands](#how-to-use-toolkit-commands)
3. [Best Practices](#best-practices)
4. [Command Reference](#command-reference)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started with Claude CLI

### What is Claude CLI?

Claude CLI is an AI-powered development tool that allows you to use natural language commands to generate code, refactor existing code, and implement architectural patterns. Think of it as having a senior developer available 24/7 to help you build better software.

### Installation

```bash
# Install Claude CLI globally
npm install -g @anthropic-ai/claude-cli

# Or use with npx (no installation required)
npx @anthropic-ai/claude-cli
```

### Authentication

1. Get your API key from https://console.anthropic.com/
2. Set your API key as an environment variable:

```bash
# Add to your ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY="your-api-key-here"

# Or create a .env file in your project
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
```

### Verify Installation

```bash
claude --version
```

---

## How to Use Toolkit Commands

Each resource in your Architecture Toolkit includes a **Claude CLI Command** - a carefully crafted prompt that generates production-ready code for that specific architectural pattern.

### Basic Workflow

1. **Copy the Command** from your toolkit resource page
2. **Navigate to Your Project** directory in your terminal
3. **Run the Command** using Claude CLI
4. **Review the Generated Code** and customize as needed
5. **Test and Integrate** into your application

### Example: Implementing Repository Pattern

Let's walk through a complete example of implementing the Repository Pattern.

#### Step 1: Copy the Command

From your toolkit, copy this command:

```
claude create repository pattern with TypeScript interfaces for Airtable and Supabase, include example CRUD operations
```

#### Step 2: Navigate to Your Project

```bash
cd /path/to/your/project
```

#### Step 3: Run the Command

```bash
claude "create repository pattern with TypeScript interfaces for Airtable and Supabase, include example CRUD operations"
```

#### Step 4: Review the Output

Claude will generate:
- `src/repositories/BaseRepository.ts` - Abstract base class
- `src/repositories/UserRepository.ts` - Example implementation
- TypeScript interfaces for your data models
- CRUD operations (Create, Read, Update, Delete)
- Error handling and logging

#### Step 5: Customize for Your Needs

The generated code is a starting point. You'll likely want to:
- Adjust the data models to match your schema
- Add custom query methods
- Configure error handling preferences
- Add validation logic

---

## Best Practices

### 1. Start with a Clean Branch

Always create a new git branch before running toolkit commands:

```bash
git checkout -b feature/add-repository-pattern
```

This makes it easy to review changes and roll back if needed.

### 2. Review Before Committing

**Never blindly commit generated code.** Always:
- Read through the generated files
- Run your linter and type checker
- Test the new code
- Ensure it integrates with your existing codebase

```bash
# Check for errors
npm run lint
npm run type-check
npm test
```

### 3. Customize the Commands

The toolkit commands are templates. Feel free to modify them:

**Generic Command:**
```
claude create repository pattern with TypeScript interfaces
```

**Customized for Your Project:**
```
claude create repository pattern with TypeScript interfaces for PostgreSQL using Prisma ORM, include User and Product models with full CRUD operations and transaction support
```

### 4. Iterative Refinement

If the first output isn't perfect, refine it:

```bash
# Initial generation
claude "create dependency injection container"

# Refine the output
claude "update the dependency injection container to support singleton and transient lifetimes"

# Add more features
claude "add automatic dependency resolution to the DI container"
```

### 5. Combine with Implementation Guides

Each toolkit command has a corresponding **Implementation Guide**. Always read the guide first to understand:
- When to use this pattern
- How it fits in your architecture
- Common pitfalls to avoid
- Integration steps

---

## Command Reference

### Data Architecture Commands

#### Repository Pattern
```bash
claude "create repository pattern with TypeScript interfaces for Airtable and Supabase, include example CRUD operations"
```

**What it generates:**
- Abstract BaseRepository class
- Concrete repository implementations
- Type-safe CRUD operations
- Query methods and filtering

**Time saved:** 8-12 hours

**See also:** [Repository Pattern Implementation Guide](./REPOSITORY_PATTERN_GUIDE.md)

---

### Code Organization Commands

#### Dependency Injection Setup
```bash
claude "create dependency injection container with TypeScript, include service registration and resolution with examples"
```

**What it generates:**
- DI container class
- Service registration system
- Dependency resolution logic
- Example service implementations
- Usage documentation

**Time saved:** 10-14 hours

**See also:** [Dependency Injection Implementation Guide](./DEPENDENCY_INJECTION_GUIDE.md)

---

### AI Prompts Collection

#### Debugging Prompts

When you encounter errors, use these pre-tested prompts:

**Next.js Error Analysis:**
```bash
claude "Analyze this Next.js error and suggest fixes: [paste your error message]"
```

**React Component Issues:**
```bash
claude "Debug this React component rendering issue: [paste your component code]"
```

**TypeScript Type Errors:**
```bash
claude "Fix this TypeScript type error with proper types: [paste the error]"
```

---

## Advanced Usage

### Context-Aware Commands

Claude CLI can read your existing code for context. Use this for better results:

```bash
# Analyze existing code before generating
claude "Review my src/repositories folder, then create a new ProductRepository following the same patterns"
```

### Multi-Step Workflows

Break complex patterns into steps:

```bash
# Step 1: Create base infrastructure
claude "create the base adapter pattern classes"

# Step 2: Add specific adapters
claude "create a Stripe adapter using the base adapter pattern"

# Step 3: Add error handling
claude "add retry logic and error handling to the Stripe adapter"
```

### Project-Specific Customization

Reference your project structure:

```bash
claude "create a caching layer using Redis that integrates with my existing BaseRepository in src/repositories/BaseRepository.ts"
```

---

## Troubleshooting

### Command Not Found

**Error:** `claude: command not found`

**Solution:**
```bash
# Install globally
npm install -g @anthropic-ai/claude-cli

# Or use npx
npx @anthropic-ai/claude-cli "your command here"
```

### API Key Issues

**Error:** `Authentication failed`

**Solution:**
```bash
# Check if your API key is set
echo $ANTHROPIC_API_KEY

# If empty, set it:
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Generated Code Has Errors

**Issue:** TypeScript errors or linting issues in generated code

**Solution:**
1. Run your linter to see specific issues:
   ```bash
   npm run lint
   ```

2. Ask Claude to fix specific errors:
   ```bash
   claude "fix these TypeScript errors in src/repositories/UserRepository.ts: [paste errors]"
   ```

3. Manually adjust for your coding standards

### Output Doesn't Match Your Project Structure

**Issue:** Generated files don't match your folder structure

**Solution:**
Provide context about your project structure:

```bash
claude "create repository pattern - we use src/data/repositories folder structure and Jest for testing"
```

---

## Tips for Maximum Value

### 1. Use Commands in Order

Follow the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) for the best sequence:
1. Start with foundational patterns (Repository, Adapter)
2. Add infrastructure (Caching, Logging)
3. Implement request handling (Middleware, Validation)
4. Optimize (Performance, Error Handling)

### 2. Build a Pattern Library

Save your customized commands for future projects:

```bash
# Create a commands file
cat > my-commands.md << 'EOF'
# My Custom Commands

## Repository Pattern (PostgreSQL + Prisma)
claude "create repository pattern with Prisma for PostgreSQL, include User and Post models"

## API Middleware Stack
claude "create Express middleware stack with validation, logging, and error handling"
EOF
```

### 3. Share with Your Team

Create a team knowledge base:
- Document which patterns you've implemented
- Share customized commands that work for your stack
- Build a team style guide for generated code

### 4. Iterate and Improve

Generated code is a starting point:
- Add project-specific logic
- Integrate with your existing systems
- Refactor to match your coding standards
- Add comprehensive tests

---

## Getting Help

### Resources

- **Implementation Guides**: Detailed guides for each pattern in your toolkit
- **Implementation Roadmap**: Strategic guide for implementation order
- **Community**: [Claude Community Forum](https://community.anthropic.com/)
- **Documentation**: [Claude CLI Docs](https://docs.anthropic.com/claude/docs)

### Support

If you encounter issues:
1. Check the Implementation Guide for that pattern
2. Review this troubleshooting section
3. Search the Claude community forum
4. Contact support through your portal

---

## Next Steps

1. ✅ Read this guide
2. 📖 Review the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
3. 🎯 Pick your first pattern to implement
4. 📚 Read that pattern's Implementation Guide
5. 💻 Run the command and start building!

---

**Remember:** These commands are tools, not magic spells. The real value comes from understanding the architectural patterns and adapting them to your specific needs. Use the Implementation Guides to build that understanding.

Happy building! 🚀
