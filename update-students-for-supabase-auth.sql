-- Update students table to work with Supabase auth
-- Run this in Supabase SQL Editor

-- First, drop the existing table if you want to start fresh
DROP TABLE IF EXISTS public.students CASCADE;

-- Create updated students table that works with Supabase auth
CREATE TABLE public.students (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  course_enrolled VARCHAR(50) DEFAULT 'None' CHECK (course_enrolled IN ('Foundation', 'Premium', 'None')),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
  payment_status VARCHAR(20) DEFAULT 'Trial' CHECK (payment_status IN ('Paid', 'Pending', 'Trial')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_students_email ON public.students(email);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- Allow signup process to insert profiles
CREATE POLICY "Enable insert for authenticated users" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to automatically create student profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.students (id, full_name, email, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create student profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Show the updated table structure
\d public.students;