# Chapter 1: Accounts and Installations

## 1.1 Account Setup Strategy and Security

### Password Security Foundation

Before creating any accounts, establish a strong security foundation:

**Password Requirements:**
- Minimum 12 characters (16+ recommended)
- Mix of uppercase, lowercase, numbers, and symbols
- Unique password for each account
- No personal information (names, birthdays, addresses)

**Recommended Password Strategy:**
1. Use a Password Manager: Bitwarden (free), 1Password, or LastPass
2. Enable Two-Factor Authentication (2FA) on all accounts
3. Use unique passwords - never reuse passwords
4. Create a secure master password for your password manager

**Example Strong Password Structure:**
```
MyBusiness2025!WebDev#Secure
```

### Account Security Checklist

Before proceeding with account creation, ensure you have:
- [ ] Password manager installed and configured
- [ ] Primary email account secured with 2FA
- [ ] Recovery email address set up
- [ ] Phone number verified for account recovery

## 1.2 Essential Account Creation

### Account Creation Order (Important!)

Create accounts in this specific order to maintain security and organization:

### 1. GitHub Account
**Purpose:** Source code storage and version control  
**URL:** https://github.com  
**Business Email Required:** Yes

**Setup Steps:**
1. Visit github.com and click "Sign up"
2. Username: Choose professional name (avoid numbers/special characters)
   - Good: "johnsmith-webdev" or "smithconsulting"
   - Avoid: "john123" or "js_developer_2025"
3. Email: Use your business email address
4. Password: Generate strong password with password manager
5. Verify email and enable 2FA immediately

**Security Configuration:**
- Navigate to Settings → Security
- Enable Two-factor authentication
- Add recovery codes to password manager
- Set up SSH keys (covered in installation section)

### 2. Netlify Account
**Purpose:** Website hosting and deployment  
**URL:** https://netlify.com  
**Business Email Required:** Yes

**Setup Steps:**
1. Visit netlify.com and click "Sign up"
2. Choose "Email" signup (don't use GitHub initially)
3. Email: Use same business email as GitHub
4. Password: Generate unique strong password
5. Verify email and enable 2FA

**Business Configuration:**
- Complete profile with business information
- Add payment method for custom domain features
- Verify business email for professional features

### 3. Airtable Account
**Purpose:** Database and content management  
**URL:** https://airtable.com  
**Business Email Required:** Yes

**Setup Steps:**
1. Visit airtable.com and click "Sign up for free"
2. Email: Use same business email
3. Password: Generate unique strong password
4. Workspace Name: Use your business name
5. Enable 2FA in account settings

**Professional Setup:**
- Complete business profile information
- Upgrade to Pro plan if needed (after free trial)
- Set workspace permissions appropriately

### 4. Anthropic Account (Claude CLI)
**Purpose:** AI-assisted development  
**URL:** https://console.anthropic.com  
**Business Email Required:** Yes

**Setup Steps:**
1. Visit console.anthropic.com
2. Email: Use same business email
3. Password: Generate unique strong password
4. Organization: Set to your business name
5. Generate API key (covered in security section)

**Important Security Notes:**
- API keys are extremely sensitive - treat like passwords
- Never share API keys or commit them to code
- Regularly rotate API keys (monthly recommended)

### 5. Stripe Account (Optional - Payment Processing)
**Purpose:** Payment processing for e-commerce  
**URL:** https://stripe.com  
**Business Information Required:** Yes

**Setup Steps:**
1. Visit stripe.com and click "Start now"
2. Email: Use business email
3. Business Information: Complete all required fields accurately
4. Bank Account: Add business bank account for payouts
5. Identity Verification: Complete all required documentation

**Business Verification:**
- Provide accurate business registration information
- Upload required business documents
- Verify bank account ownership
- Complete tax information (W-9 or equivalent)

## 1.3 Development Environment Installation

### System Requirements Check

Before installation, verify your system meets requirements:

**Windows 10/11:**
- Version 1903 or higher
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space
- Administrative access

**Mac:**
- macOS 10.15 or later
- 8GB RAM minimum (16GB recommended)
- 15GB free disk space
- Xcode Command Line Tools

**Linux:**
- Ubuntu 18.04+ (or equivalent)
- 8GB RAM minimum
- 15GB free disk space

### Windows Subsystem for Linux (WSL) Installation

**Why WSL is Required:**
- Claude CLI requires Linux environment
- Professional development tools work better in Linux
- Matches production server environments
- Better performance for Node.js development

**Step-by-Step WSL Installation:**

1. **Enable WSL Feature:**
```powershell
# Run PowerShell as Administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

2. **Enable Virtual Machine Platform:**
```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

3. **Restart Computer (Required)**

4. **Set WSL 2 as Default:**
```powershell
wsl --set-default-version 2
```

5. **Install Ubuntu:**
   - Open Microsoft Store
   - Search "Ubuntu 22.04 LTS"
   - Click "Install"
   - Wait for installation to complete

6. **Initial Ubuntu Setup:**
   - Launch Ubuntu from Start Menu
   - Create username (lowercase, no spaces)
   - Create strong password
   - Confirm password

7. **Update Ubuntu Packages:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Troubleshooting Common WSL Issues:**

*Error: "WSL 2 requires an update to its kernel component"*
- Download WSL2 kernel update from Microsoft
- Install and restart

*Error: "The requested operation could not be completed due to a virtual disk system limitation"*
- Ensure Hyper-V is enabled in Windows Features
- Restart computer

*Ubuntu won't start:*
- Run `wsl --shutdown` in PowerShell
- Restart Ubuntu

### Visual Studio Code Installation and Configuration

**Download and Install:**
1. Visit https://code.visualstudio.com
2. Download for your operating system
3. Run installer with default settings
4. Launch VS Code

**Essential Extensions Installation:**

Install these extensions in order:

1. **WSL Extension (Windows only):**
   - Search "WSL" in Extensions
   - Install "WSL" by Microsoft
   - Restart VS Code

2. **ESLint:**
   - Search "ESLint"
   - Install "ESLint" by Microsoft
   - Enables code quality checking

3. **Prettier - Code formatter:**
   - Search "Prettier"
   - Install "Prettier - Code formatter"
   - Enables automatic code formatting

4. **TypeScript and JavaScript:**
   - Search "TypeScript"
   - Install "TypeScript Importer"
   - Install "JavaScript (ES6) code snippets"

5. **Git Graph:**
   - Search "Git Graph"
   - Install "Git Graph" by mhutchie
   - Visualizes git commit history

**VS Code Configuration:**

Create settings.json for optimal development:

1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
2. Type "Preferences: Open Settings (JSON)"
3. Add these settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.format.enable": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### Node.js Installation

**Installation Steps:**

**Windows (with WSL):**
```bash
# In Ubuntu terminal
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Mac:**
```bash
# Install Homebrew first if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Verify Installation:**
```bash
node --version
npm --version
```
Should show v18+ and v9+ respectively.

### Git Installation and Configuration

**Installation:**

**Windows (WSL):**
```bash
sudo apt install git
```

**Mac:**
```bash
brew install git
```

**Global Configuration:**
```bash
git config --global user.name "Your Business Name"
git config --global user.email "your-business@email.com"
git config --global init.defaultBranch main
```

**SSH Key Generation for GitHub:**
```bash
ssh-keygen -t ed25519 -C "your-business@email.com"
# Press Enter for all prompts (use default location and no passphrase)

# Copy public key to clipboard
cat ~/.ssh/id_ed25519.pub
```

**Add SSH Key to GitHub:**
1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste the public key
4. Give it a descriptive title: "Development Machine - [Date]"

**Test SSH Connection:**
```bash
ssh -T git@github.com
```

### Claude CLI Installation

**Installation Steps:**
```bash
# Install Claude CLI
npm install -g @anthropic-ai/claude-cli

# Verify installation
claude --version
```

**Authentication:**
1. Get API key from Anthropic Console:
   - Visit https://console.anthropic.com
   - Go to API Keys section
   - Click "Create Key"
   - Copy the key immediately (won't be shown again)

2. Store API Key Securely:
```bash
claude auth login
# Paste your API key when prompted
```

**Test Claude CLI:**
```bash
claude chat "Hello, can you help me create a simple webpage?"
```

## 1.4 Security Best Practices and Backup Strategies

### Environment Variables and Token Management

**Naming Conventions for Consistency:**

Use consistent naming across all platforms:

**Airtable Variables:**
- `AIRTABLE_API_KEY` - Your personal API key
- `AIRTABLE_BASE_ID` - Specific base identifier
- `AIRTABLE_TABLE_NAME` - Specific table name

**Anthropic Variables:**
- `ANTHROPIC_API_KEY` - Claude CLI access key

**Stripe Variables:**
- `STRIPE_PUBLISHABLE_KEY` - Public key for frontend
- `STRIPE_SECRET_KEY` - Private key for backend
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

**GitHub Variables:**
- `GITHUB_TOKEN` - For automated deployments

### Environment Variable Security Rules

**NEVER:**
- Commit API keys to git repositories
- Share API keys in chat or email
- Store API keys in plain text files
- Use the same API key across multiple projects

**ALWAYS:**
- Use environment variables for all sensitive data
- Rotate API keys monthly
- Use different keys for development and production
- Store backup copies securely

### Secure Backup Strategy

**What to Backup:**
1. API Keys and Tokens (encrypted storage)
2. Source Code (GitHub repositories)
3. Database Schemas (Airtable base structure)
4. Domain and DNS Settings (documentation)
5. Business Documentation (procedures and workflows)

**Backup Locations:**
1. Password Manager - For all API keys and credentials
2. Encrypted Cloud Storage - For business documentation
3. Local Encrypted Drive - For emergency access
4. Physical Secure Location - For ultimate backup

**Monthly Backup Checklist:**
- [ ] Export Airtable data to CSV
- [ ] Document current environment variables
- [ ] Update password manager with any new credentials
- [ ] Verify GitHub repository backups
- [ ] Test restoration procedures

### API Key Rotation Procedure

**Monthly API Key Rotation:**
1. Generate new API key in respective service
2. Update environment variables in Netlify
3. Update local development environment
4. Test functionality with new keys
5. Delete old API key from service
6. Update backup documentation

**Emergency Key Rotation:**

If you suspect a key has been compromised:
1. Immediately generate new key
2. Delete compromised key
3. Update all environments
4. Monitor for unusual activity
5. Document the incident

### Security Monitoring

**Regular Security Checks:**
- Weekly: Review account login activity
- Monthly: Rotate API keys and passwords
- Quarterly: Complete security audit
- Annually: Update all security procedures

**Warning Signs of Compromise:**
- Unexpected login notifications
- Unusual API usage patterns
- Unauthorized changes to configurations
- Unexplained charges or usage

**Incident Response Plan:**
1. Immediately change all relevant passwords
2. Rotate all API keys
3. Review all account activity
4. Contact service providers if needed
5. Document and learn from the incident