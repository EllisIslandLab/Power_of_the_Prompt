# 📚 Chapter 1: Accounts and Installations

---

## 🔐 1.1 Account Setup Strategy and Security

### 🔑 Password Security Foundation

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

### ✅ Account Security Checklist

Before proceeding with account creation, ensure you have:
- [ ] Password manager installed and configured
- [ ] Primary email account secured with 2FA
- [ ] Recovery email address set up
- [ ] Phone number verified for account recovery

## 💻 1.2 System Requirements and Software Installation

### 📋 System Requirements Check

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

### 📋 Installation Order (Important!)

Install software in this specific order for optimal setup:

### 🎨 1. Visual Studio Code Installation and Configuration

**Why VS Code First:**
- Required for all development work
- Needed to properly configure other tools
- Essential extensions must be installed early

**Download and Install:**

**Method 1: Website Download (Easier for beginners)**
1. Visit https://code.visualstudio.com
2. Download for your operating system
3. **Windows:** Run installer as Administrator (right-click → "Run as Administrator")
4. Use recommended settings during installation
5. Launch VS Code when installation completes

**Method 2: Command Line Installation (Gets you used to CLI)**
**Windows (PowerShell as Admin):**
```powershell
winget install Microsoft.VisualStudioCode
```

**Mac:**
```bash
brew install --cask visual-studio-code
```

**Linux (Ubuntu):**
```bash
sudo snap install --classic code
```

💡 **Both methods work perfectly - choose what feels more comfortable!**

⚠️ **IMPORTANT FOR WINDOWS USERS:** Before installing extensions, you MUST install WSL first (see next section). The Claude Code extension requires a Linux environment to function properly.

### 🐧 2. Windows Subsystem for Linux (WSL) - **INSTALL THIS FIRST!**

**⚠️ CRITICAL: You MUST run PowerShell as Administrator for ALL WSL commands!**

**Why WSL Must Be Installed BEFORE VS Code Extensions:**
- Claude CLI requires Linux environment to function
- VS Code WSL extension won't work without WSL installed first
- Claude Code extension needs WSL to operate properly on Windows

**Step-by-Step WSL Installation:**

**Step 1: Open PowerShell as Administrator**
- Press Windows key
- Type "PowerShell"
- Right-click "Windows PowerShell"
- Select "Run as Administrator"
- ⚠️ **If you don't see "Run as Administrator", your account lacks admin rights - contact your system administrator**

**Step 2: Enable WSL Features**
```powershell
# Enable Windows Subsystem for Linux
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform (required for WSL 2)
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

**Step 3: Restart Computer**
- **This restart is mandatory** - WSL won't work without it
- Save all work and restart now

**Step 4: Set WSL 2 as Default (After restart)**
- Open PowerShell as Administrator again
```powershell
wsl --set-default-version 2
```

**Step 5: Install Ubuntu Linux**
1. Open Microsoft Store (from Start Menu)
2. Search "Ubuntu 22.04 LTS"
3. Click "Install" (this may take 10-15 minutes)
4. Wait for "Launch" button to appear

**Step 6: Initial Ubuntu Setup**
1. Click "Launch" or find Ubuntu in Start Menu
2. Wait for "Installing, this may take a few minutes..."
3. Create username (lowercase only, no spaces):
   - Good: "johnsmith" or "webdev"  
   - Bad: "John Smith" or "user123!"
4. Create strong password (you'll need this often)
5. Confirm password

**Step 7: Update Ubuntu System**
```bash
sudo apt update && sudo apt upgrade -y
```

**Common WSL Issues and Solutions:**

*"WSL 2 requires an update to its kernel component"*
1. Go to: https://aka.ms/wsl2kernel
2. Download and install WSL2 Linux kernel update package
3. Restart computer

*"The requested operation could not be completed due to a virtual disk system limitation"*
1. Open "Turn Windows features on or off"
2. Enable "Hyper-V" 
3. Restart computer

*"Access denied" or "Permission denied"*
- You didn't run PowerShell as Administrator
- Start over with Administrator privileges

### 🎨 3. VS Code Extensions Installation (After WSL is Ready)

**Now that WSL is installed, you can safely install these extensions:**

⚠️ **Install Only These 4 Extensions** - Since Claude CLI handles most coding, we only need the essentials:

**🤖 1. Claude Code Extension (REQUIRED):**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search "Claude Code" 
   - Install the official Anthropic extension
   - This integrates AI assistance directly into your editor

**🐧 2. WSL Extension (Windows users only):**
   - Search "WSL"
   - Install "WSL" by Microsoft
   - Allows VS Code to work inside Linux environment

**✅ 3. ESLint (RECOMMENDED):**
   - Search "ESLint"
   - Install "ESLint" by Microsoft
   - Catches potential bugs and code issues automatically

**🎨 4. Prettier (RECOMMENDED):**
   - Search "Prettier"
   - Install "Prettier - Code formatter"
   - Keeps code clean and readable (helps Claude CLI work better)

**💡 Why So Few Extensions?**
Since Claude CLI writes most of your code, you don't need developer productivity tools like:
- ❌ JavaScript snippets (Claude writes the code for you)
- ❌ Auto-rename tags (rarely needed with AI assistance)
- ❌ Git visualization tools (basic git commands are sufficient)

**Start simple - add more extensions only if you find yourself needing specific functionality!**

### ⚡ 4. Node.js Installation

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

### 🔧 5. Git Installation and Configuration

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

**Step 1: Generate SSH Key**
```bash
ssh-keygen -t ed25519 -C "your-business@email.com"
```

**Step 2: Press Enter for All Prompts**
```bash
Enter file in which to save the key (/home/username/.ssh/id_ed25519): [Press Enter]
Enter passphrase (empty for no passphrase): [Press Enter]
Enter same passphrase again: [Press Enter]
```

You'll see output like this:
```bash
Your identification has been saved in /home/username/.ssh/id_ed25519
Your public key has been saved in /home/username/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:nswXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX your-business@email.com
```

**⚠️ IMPORTANT: The "SHA256:..." fingerprint is NOT what you copy to GitHub!**

**Step 3: Display and Copy Your ACTUAL Public Key**
```bash
cat ~/.ssh/id_ed25519.pub
```

**This will show your ACTUAL public key that looks like this:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJ your-business@email.com
```

**✅ Copy this ENTIRE line** (from `ssh-ed25519` all the way to your email)

**Your SSH key has three parts:**
1. **Key type:** `ssh-ed25519`
2. **The actual key:** Long random string like `AAAAC3Nza...`
3. **Your email:** `your-business@email.com` (identifies this key)

**Step 4: Add SSH Key to GitHub**
1. Go to GitHub.com and sign in
2. Click your profile picture (top-right) → Settings
3. In the left sidebar, click "SSH and GPG keys"
4. Click green "New SSH key" button
5. Title: "Development Machine - November 2025" (or current date)
6. Key type: Keep as "Authentication Key"
7. **Paste your entire public key** (the one from `cat ~/.ssh/id_ed25519.pub`)
8. Click "Add SSH key"

**Step 5: Test SSH Connection**
```bash
ssh -T git@github.com
```

**First time, you'll see:**
```
The authenticity of host 'github.com (IP)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Type `yes` and press Enter**

**Success message:**
```
Hi YourUsername! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ **Perfect! Your SSH key is set up correctly.**

### 🤖 6. Claude CLI Installation

**⚠️ Prerequisites Check:**
Before installing Claude CLI, ensure you have:
- Node.js installed (run `node --version` - should show v18+)
- WSL/Ubuntu set up (Windows users)
- Active terminal/command prompt

**Step-by-Step Installation:**

**Step 1: Install Claude CLI**
```bash
# Install globally using npm
npm install -g @anthropic-ai/claude-cli

# Verify installation worked
claude --version
```
*Should display version number (e.g., "1.0.0")*

**Step 2: Authentication Setup**
You'll need an Anthropic API key - we'll set this up when we create accounts in the next section.

**Professional Claude CLI Usage Tips:**

1. **Always work in project directories:**
```bash
cd /path/to/your/project
claude chat "Help me create a new React component"
```

2. **Use specific, detailed prompts:**
```bash
claude chat "Create a professional navbar component for a business website using Tailwind CSS"
```

3. **Reference existing files:**
```bash
claude chat "Review this component and suggest improvements" --file src/components/navbar.tsx
```

**VS Code Configuration:**

Set up professional development settings:

1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
2. Type "Preferences: Open Settings (JSON)"
3. Replace content with these optimized settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "Anthropic.claude-code",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "files.autoSave": "afterDelay",
  "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)"
}
```

## 🏢 1.3 Essential Account Creation

### 🤖 1. Anthropic Account (Claude CLI)
**Purpose:** AI-assisted development  
**URL:** https://console.anthropic.com  
**Business Email Required:** Yes

**Setup Steps:**
1. Visit console.anthropic.com
2. Email: Use same business email
3. Password: Generate unique strong password
4. Organization: Set to your business name
5. Generate API key for Claude CLI authentication

**Important Security Notes:**
- API keys are extremely sensitive - treat like passwords
- Never share API keys or commit them to code
- Regularly rotate API keys (monthly recommended)
- Store in password manager immediately after creation

**Configure Claude CLI Authentication:**

⚠️ **Windows Users:** Make sure you're in WSL/Ubuntu terminal, not Windows Command Prompt!

```bash
# Start authentication setup
claude auth login

# When prompted, paste your API key
# Press Enter to confirm
```

**Verify Claude CLI Setup:**

Test that everything is working:
```bash
# Basic test - should respond with helpful information
claude chat "Hello! Can you help me test that Claude CLI is working properly?"
```

### 🐙 2. GitHub Account
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

### 🌐 3. Netlify Account
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

### 📊 4. Airtable Account
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

### 💳 5. Stripe Account (Optional - Payment Processing)
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

## 🔒 1.4 Security Best Practices and Backup Strategies

### 🔐 Environment Variables and Token Management

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

### ⚠️ Environment Variable Security Rules

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

### 💾 Secure Backup Strategy

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

### 🔄 API Key Rotation Procedure

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

### 👁️ Security Monitoring

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