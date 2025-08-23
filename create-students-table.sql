-- Create students table with email verification
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires_at TIMESTAMP WITH TIME ZONE,
  course_enrolled VARCHAR(50) DEFAULT 'None' CHECK (course_enrolled IN ('Foundation', 'Premium', 'None')),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
  payment_status VARCHAR(20) DEFAULT 'Trial' CHECK (payment_status IN ('Paid', 'Pending', 'Trial')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_students_email ON public.students(email);

-- Create an index on verification token
CREATE INDEX idx_students_verification_token ON public.students(email_verification_token);

-- Enable RLS (Row Level Security) 
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow students to view their own profile
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (id = current_setting('app.current_student_id')::uuid);

-- Allow students to update their own profile  
CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE USING (id = current_setting('app.current_student_id')::uuid);

-- Allow public signup (insert)
CREATE POLICY "Anyone can signup" ON public.students
  FOR INSERT WITH CHECK (true);

-- Show the table structure
\d public.students;