export interface Chapter {
  id: string
  title: string
  sections: Section[]
  filePath: string
}

export interface Section {
  id: string
  title: string
  subsections?: string[]
}

export const textbookChapters: Chapter[] = [
  {
    id: "00",
    title: "Business Foundation Before Building",
    filePath: "/textbook/00-business-foundation",
    sections: [
      {
        id: "0.1",
        title: "Business Structure: LLC Formation",
        subsections: [
          "Why Form an LLC",
          "How to Form Your LLC",
          "LLC Operating Agreement",
          "State-Specific Considerations"
        ]
      },
      {
        id: "0.2",
        title: "Employer Identification Number (EIN)",
        subsections: [
          "Why You Need an EIN",
          "How to Get Your EIN (It's Free!)",
          "What Information You'll Need",
          "Using Your EIN"
        ]
      },
      {
        id: "0.3",
        title: "Business Banking",
        subsections: [
          "Why Separate Business Banking Matters",
          "Choosing a Business Bank",
          "What You'll Need to Open an Account",
          "Best Practices for Business Banking"
        ]
      },
      {
        id: "0.4",
        title: "Professional Email and Communication",
        subsections: [
          "Why Professional Email Matters",
          "Domain-Based Email Setup",
          "Free vs. Paid Email Solutions",
          "Email Best Practices"
        ]
      },
      {
        id: "0.5",
        title: "Phone System",
        subsections: [
          "Why a Dedicated Business Number Matters",
          "Professional Phone Options",
          "Best Practices"
        ]
      },
      {
        id: "0.6",
        title: "Domain Registration Strategy",
        subsections: [
          "Choosing Your Domain Name",
          "Domain Registration Best Practices",
          "Where to Register Your Domain"
        ]
      },
      {
        id: "0.7",
        title: "Payment Processing Setup",
        subsections: [
          "Why You Need Payment Processing",
          "Stripe Account Setup",
          "Best Practices"
        ]
      },
      {
        id: "0.8",
        title: "The Complete Business Foundation Checklist",
        subsections: [
          "Your Business Foundation Roadmap",
          "Cost Breakdown",
          "Timeline Expectations"
        ]
      }
    ]
  },
  {
    id: "01",
    title: "Accounts and Installations",
    filePath: "/textbook/01-accounts-and-installations",
    sections: [
      {
        id: "1.1",
        title: "Account Setup Strategy and Security",
        subsections: [
          "Password Security Foundation",
          "Account Security Checklist"
        ]
      },
      {
        id: "1.2",
        title: "System Requirements and Software Installation",
        subsections: [
          "System Requirements Check",
          "Visual Studio Code Installation and Configuration",
          "Windows Subsystem for Linux (WSL)",
          "VS Code Extensions Installation",
          "Node.js Installation",
          "Git Installation and Configuration",
          "Claude CLI Installation"
        ]
      },
      {
        id: "1.3",
        title: "Essential Account Creation",
        subsections: [
          "Anthropic Account (Claude CLI)",
          "GitHub Account",
          "Netlify Account", 
          "Airtable Account",
          "Stripe Account"
        ]
      },
      {
        id: "1.4",
        title: "Security Best Practices and Backup Strategies",
        subsections: [
          "Environment Variables and Token Management",
          "Secure Backup Strategy",
          "API Key Rotation Procedure",
          "Security Monitoring"
        ]
      }
    ]
  },
  {
    id: "02",
    title: "Understanding Modern Web Development",
    filePath: "/textbook/02-understanding-modern-web-development",
    sections: [
      {
        id: "2.1",
        title: "Next.js vs Traditional Web Development",
        subsections: [
          "The Evolution of Web Development",
          "Why Next.js is Superior",
          "Technical Comparison"
        ]
      },
      {
        id: "2.2",
        title: "The Professional Development Stack",
        subsections: [
          "Understanding the Complete Technology Stack",
          "Project Structure and Organization",
          "Component-Based Architecture"
        ]
      },
      {
        id: "2.3",
        title: "AI-Assisted Development with Claude CLI",
        subsections: [
          "Understanding AI-Powered Development",
          "Effective Communication with Claude CLI",
          "Iterative Development Process",
          "Understanding Generated Code"
        ]
      }
    ]
  },
  {
    id: "03",
    title: "Database Design and Airtable Mastery",
    filePath: "/textbook/03-database-design-and-airtable-mastery",
    sections: [
      {
        id: "3.1",
        title: "Database Fundamentals for Web Development",
        subsections: [
          "Understanding Databases",
          "Airtable as a Business Database",
          "Database Design Principles"
        ]
      },
      {
        id: "3.2",
        title: "Airtable Setup and Configuration",
        subsections: [
          "Creating Your Business Database",
          "Universal Database Schema",
          "Field Configuration Best Practices",
          "Form Creation for Data Collection"
        ]
      },
      {
        id: "3.3",
        title: "API Integration and Security",
        subsections: [
          "Understanding Airtable API",
          "Generating and Managing API Keys",
          "Base and Table IDs"
        ]
      },
      {
        id: "3.4",
        title: "Environment Variables and Token Management",
        subsections: [
          "Understanding Environment Variables",
          "Consistent Naming Convention",
          "Local Development Setup",
          "Production Environment Variables",
          "Security and Backup Strategy"
        ]
      }
    ]
  },
  {
    id: "04",
    title: "Claude CLI and AI-Powered Development",
    filePath: "/textbook/04-claude-cli-and-ai-powered-development",
    sections: [
      {
        id: "4.1",
        title: "Understanding AI-Assisted Development",
        subsections: [
          "The Revolution of AI in Web Development",
          "How Claude CLI Transforms Development",
          "AI Development Best Practices"
        ]
      },
      {
        id: "4.2",
        title: "Master Prompt Creation",
        subsections: [
          "Understanding Master Prompts",
          "Universal E-commerce/Services Master Prompt",
          "Customizing for Different Business Types"
        ]
      },
      {
        id: "4.3",
        title: "Iterative Development with Claude",
        subsections: [
          "The Iterative Development Process",
          "Effective Iteration Strategies",
          "Debugging and Problem Solving",
          "Progressive Enhancement Approach"
        ]
      },
      {
        id: "4.4",
        title: "Code Review and Optimization",
        subsections: [
          "Understanding Generated Code",
          "Code Quality Checklist",
          "Optimization Requests",
          "Testing and Quality Assurance",
          "Documentation and Maintenance"
        ]
      }
    ]
  },
  {
    id: "05",
    title: "Domain Management and Professional Hosting",
    filePath: "/textbook/05-domain-management-and-professional-hosting",
    sections: [
      {
        id: "5.1",
        title: "Domain Strategy and DNS Fundamentals",
        subsections: [
          "Understanding Domains and DNS",
          "Domain Strategy for Business Success",
          "DNS Fundamentals",
          "Domain Registrar Selection"
        ]
      },
      {
        id: "5.2",
        title: "Professional Email Setup",
        subsections: [
          "Why Professional Email Matters",
          "Professional Email Options",
          "Email Account Structure",
          "MX Record Configuration",
          "Email Security and Best Practices"
        ]
      },
      {
        id: "5.3",
        title: "Vercel Deployment and Configuration",
        subsections: [
          "Why Vercel for Business Websites",
          "Vercel Account Setup and Configuration",
          "Connecting GitHub to Vercel",
          "Environment Variables in Vercel",
          "Custom Domain Configuration"
        ]
      },
      {
        id: "5.4",
        title: "SSL Certificates and Security",
        subsections: [
          "Understanding SSL/TLS Security",
          "SSL Certificate Types",
          "Security Headers and Configuration",
          "Website Security Best Practices",
          "Security Monitoring and Maintenance"
        ]
      }
    ]
  },
  {
    id: "06",
    title: "Professional Development Workflows",
    filePath: "/textbook/06-professional-development-workflows",
    sections: [
      {
        id: "6.1",
        title: "Advanced Git and GitHub Workflows",
        subsections: [
          "Professional Git Workflow Strategy",
          "Branch Management Strategy", 
          "Professional Commit Message Standards"
        ]
      },
      {
        id: "6.2",
        title: "Repository Organization and Security",
        subsections: [
          "Professional Repository Structure",
          "Essential Repository Documentation",
          "Repository Security Configuration"
        ]
      },
      {
        id: "6.3",
        title: "Automated Deployment and CI/CD",
        subsections: [
          "GitHub Actions for Professional Deployment",
          "Vercel Deployment Configuration",
          "Deploy Preview and Testing Strategy"
        ]
      },
      {
        id: "6.4",
        title: "Professional Development Practices",
        subsections: [
          "Code Review Process",
          "Performance and Quality Monitoring",
          "Team Collaboration Standards"
        ]
      }
    ]
  },
  {
    id: "07",
    title: "Payment Services and E-commerce Integration",
    filePath: "/textbook/07-payment-services-and-ecommerce-integration",
    sections: [
      {
        id: "7.1",
        title: "Understanding Modern Payment Processing",
        subsections: [
          "Why Payment Integration Matters for Business",
          "Stripe vs Traditional Payment Processors",
          "Security and PCI Compliance"
        ]
      },
      {
        id: "7.2",
        title: "Airtable Services Database Design",
        subsections: [
          "Services Table Architecture",
          "Pricing Field Configuration Best Practices",
          "Managing Service Types and Categories",
          "Inventory and Availability Management"
        ]
      },
      {
        id: "7.3",
        title: "Stripe Integration and Synchronization",
        subsections: [
          "Automatic Product and Price Sync",
          "Webhook Configuration and Processing",
          "Payment Intent Creation and Handling",
          "Error Handling and Recovery"
        ]
      },
      {
        id: "7.4",
        title: "Advanced Pricing and Discount Strategies",
        subsections: [
          "Dynamic Pricing Models",
          "Discount and Coupon Systems",
          "Promotional Pricing Strategies",
          "Tax and Multi-Currency Considerations"
        ]
      },
      {
        id: "7.5",
        title: "Customer Experience and Conversion Optimization",
        subsections: [
          "Payment Flow User Experience",
          "Trust Signals and Security Display",
          "Mobile Payment Optimization",
          "Cart Abandonment Recovery"
        ]
      }
    ]
  },
  {
    id: "08",
    title: "Security, Maintenance, and Long-term Success",
    filePath: "/textbook/08-long-term-success-and-maintenance",
    sections: [
      {
        id: "8.1",
        title: "Monthly Security Practices",
        subsections: [
          "Security Key Rotation Schedule",
          "Environment Variable Security Audit",
          "Password and Account Security",
          "Security Monitoring and Alerts"
        ]
      },
      {
        id: "8.2",
        title: "Website Maintenance Practices",
        subsections: [
          "Monthly Content and Performance Review",
          "Dependency Updates and Security Patches",
          "Performance Optimization"
        ]
      },
      {
        id: "8.3",
        title: "User Experience Updates Without Sacrificing Familiarity",
        subsections: [
          "Strategic Website Updates",
          "User-Intuitive Design Updates",
          "Content Strategy Updates",
          "Maintaining Brand Consistency"
        ]
      },
      {
        id: "8.4",
        title: "Site Updates and Feature Enhancement",
        subsections: [
          "Feature Addition Strategy",
          "Safe Implementation Practices",
          "User Testing and Feedback",
          "Analytics and Performance Monitoring",
          "Backup and Recovery Procedures"
        ]
      },
      {
        id: "8.5",
        title: "Building Sustainable Business Systems",
        subsections: [
          "The 'Build Once, Own Forever' Philosophy",
          "Long-term Business Strategy",
          "Creating Lasting Value"
        ]
      },
      {
        id: "8.6",
        title: "Advanced Feature Development",
        subsections: [
          "Progressive Enhancement Strategy",
          "Modern Web Technologies Integration",
          "Advanced User Experience Features"
        ]
      },
      {
        id: "8.7",
        title: "Scaling Your Business Operations",
        subsections: [
          "Revenue Optimization Systems",
          "Client Relationship Management",
          "Team Building and Delegation"
        ]
      },
      {
        id: "8.8",
        title: "Future-Proofing Your Technology Stack",
        subsections: [
          "Staying Current with Web Technologies",
          "Preparing for Industry Changes",
          "Migration and Upgrade Strategies"
        ]
      },
      {
        id: "8.9",
        title: "Building a Sustainable Maintenance Routine",
        subsections: [
          "Quarterly Business Reviews",
          "Annual Technology Audits",
          "Long-term Asset Protection"
        ]
      },
      {
        id: "8.10",
        title: "Measuring Long-term Success",
        subsections: [
          "Key Performance Indicators (KPIs)",
          "Success Milestone Framework",
          "Continuous Improvement Process"
        ]
      }
    ]
  }
]

export const getChapterByPath = (path: string): Chapter | undefined => {
  return textbookChapters.find(chapter => chapter.filePath === path)
}

export const getNextChapter = (currentChapterId: string): Chapter | undefined => {
  const currentIndex = textbookChapters.findIndex(chapter => chapter.id === currentChapterId)
  return currentIndex >= 0 && currentIndex < textbookChapters.length - 1 
    ? textbookChapters[currentIndex + 1] 
    : undefined
}

export const getPreviousChapter = (currentChapterId: string): Chapter | undefined => {
  const currentIndex = textbookChapters.findIndex(chapter => chapter.id === currentChapterId)
  return currentIndex > 0 
    ? textbookChapters[currentIndex - 1] 
    : undefined
}