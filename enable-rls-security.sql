-- Enable Row Level Security on all tables
-- This is CRITICAL for protecting student and admin data

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on students table  
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Enable RLS on video_sessions table
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on consultations table
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on enrollments table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_users', 'students', 'video_sessions', 'consultations', 'enrollments', 'messages');

-- This should return 'true' for rowsecurity column on all tables