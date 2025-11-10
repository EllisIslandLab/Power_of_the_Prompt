interface Service {
  title: string
  description: string
}

interface TemplateData {
  businessName: string
  tagline?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  businessContactEmail?: string
  services: Service[]
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export function generateRamseyCoachHTML(data: TemplateData): string {
  const {
    businessName,
    tagline,
    phone,
    address,
    city,
    state,
    zip,
    businessContactEmail,
    services,
    colors,
  } = data

  // Format address
  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ')

  // Generate calendar slots (static demo)
  const generateCalendarSlots = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const times = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']

    return days.map(day => {
      return `
        <div class="calendar-day">
          <h4>${day}</h4>
          <div class="time-slots">
            ${times.map(time => `
              <button class="time-slot" onclick="showFeatureModal()">
                ${time}
              </button>
            `).join('')}
          </div>
        </div>
      `
    }).join('')
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} | Financial Coaching</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --text-dark: #1a1a1a;
      --text-light: #666;
      --background: #ffffff;
      --gray-light: #f5f5f5;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-dark);
      background: var(--background);
    }

    /* Header */
    header {
      background: var(--primary);
      color: white;
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    nav {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
    }

    .nav-links a:hover {
      opacity: 0.8;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: white;
      padding: 6rem 2rem;
      text-align: center;
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .hero p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .cta-button {
      background: var(--secondary);
      color: var(--text-dark);
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    /* Sections */
    section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 5rem 2rem;
    }

    h2 {
      font-size: 2.5rem;
      margin-bottom: 3rem;
      text-align: center;
      color: var(--primary);
    }

    /* Services */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .service-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      border-top: 4px solid var(--accent);
    }

    .service-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .service-card h3 {
      color: var(--primary);
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .service-card p {
      color: var(--text-light);
      line-height: 1.8;
    }

    /* About Section */
    .about {
      background: var(--gray-light);
    }

    .about-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      line-height: 1.8;
      color: var(--text-light);
      font-size: 1.1rem;
    }

    /* Calendar Section */
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .calendar-day {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .calendar-day h4 {
      color: var(--primary);
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .time-slots {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .time-slot {
      background: var(--gray-light);
      border: 2px solid var(--secondary);
      color: var(--text-dark);
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .time-slot:hover {
      background: var(--secondary);
      transform: translateX(5px);
    }

    .calendar-note {
      text-align: center;
      margin-top: 2rem;
      padding: 1rem;
      background: var(--secondary);
      border-radius: 8px;
      font-weight: 500;
    }

    /* Contact Section */
    .contact {
      background: var(--gray-light);
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-top: 2rem;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .contact-item {
      display: flex;
      align-items: start;
      gap: 1rem;
    }

    .contact-item-icon {
      width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .contact-item-content h3 {
      color: var(--primary);
      margin-bottom: 0.25rem;
    }

    .contact-item-content p {
      color: var(--text-light);
    }

    .contact-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--primary);
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    .form-group textarea {
      min-height: 120px;
      resize: vertical;
    }

    /* Footer */
    footer {
      background: var(--primary);
      color: white;
      text-align: center;
      padding: 2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }

      .hero p {
        font-size: 1.2rem;
      }

      .nav-links {
        gap: 1rem;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .calendar-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <nav>
      <div class="logo">${businessName}</div>
      <ul class="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#calendar">Schedule</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <h1>${businessName}</h1>
    ${tagline ? `<p>${tagline}</p>` : ''}
    <a href="#calendar" class="cta-button">Schedule Your Free Consultation</a>
  </section>

  <!-- Services Section -->
  <section id="services">
    <h2>Our Services</h2>
    <div class="services-grid">
      ${services.map(service => `
        <div class="service-card">
          <h3>${service.title}</h3>
          <p>${service.description}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="about">
    <h2>About Us</h2>
    <div class="about-content">
      <p>
        As a Ramsey Preferred Coach, I'm committed to helping you take control of your finances
        and build lasting wealth. Whether you're struggling with debt, planning for retirement,
        or looking to optimize your financial strategy, I'm here to guide you every step of the way.
      </p>
      <p style="margin-top: 1rem;">
        Using proven principles and personalized coaching, we'll work together to create a financial
        plan that works for your unique situation and helps you achieve your money goals.
      </p>
    </div>
  </section>

  <!-- Calendar Section -->
  <section id="calendar">
    <h2>Schedule Your Consultation</h2>
    <div class="calendar-note">
      📅 Click any time slot below to book your free 30-minute consultation
    </div>
    <div class="calendar-grid">
      ${generateCalendarSlots()}
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="contact">
    <h2>Get In Touch</h2>
    <div class="contact-grid">
      <div class="contact-info">
        ${phone ? `
          <div class="contact-item">
            <div class="contact-item-icon">📞</div>
            <div class="contact-item-content">
              <h3>Phone</h3>
              <p>${phone}</p>
            </div>
          </div>
        ` : ''}

        ${businessContactEmail ? `
          <div class="contact-item">
            <div class="contact-item-icon">✉️</div>
            <div class="contact-item-content">
              <h3>Email</h3>
              <p>${businessContactEmail}</p>
            </div>
          </div>
        ` : ''}

        ${fullAddress ? `
          <div class="contact-item">
            <div class="contact-item-icon">📍</div>
            <div class="contact-item-content">
              <h3>Location</h3>
              <p>${fullAddress}</p>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="contact-form">
        <form onsubmit="showFeatureModal(); return false;">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" required></textarea>
          </div>
          <button type="submit" class="cta-button" style="width: 100%;">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Feature Upgrade Modal -->
  <div id="featureModal" class="feature-modal" style="display: none;">
    <div class="feature-modal-overlay" onclick="closeFeatureModal()"></div>
    <div class="feature-modal-content">
      <button class="feature-modal-close" onclick="closeFeatureModal()">&times;</button>
      <div class="feature-modal-icon">🚀</div>
      <h3>Unlock Full Functionality</h3>
      <p class="feature-modal-text">
        These features require connection to external services (calendars, email, Airtable databases, and more).
      </p>
      <p class="feature-modal-highlight">
        <strong>📌 Important:</strong> Your demo code is stored for only 24 hours!
      </p>
      <p class="feature-modal-subtext">
        Full functionality can be achieved by following the steps in our <strong>Walkthrough Guide</strong>.
        Purchase the guide to get your generated code and learn how to deploy it with real integrations.
      </p>
      <p class="feature-modal-subtext" style="margin-top: 0.5rem; font-size: 0.9rem;">
        Or book a free consultation to discuss having us build it for you with everything connected.
      </p>
      <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="cta-button" style="width: 100%; background: var(--primary); color: white;" onclick="window.open('/portal/store', '_blank')">
          📚 Get Code & Walkthrough Guide ($9)
        </button>
        <button class="cta-button" style="width: 100%; animation: pulse 2s infinite;" onclick="window.open('https://calendly.com/weblaunchacademy', '_blank')">
          📅 Book Free Consultation
        </button>
      </div>
      <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7; text-align: center;">
        Code expires in 24 hours • Guide shows you how to deploy & connect everything
      </p>
    </div>
  </div>

  <!-- Footer -->
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    <p style="margin-top: 0.5rem; opacity: 0.8;">Ramsey Preferred Coach</p>
  </footer>

  <style>
    /* Feature Modal Styles */
    .feature-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
      50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
    }

    .feature-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
    }

    .feature-modal-content {
      position: relative;
      background: white;
      border-radius: 20px;
      padding: 3rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
      text-align: center;
    }

    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .feature-modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 2rem;
      color: #999;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transition: all 0.3s;
    }

    .feature-modal-close:hover {
      background: #f5f5f5;
      color: #333;
      transform: rotate(90deg);
    }

    .feature-modal-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .feature-modal-content h3 {
      color: var(--primary);
      font-size: 1.75rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .feature-modal-text {
      color: var(--text-light);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 1rem;
    }

    .feature-modal-highlight {
      background: var(--secondary);
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      font-size: 0.95rem;
      border: 2px solid var(--accent);
    }

    .feature-modal-subtext {
      color: var(--text-dark);
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .feature-modal-content {
        padding: 2rem 1.5rem;
      }

      .feature-modal-icon {
        font-size: 3rem;
      }

      .feature-modal-content h3 {
        font-size: 1.5rem;
      }
    }
  </style>

  <script>
    // Feature modal functions
    function showFeatureModal() {
      document.getElementById('featureModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeFeatureModal() {
      document.getElementById('featureModal').style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeFeatureModal();
      }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  </script>
</body>
</html>`
}
