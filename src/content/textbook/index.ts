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
        title: "Essential Account Creation",
        subsections: [
          "GitHub Account",
          "Vercel Account", 
          "Airtable Account",
          "Anthropic Account (Claude CLI)",
          "Stripe Account"
        ]
      },
      {
        id: "1.3",
        title: "Development Environment Installation",
        subsections: [
          "System Requirements Check",
          "Windows Subsystem for Linux (WSL)",
          "Visual Studio Code Setup",
          "Node.js Installation",
          "Git Configuration",
          "Claude CLI Installation"
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
    id: "07",
    title: "Monthly Security and Maintenance",
    filePath: "/textbook/07-monthly-security-and-maintenance",
    sections: [
      {
        id: "7.1",
        title: "Monthly Security Practices",
        subsections: [
          "Security Key Rotation Schedule",
          "Environment Variable Security Audit",
          "Password and Account Security",
          "Security Monitoring and Alerts"
        ]
      },
      {
        id: "7.2",
        title: "Website Maintenance Practices",
        subsections: [
          "Monthly Content and Performance Review",
          "Dependency Updates and Security Patches",
          "Performance Optimization"
        ]
      },
      {
        id: "7.3",
        title: "User Experience Updates Without Sacrificing Familiarity",
        subsections: [
          "Strategic Website Updates",
          "User-Intuitive Design Updates",
          "Content Strategy Updates",
          "Maintaining Brand Consistency"
        ]
      },
      {
        id: "7.4",
        title: "Site Updates and Feature Enhancement",
        subsections: [
          "Feature Addition Strategy",
          "Safe Implementation Practices",
          "User Testing and Feedback",
          "Analytics and Performance Monitoring",
          "Backup and Recovery Procedures"
        ]
      }
    ]
  },
  {
    id: "08",
    title: "Long-term Success and Maintenance",
    filePath: "/textbook/08-long-term-success-and-maintenance",
    sections: [
      {
        id: "8.1",
        title: "Building Sustainable Business Systems",
        subsections: [
          "The 'Build Once, Own Forever' Philosophy",
          "Long-term Business Strategy",
          "Creating Lasting Value"
        ]
      },
      {
        id: "8.2",
        title: "Advanced Feature Development",
        subsections: [
          "Progressive Enhancement Strategy",
          "Modern Web Technologies Integration",
          "Advanced User Experience Features"
        ]
      },
      {
        id: "8.3",
        title: "Scaling Your Business Operations",
        subsections: [
          "Revenue Optimization Systems",
          "Client Relationship Management",
          "Team Building and Delegation"
        ]
      },
      {
        id: "8.4",
        title: "Future-Proofing Your Technology Stack",
        subsections: [
          "Staying Current with Web Technologies",
          "Preparing for Industry Changes",
          "Migration and Upgrade Strategies"
        ]
      },
      {
        id: "8.5",
        title: "Building a Sustainable Maintenance Routine",
        subsections: [
          "Quarterly Business Reviews",
          "Annual Technology Audits",
          "Long-term Asset Protection"
        ]
      },
      {
        id: "8.6",
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