-- Web Launch Academy Database Schema
-- Apply this to your new Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE public.students (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  course_enrolled text DEFAULT 'None' CHECK (course_enrolled IN ('Foundation', 'Premium', 'None')),
  enrollment_date timestamptz DEFAULT now(),
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
  payment_status text DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Trial')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_login timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admin_users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'Admin' CHECK (role IN ('Super Admin', 'Admin', 'Support')),
  permissions text[] DEFAULT '{}',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Video sessions table
CREATE TABLE public.video_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_name text NOT NULL,
  jitsi_room_id text NOT NULL,
  host_user_id uuid NOT NULL REFERENCES auth.users(id),
  participant_user_ids uuid[] DEFAULT '{}',
  session_type text DEFAULT 'FREE_CONSULTATION' CHECK (session_type IN ('FREE_CONSULTATION', 'PAID_SESSION', 'GROUP_COACHING', 'WORKSHOP', 'OFFICE_HOURS')),
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  actual_start timestamptz,
  actual_end timestamptz,
  stripe_payment_intent_id text,
  session_status text DEFAULT 'SCHEDULED' CHECK (session_status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  meeting_notes text,
  recording_url text,
  jitsi_config jsonb,
  waiting_room_enabled boolean DEFAULT false,
  max_participants integer,
  consultation_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consultations table
CREATE TABLE public.consultations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  scheduled_time timestamptz NOT NULL,
  status text DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
  notes text,
  type text NOT NULL CHECK (type IN ('FREE', 'PREMIUM')),
  video_session_id uuid REFERENCES public.video_sessions(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  course_type text NOT NULL CHECK (course_type IN ('STANDARD', 'PREMIUM')),
  payment_status text DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED')),
  start_date timestamptz DEFAULT now(),
  completion_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id uuid NOT NULL REFERENCES auth.users(id),
  to_user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  thread_id uuid,
  read_status boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_email ON public.students(email);
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_video_sessions_host ON public.video_sessions(host_user_id);
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX idx_messages_to_user ON public.messages(to_user_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_video_sessions_updated_at BEFORE UPDATE ON public.video_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (Enable but don't add policies yet)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;