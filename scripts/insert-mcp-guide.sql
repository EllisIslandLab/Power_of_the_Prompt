-- =========================================================
-- MCP Installation & Configuration Guide for WLA Services
-- Organized by complexity: Simple → Advanced
-- =========================================================

INSERT INTO product_contents (
  product_id,
  category,
  name,
  slug,
  description,
  claude_command,
  difficulty,
  implementation_time,
  time_saved_min,
  time_saved_max,
  sort_order
) VALUES (
  '92780671-c3d7-49f1-bb0e-1d3bae862e48',  -- Architecture Mastery Toolkit product ID
  'Getting Started',
  'MCP Setup Guide for WLA Services',
  'mcp-setup-guide-wla-services',
  'Install and configure Model Context Protocol (MCP) servers for GitHub, Airtable, Supabase, Stripe, and other WLA services. MCPs let Claude CLI directly access external services without manual API calls. Organized from simplest (GitHub) to advanced (custom APIs).',
  'Add this comprehensive MCP guide to your Claude configuration.

## What are MCPs?
Model Context Protocol (MCP) servers allow Claude CLI to directly interact with external services like GitHub, databases, and APIs. Instead of manually making API calls, Claude can read/write to these services automatically.

## Configuration File Location
Add MCP configs to your Claude Desktop config:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

---

## TIER 1: Essential MCPs (Simplest Setup)
*For basic WLA projects: GitHub repos + Airtable databases*

### 1. GitHub MCP (Official)
**What it does**: Read repos, create issues, manage PRs, commit code
**Setup**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Get your token**: https://github.com/settings/tokens (needs `repo` scope)

**Time saved**: 2-3 hours per project (no manual git commands)

---

### 2. Filesystem MCP (Official)
**What it does**: Read/write local files, search codebases
**Setup**:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/your/project",
        "/path/to/another/project"
      ]
    }
  }
}
```

**Time saved**: 1-2 hours per session (automatic file operations)

---

### 3. Airtable MCP (Community)
**What it does**: Query bases, create records, update tables
**Note**: No official MCP yet, but you can use the Memory MCP to store Airtable credentials and use Claude to make API calls.

**Alternative approach**:
```bash
# Store Airtable credentials in environment
export AIRTABLE_API_KEY="your_key_here"
export AIRTABLE_BASE_ID="appXXXXXXXXXXXX"

# Claude can then access these via process.env
```

**Manual API calls** (Claude can generate these):
```typescript
const Airtable = require("airtable");
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
  .base(process.env.AIRTABLE_BASE_ID);
```

**Time saved**: 1-2 hours (structured data access)

---

## TIER 2: Database MCPs (Moderate Complexity)
*For WLA apps with Supabase backends*

### 4. PostgreSQL MCP (Works with Supabase!)
**What it does**: Query/modify Supabase database directly
**Setup**:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@db.xxx.supabase.co:5432/postgres"
      }
    }
  }
}
```

**Get your connection string**: Supabase Dashboard → Project Settings → Database → Connection String (URI)

**⚠️ Security**: Use connection pooling URL, not direct connection (prevents timeout issues)

**Time saved**: 3-5 hours per project (direct database queries, no manual SQL editor)

---

## TIER 3: API Integration Helpers (Advanced)
*Services without official MCPs - use environment variables + Claude-generated code*

### 5. Stripe (No MCP - Use API)
**What it does**: Create products, checkout sessions, webhooks
**Setup**:
```bash
# .env.local
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

**Claude command**: "Create a Stripe checkout session for $190 product"
- Claude will generate the API call code using your env vars
- No MCP needed - Stripe SDK is simple enough

**Time saved**: 2-3 hours (Claude generates boilerplate)

---

### 6. Resend (No MCP - Use API)
**What it does**: Send transactional emails
**Setup**:
```bash
# .env.local
RESEND_API_KEY=re_xxx
```

**Claude command**: "Send welcome email using Resend"
- Claude generates email template + API call
- Resend API is straightforward

**Time saved**: 1-2 hours (template generation)

---

### 7. Vercel (No MCP - Use CLI)
**What it does**: Deploy, manage projects, environment variables
**Setup**:
```bash
npm i -g vercel
vercel login
```

**Claude command**: "Deploy this Next.js app to Vercel production"
- Claude generates `vercel --prod` commands
- Uses Vercel CLI, not an MCP

**Time saved**: 30min-1hr (deployment automation)

---

### 8. Square (No MCP - Use API)
**What it does**: Payment processing, catalog management
**Setup**:
```bash
# .env.local
SQUARE_ACCESS_TOKEN=sq0xxx
SQUARE_LOCATION_ID=L123
```

**Claude command**: "Create a Square payment form"
- Claude generates Square Web Payments SDK code
- No MCP needed

**Time saved**: 2-3 hours (payment integration)

---

## Complete Example Configuration

Here''s a full `claude_desktop_config.json` with all Tier 1 & 2 MCPs:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/projects",
        "/Users/yourname/weblaunchacademy"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:[password]@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
      }
    }
  }
}
```

---

## Testing Your MCPs

After adding MCPs to your config:

1. **Restart Claude Desktop** (MCPs only load on startup)
2. **Check the MCP icon** (plug icon in bottom-right)
3. **Test each MCP**:
   - GitHub: "Show me the latest issues in my repo"
   - Filesystem: "List all TypeScript files in my project"
   - Supabase: "Show me the users table schema"

---

## Troubleshooting

**MCP not showing up?**
- Check JSON syntax (use jsonlint.com)
- Restart Claude Desktop
- Check terminal logs: `~/Library/Logs/Claude/mcp*.log`

**Connection errors?**
- Verify API keys/tokens are correct
- Check environment variable names match
- Ensure network access (VPN issues?)

**Slow responses?**
- Use connection pooling URLs for databases
- Limit filesystem paths to active projects only
- GitHub: Use fine-grained tokens (not classic)

---

## Next Steps

1. **Start with Tier 1** (GitHub + Filesystem) - safest, most useful
2. **Add Supabase** if you use it (game-changer for database work)
3. **Use .env files** for Tier 3 services (Stripe, Resend, etc.)
4. **Create custom MCPs** for any service you use frequently

**Questions?** Ask Claude: "How do I configure the GitHub MCP?" and it will guide you through your specific setup!',
  'beginner',
  '30-60 minutes',  -- implementation_time
  3,  -- time_saved_min (hours)
  5,  -- time_saved_max (hours)
  1   -- sort_order: Put it first in "Getting Started" category
);

-- Verify it was inserted
SELECT
  category,
  name,
  difficulty,
  time_saved_min,
  time_saved_max
FROM product_contents
WHERE name = 'MCP Setup Guide for WLA Services';
