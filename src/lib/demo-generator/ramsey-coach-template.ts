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
      background: linear-gradient(to bottom, rgba(${hexToRgb(colors.primary)}, 0.05), white);
      padding: 5rem 2rem;
    }

    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-content h1 {
      color: var(--primary);
      font-size: 3rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .hero-content p {
      color: var(--text-light);
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      line-height: 1.8;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .btn-accent {
      background: var(--accent);
      color: var(--text-dark);
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-accent:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .trust-indicators {
      display: flex;
      gap: 2rem;
      margin-top: 3rem;
      flex-wrap: wrap;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .trust-icon {
      color: var(--accent);
      font-size: 1.5rem;
    }

    .hero-image {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      aspect-ratio: 4/3;
    }

    .hero-image-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(${hexToRgb(colors.primary)}, 0.2), rgba(${hexToRgb(colors.accent)}, 0.2), rgba(${hexToRgb(colors.secondary)}, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 3rem;
      text-align: center;
    }

    .hero-image-placeholder svg {
      width: 120px;
      height: 120px;
      margin-bottom: 1.5rem;
      opacity: 0.5;
      color: var(--primary);
    }

    .hero-image-placeholder h3 {
      color: var(--primary);
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .hero-image-placeholder p {
      color: var(--text-light);
      font-size: 0.95rem;
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

    /* Testimonials Section */
    .testimonials {
      background: var(--gray-light);
    }

    .testimonial-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 4rem;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
    }

    .quote-icon {
      font-size: 3rem;
      color: var(--accent);
      margin-bottom: 1.5rem;
    }

    .testimonial-text {
      font-size: 1.3rem;
      color: var(--text-dark);
      line-height: 1.8;
      margin-bottom: 2rem;
      font-style: italic;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .testimonial-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .testimonial-info h4 {
      color: var(--text-dark);
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }

    .testimonial-info p {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    /* Booking CTA Section */
    .booking-cta {
      background: var(--primary);
      color: white;
      text-align: center;
    }

    .booking-cta h2 {
      color: white;
    }

    .booking-cta-intro {
      font-size: 1.3rem;
      max-width: 700px;
      margin: 0 auto 3rem;
      opacity: 0.95;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .benefit-card {
      background: rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 12px;
      text-align: left;
      backdrop-filter: blur(10px);
    }

    .benefit-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .benefit-card h3 {
      color: white;
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
    }

    .benefit-card p {
      color: rgba(255,255,255,0.9);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .booking-cta-button {
      background: var(--accent);
      color: var(--text-dark);
      padding: 1.25rem 3rem;
      font-size: 1.2rem;
      font-weight: 700;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: pulse 2s infinite;
    }

    .booking-cta-button:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }

    .booking-availability {
      margin-top: 2rem;
      opacity: 0.9;
      font-size: 0.95rem;
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
      width: 50px;
      height: 50px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.5rem;
    }

    .contact-item-content h3 {
      color: var(--primary);
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .contact-item-content p {
      color: var(--text-light);
      font-size: 1.05rem;
    }

    .contact-form {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--primary);
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    .form-group textarea {
      min-height: 140px;
      resize: vertical;
    }

    /* Footer */
    footer {
      background: var(--text-dark);
      color: white;
      text-align: center;
      padding: 3rem 2rem;
    }

    footer p {
      opacity: 0.9;
    }

    footer p:first-child {
      font-size: 1.05rem;
      margin-bottom: 0.75rem;
    }

    /* Feature Upgrade Modal */
    .feature-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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

    .feature-modal-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .feature-modal-buttons .btn-primary {
      width: 100%;
      background: var(--primary);
    }

    .feature-modal-buttons .btn-accent {
      width: 100%;
      animation: pulse 2s infinite;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .hero-content {
        order: 2;
        text-align: center;
      }

      .hero-image {
        order: 1;
      }

      .hero-content h1 {
        font-size: 2.2rem;
      }

      .hero-buttons {
        justify-content: center;
      }

      .trust-indicators {
        justify-content: center;
      }

      .nav-links {
        gap: 1rem;
        font-size: 0.9rem;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .testimonial-container {
        padding: 2.5rem 1.5rem;
      }

      .testimonial-text {
        font-size: 1.1rem;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }

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
</head>
<body>
  <!-- Header -->
  <header>
    <nav>
      <div class="logo">${businessName}</div>
      <ul class="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
        <li><a href="#booking">Book Now</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <!-- Hero Section with About Me -->
  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <h1>Take Control of Your Financial Future</h1>
        <p>
          ${tagline || 'As a Ramsey Preferred Coach, I\'m dedicated to helping you build a solid financial foundation, eliminate debt, and create lasting wealth for generations to come.'}
        </p>
        <p>
          Whether you're just starting your financial journey or looking to optimize your path to financial freedom, I'm here to guide you every step of the way with proven principles and personalized coaching.
        </p>

        <div class="hero-buttons">
          <button class="btn-primary" onclick="showStoryModal()">My Story</button>
          <a href="#booking" class="btn-accent">Book Free Consultation</a>
        </div>

        <div class="trust-indicators">
          <div class="trust-item">
            <span class="trust-icon">✓</span>
            <span><strong>Ramsey Preferred Coach</strong></span>
          </div>
          <div class="trust-item">
            <span class="trust-icon">★</span>
            <span><strong>Certified Financial Coach</strong></span>
          </div>
        </div>
      </div>

      <div class="hero-image">
        <div class="hero-image-placeholder">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>[Your Photo Here]</h3>
          <p>Replace with a professional photo representing financial wellness and trust</p>
        </div>
      </div>
    </div>
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

  <!-- Testimonials Section -->
  <section id="testimonials" class="testimonials">
    <h2>What My Clients Say</h2>
    <div class="testimonial-container">
      <div class="quote-icon">"</div>
      <p class="testimonial-text">
        Working with this coach completely transformed our financial life! We paid off $45,000 in debt in just 18 months and now have a fully funded emergency fund. The guidance and accountability were exactly what we needed to stay on track with the Baby Steps.
      </p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">SJ</div>
        <div class="testimonial-info">
          <h4>Sarah Johnson</h4>
          <p>Verified Client</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Booking CTA Section -->
  <section id="booking" class="booking-cta">
    <h2>Ready to Take Control of Your Finances?</h2>
    <p class="booking-cta-intro">
      Schedule your free 30-minute consultation today and take the first step toward financial peace. Let's work together to create a personalized plan that fits your unique situation and goals.
    </p>

    <div class="benefits-grid">
      <div class="benefit-card">
        <div class="benefit-icon">✓</div>
        <h3>No Obligation</h3>
        <p>Your first consultation is completely free with no commitment required.</p>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">📋</div>
        <h3>Personalized Plan</h3>
        <p>Get a custom financial roadmap tailored to your specific situation.</p>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🎯</div>
        <h3>Proven Method</h3>
        <p>Follow the time-tested Ramsey Baby Steps to achieve financial freedom.</p>
      </div>
    </div>

    <button class="booking-cta-button" onclick="showFeatureModal()">
      Book Your Free Consultation
    </button>

    <p class="booking-availability">Available Monday - Friday, 8:00 AM - 5:00 PM EST</p>
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
          <button type="submit" class="btn-primary" style="width: 100%;">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    <p style="margin-top: 0.75rem; opacity: 0.8;">Ramsey Preferred Coach</p>
  </footer>

  <!-- Feature Modal -->
  <div id="featureModal" class="feature-modal">
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
      <div class="feature-modal-buttons">
        <button class="btn-primary" onclick="window.open('/portal/store', '_blank')">
          📚 Get Code & Walkthrough Guide ($9)
        </button>
        <button class="btn-accent" onclick="window.open('https://calendly.com/weblaunchacademy', '_blank')">
          📅 Book Free Consultation
        </button>
      </div>
      <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7; text-align: center;">
        Code expires in 24 hours • Guide shows you how to deploy & connect everything
      </p>
    </div>
  </div>

  <!-- Story Modal -->
  <div id="storyModal" class="feature-modal">
    <div class="feature-modal-overlay" onclick="closeStoryModal()"></div>
    <div class="feature-modal-content">
      <button class="feature-modal-close" onclick="closeStoryModal()">&times;</button>
      <div class="feature-modal-icon">📖</div>
      <h3>My Story</h3>
      <p class="feature-modal-text">
        [Your personal story goes here - share your journey to financial freedom, what motivated you to become a Ramsey Preferred Coach, and how you help others achieve the same success.]
      </p>
      <p class="feature-modal-subtext">
        This is where you can connect with potential clients by sharing your authentic experience with financial transformation.
      </p>
      <div class="feature-modal-buttons">
        <a href="#booking" class="btn-accent" onclick="closeStoryModal()">Book a Consultation</a>
      </div>
    </div>
  </div>

  <script>
    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
      const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
      return result
        ? \`\${parseInt(result[1], 16)}, \${parseInt(result[2], 16)}, \${parseInt(result[3], 16)}\`
        : '0, 0, 0';
    }

    // Feature modal functions
    function showFeatureModal() {
      document.getElementById('featureModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeFeatureModal() {
      document.getElementById('featureModal').style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    // Story modal functions
    function showStoryModal() {
      document.getElementById('storyModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeStoryModal() {
      document.getElementById('storyModal').style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    // Close modals on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeFeatureModal();
        closeStoryModal();
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

// Helper function to convert hex to RGB for gradients
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}
