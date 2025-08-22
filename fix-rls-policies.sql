-- Fix RLS policies for admin_users and students tables
-- These policies allow users to access their own profiles

-- Admin users can see their own profile
CREATE POLICY "Admin users can view own profile"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);

-- Admin users can update their own profile
CREATE POLICY "Admin users can update own profile"
ON public.admin_users
FOR UPDATE
USING (auth.uid() = user_id);

-- Students can see their own profile
CREATE POLICY "Students can view own profile"
ON public.students
FOR SELECT
USING (auth.uid() = user_id);

-- Students can update their own profile
CREATE POLICY "Students can update own profile"
ON public.students
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow students to insert their own profile during signup
CREATE POLICY "Students can insert own profile"
ON public.students
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Super Admins can see all students (for admin panel)
CREATE POLICY "Super Admins can view all students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'Super Admin'
  )
);

-- Super Admins can update all students
CREATE POLICY "Super Admins can update all students"
ON public.students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'Super Admin'
  )
);