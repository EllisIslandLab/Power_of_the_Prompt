// Test script to verify testimonial API handles existing waitlist emails correctly
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/testimonials/submit';

// Test cases
const testCases = [
  {
    name: 'Test without email',
    data: {
      name: 'John Doe',
      testimonial: 'This is a great service! I love the approach and methodology.'
    }
  },
  {
    name: 'Test with new email (first submission)',
    data: {
      name: 'Jane Smith',
      testimonial: 'Amazing experience working with this team. Highly recommended!',
      email: 'new.user@example.com',
      title: 'Small Business Owner',
      avatar: '👩‍💼'
    }
  },
  {
    name: 'Test updating testimonial with same email',
    data: {
      name: 'Jane Smith',
      testimonial: 'Updated testimonial: Even more amazing than I initially thought! This service exceeded all my expectations.',
      email: 'new.user@example.com',
      title: 'CEO & Founder',
      avatar: '🚀'
    }
  },
  {
    name: 'Test with existing waitlist email',
    data: {
      name: 'Existing User',
      testimonial: 'Already on the waitlist but wanted to share my experience!',
      email: 'existing@example.com' // This should be an email that exists in waitlist
    }
  },
  {
    name: 'Test updating testimonial for waitlist user',
    data: {
      name: 'Existing User',
      testimonial: 'Updated testimonial from waitlist user: The anticipation is building and I can\'t wait for launch!',
      email: 'existing@example.com'
    }
  },
  {
    name: 'Security test: Try to update someone else\'s testimonial (should create new)',
    data: {
      name: 'Jane Smith', // Same name as previous user
      testimonial: 'This should create a new testimonial, not update Jane\'s existing one!',
      // Intentionally no email - should create new record, not update existing
    }
  }
];

async function runTests() {
  console.log('Testing Testimonial API...\n');

  for (const testCase of testCases) {
    console.log(`🧪 ${testCase.name}`);
    console.log(`Data:`, JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log(`✅ Success: ${result.message}`);
        if (result.existingWaitlistUser) {
          console.log(`ℹ️  Existing waitlist user detected`);
        }
        if (result.isUpdate) {
          console.log(`🔄 Operation: Testimonial was updated`);
        } else {
          console.log(`📝 Operation: New testimonial created`);
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

console.log('Make sure your development server is running on http://localhost:3000');
console.log('Run: npm run dev\n');

runTests().catch(console.error);