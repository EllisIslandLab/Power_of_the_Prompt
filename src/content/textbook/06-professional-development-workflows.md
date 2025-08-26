# 🔄 Chapter 6: Professional Development Workflows

---

## 🔄 6.1 Advanced Git and GitHub Workflows

### 📈 Professional Git Workflow Strategy

**Beyond Basic Git:** While Chapter 1 covered basic Git setup, professional development requires sophisticated workflows that ensure code quality, team collaboration, and deployment reliability.

**Professional Workflow Benefits:**
- **Code Quality:** Every change is reviewed and tested
- **Collaboration:** Multiple developers can work safely on the same project
- **Deployment Safety:** Automated testing prevents broken code from going live
- **Business Continuity:** Rollback capabilities and change tracking

### 🌳 Branch Management Strategy

**Professional Branching Model:**

**Main Branch Protection:**
- Main branch always contains production-ready code
- No direct commits to main branch allowed  
- All changes go through pull requests
- Automatic deployment from main branch

**Feature Branch Workflow:**
```bash
# Create feature branch
git checkout -b feature/shopping-cart

# Work on feature with good commit messages
git add .
git commit -m "feat: Add shopping cart functionality with persistent storage"

# Push feature branch
git push origin feature/shopping-cart

# Create pull request on GitHub
# After review and approval, merge to main
# Delete feature branch after merge
git branch -d feature/shopping-cart
```

**Branch Naming Conventions:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes  
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring

### 📝 Professional Commit Message Standards

**Commit Message Structure:**
```
type: Brief description (50 characters or less)

Optional detailed explanation of what changed and why.
Can include multiple lines with additional context.
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting (no functional changes)
- `refactor:` Code restructuring (no functional changes)
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Professional Commit Examples:**
```bash
git commit -m "feat: Add shopping cart with persistent storage

- Implements localStorage for cart persistence
- Adds cart item counter in navigation
- Includes quantity adjustment controls
- Handles edge cases for deleted products"

git commit -m "fix: Resolve mobile navigation menu not closing on iOS Safari

- Addresses touch event propagation issue
- Ensures menu closes when clicking outside
- Tested on iPhone 12 and iPad Pro"

git commit -m "refactor: Optimize product loading performance

- Implements lazy loading for product images
- Reduces initial bundle size by 40%
- Improves First Contentful Paint by 1.2s"
```

## 📁 6.2 Repository Organization and Security

### 🏢 Professional Repository Structure

**Enterprise-Grade Repository Layout:**
```
your-business-website/
├── .github/
│   ├── workflows/           # GitHub Actions
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE.md
├── src/
│   ├── app/                # Next.js pages
│   ├── components/         # React components  
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── public/                # Static assets
├── docs/                  # Project documentation
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
├── package.json         # Dependencies
└── next.config.js       # Configuration
```

### 📚 Essential Repository Documentation

**Professional README.md:**
```markdown
# Your Business Website

Professional e-commerce website built with Next.js, TypeScript, and Airtable.

## 🚀 Features
- Responsive product catalog with advanced filtering
- Shopping cart with persistent storage
- Airtable integration for content management
- Stripe payment processing with webhook handling
- Contact forms with automatic email notifications
- SEO optimized with meta tags and structured data

## 🛠 Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Database:** Airtable with API integration
- **Payments:** Stripe Elements and Payment Intents
- **Hosting:** Vercel with automatic deployments
- **AI:** Claude CLI for development acceleration

## 📋 Prerequisites
- Node.js 18+ and npm/yarn
- Airtable account with API access
- Stripe account (test mode for development)
- Vercel account for deployment

## ⚙️ Local Development Setup

### 1. Clone and Install
```bash
git clone [repo-url]
cd your-business-website
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:
```
AIRTABLE_API_KEY=pat_xxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appxxxxxxxxxxxxxxx  
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
```

### 3. Start Development Server
```bash
npm run dev
```

## 🚀 Deployment
This site deploys automatically to Vercel when changes are pushed to the main branch.

## 📞 Support
- Email: your-email@business.com
- Documentation: [Link to full documentation]
```

**Comprehensive .gitignore:**
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history
```

**Environment Template (.env.example):**
```bash
# =================================
# DEVELOPMENT ENVIRONMENT TEMPLATE
# =================================
# Copy this file to .env.local and add your actual API keys

# Airtable Configuration
AIRTABLE_API_KEY=pat_your_airtable_api_key_here
AIRTABLE_BASE_ID=app_your_airtable_base_id_here

# Stripe Configuration (use test keys for development)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Site Configuration  
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# Optional: Analytics and Monitoring
# GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# SENTRY_DSN=https://xxxxxxxxx@sentry.io/xxxxxxx
```

### 🔒 Repository Security Configuration

**GitHub Repository Security Settings:**

**Basic Security Setup:**
1. Go to Settings → General
2. Disable unnecessary features:
   - Wiki (unless needed)
   - Issues (unless using for project management)
   - Projects (unless needed)
3. Enable vulnerability alerts
4. Set repository visibility appropriately (Private for client work)

**Branch Protection Rules:**
1. Go to Settings → Branches
2. Add protection rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging  
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators in restrictions

## ⚙️ 6.3 Automated Deployment and CI/CD

### 🚀 GitHub Actions for Professional Deployment

**Understanding CI/CD Benefits:**
- **Continuous Integration (CI):** Automatically test every change
- **Continuous Deployment (CD):** Automatically deploy successful changes
- **Quality Assurance:** Prevent broken code from reaching production
- **Time Savings:** Eliminate manual deployment steps

**Professional GitHub Actions Workflow:**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test
    
    - name: Build project
      run: npm run build
      env:
        AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
        AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
        STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}
        NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}

  deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

**Setting Up GitHub Secrets:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add required secrets:
   - `AIRTABLE_API_KEY`: Your Airtable API key
   - `AIRTABLE_BASE_ID`: Your Airtable base ID  
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe public key
   - `VERCEL_TOKEN`: Vercel deployment token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### 🔧 Vercel Deployment Configuration

**vercel.json Configuration:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### 🔍 Deploy Preview and Testing Strategy

**Automatic Deploy Previews:**
- Every pull request gets a unique preview URL
- Test changes before merging to main branch
- Share preview URLs with stakeholders for approval
- Automatic cleanup when PR is merged or closed

**Quality Gates in CI/CD:**
1. **Linting:** Code style and formatting checks
2. **Type Checking:** TypeScript compilation verification  
3. **Testing:** Unit and integration tests
4. **Build Verification:** Ensure production build succeeds
5. **Security Scanning:** Dependency vulnerability checks

## 💼 6.4 Professional Development Practices

### 🔍 Code Review Process

**Pull Request Template:**
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes and their purpose.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass  
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)
- [ ] Mobile responsiveness verified (if UI changes)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Code is properly documented
- [ ] Changes generate no new warnings
- [ ] New and existing tests pass
- [ ] Environment variables updated (if needed)

## Screenshots (if applicable)
Add screenshots for UI changes.

## Additional Notes
Any additional information reviewers should know.
```

### 📉 Performance and Quality Monitoring

**Lighthouse CI Integration:**
Add to GitHub Actions workflow:
```yaml
    - name: Run Lighthouse CI  
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

Create `lighthouserc.js`:
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm start',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.85}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['warn', {minScore: 0.90}],
        'categories:seo': ['error', {minScore: 0.90}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 🤝 Team Collaboration Standards

**Collaboration Best Practices:**
- **Clear Communication:** Descriptive commit messages and PR descriptions
- **Code Documentation:** Comment complex business logic and integrations
- **Consistent Style:** Use ESLint and Prettier for code formatting
- **Regular Updates:** Keep local branches current with main branch
- **Knowledge Sharing:** Document decisions and architectural choices

**Access Management:**
- **Read Access:** View code and clone repository
- **Write Access:** Create branches and pull requests
- **Admin Access:** Manage repository settings and deployments
- **Regular Reviews:** Quarterly access audits and cleanup

This professional workflow chapter provides the foundation for scalable, maintainable development practices that grow with your business while maintaining code quality and deployment reliability.