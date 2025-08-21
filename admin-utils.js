const { createClient } = require('@supabase/supabase-js')

// Load from environment variables - NEVER hardcode credentials!
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables. Make sure .env.local is configured.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Utility functions for admin management
const AdminUtils = {
  
  // Check if email is an admin
  async isAdmin(email) {
    const { data } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()
    return !!data
  },
  
  // Check if email is a student
  async isStudent(email) {
    const { data } = await supabase
      .from('students')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()
    return !!data
  },
  
  // Add new admin (safely)
  async addAdmin(email, fullName, userId, role = 'Admin') {
    try {
      // Check if already a student
      if (await this.isStudent(email)) {
        throw new Error(`${email} is already a student. Cannot make them admin.`)
      }
      
      // Check if already an admin
      if (await this.isAdmin(email)) {
        console.log(`${email} is already an admin`)
        return null
      }
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          full_name: fullName,
          email: email.toLowerCase(),
          role: role,
          permissions: role === 'Super Admin' ? ['all'] : []
        })
        .select()
        .single()
      
      if (error) throw error
      
      console.log(`✅ Added admin: ${email}`)
      return data
      
    } catch (error) {
      console.error(`❌ Failed to add admin ${email}:`, error.message)
      throw error
    }
  },
  
  // Remove admin (safely)
  async removeAdmin(email) {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email.toLowerCase())
      
      if (error) throw error
      
      console.log(`✅ Removed admin: ${email}`)
      
    } catch (error) {
      console.error(`❌ Failed to remove admin ${email}:`, error.message)
      throw error
    }
  },
  
  // Convert student to admin
  async promoteStudentToAdmin(email, fullName, userId, role = 'Admin') {
    try {
      // Remove from students first
      await supabase
        .from('students')
        .delete()
        .eq('email', email.toLowerCase())
      
      // Add to admins
      await this.addAdmin(email, fullName, userId, role)
      
      console.log(`✅ Promoted ${email} from student to admin`)
      
    } catch (error) {
      console.error(`❌ Failed to promote ${email}:`, error.message)
      throw error
    }
  },
  
  // List all conflicts
  async checkConflicts() {
    const { data: admins } = await supabase
      .from('admin_users')
      .select('email')
    
    const { data: students } = await supabase
      .from('students')
      .select('email')
    
    const adminEmails = new Set(admins?.map(a => a.email) || [])
    const studentEmails = new Set(students?.map(s => s.email) || [])
    
    const conflicts = [...adminEmails].filter(email => studentEmails.has(email))
    
    return conflicts
  }
}

module.exports = AdminUtils

// If run directly, show current state
if (require.main === module) {
  async function showCurrentState() {
    console.log('📊 Current User State:')
    
    try {
      const conflicts = await AdminUtils.checkConflicts()
      
      if (conflicts.length > 0) {
        console.log('⚠️  CONFLICTS FOUND:', conflicts)
      } else {
        console.log('✅ No conflicts found')
      }
      
      const { data: admins } = await supabase
        .from('admin_users')
        .select('email, role')
      
      const { data: students } = await supabase
        .from('students')
        .select('email, course_enrolled')
      
      console.log('\n👨‍💼 Admins:', admins)
      console.log('\n👨‍🎓 Students:', students)
      
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  showCurrentState()
}