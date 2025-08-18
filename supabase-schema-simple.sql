-- Simple schema without trigger - manually create profiles
-- Run this in Supabase SQL Editor to create the tables

-- First, drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS jitsi_sessions CASCADE;
DROP TABLE IF EXISTS student_enrollments CASCADE;

-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_student_profile();

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  course_enrolled TEXT CHECK (course_enrolled IN ('Foundation', 'Premium', 'None')) DEFAULT 'None',
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Trial')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_login TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Admin' CHECK (role IN ('Super Admin', 'Admin', 'Support')),
  permissions TEXT[] DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jitsi sessions table for cohort meetings
CREATE TABLE jitsi_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 180,
  max_participants INTEGER DEFAULT 20,
  course_type TEXT CHECK (course_type IN ('Foundation', 'Premium', 'All')),
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Active', 'Completed', 'Cancelled')),
  meeting_password TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student enrollments junction table
CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID REFERENCES jitsi_sessions(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(student_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_jitsi_sessions_scheduled_for ON jitsi_sessions(scheduled_for);
CREATE INDEX idx_jitsi_sessions_status ON jitsi_sessions(status);
CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_session_id ON student_enrollments(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jitsi_sessions_updated_at BEFORE UPDATE ON jitsi_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Students table policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Students can only see their own data
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (auth.uid() = user_id);

-- Students can update their own data
CREATE POLICY "Students can update own data" ON students
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all students
CREATE POLICY "Admins can view all students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Admin users table policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can see all admin users
CREATE POLICY "Admins can view all admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Admins can update their own data
CREATE POLICY "Admins can update own data" ON admin_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Jitsi sessions policies
ALTER TABLE jitsi_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can view active sessions
CREATE POLICY "Everyone can view sessions" ON jitsi_sessions
    FOR SELECT USING (true);

-- Only admins can create/modify sessions
CREATE POLICY "Admins can manage sessions" ON jitsi_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Student enrollments policies
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can see their own enrollments
CREATE POLICY "Students can view own enrollments" ON student_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_enrollments.student_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can see all enrollments
CREATE POLICY "Admins can view all enrollments" ON student_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Insert your admin user (replace with your actual email)
-- This will create an admin user for your specific auth user ID
INSERT INTO admin_users (user_id, full_name, email, role) 
VALUES (
    '64ad2b22-d3fe-4159-9e55-75bd2ac11f61', -- Your hardcoded admin ID from useAuth.ts
    'Admin User',
    'admin@weblaunchcoach.com', -- Replace with your actual email
    'Super Admin'
) ON CONFLICT (user_id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;