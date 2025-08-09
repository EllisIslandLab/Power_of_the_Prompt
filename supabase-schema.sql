-- Web Launch Coach - Supabase SQL Schema
-- Created for coaching business with cohorts, lessons, projects, and progress tracking
-- Integrates with Supabase's built-in auth.users table and creates profiles table

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for better data consistency
CREATE TYPE user_role AS ENUM ('STUDENT', 'COACH', 'ADMIN');

-- Create profiles table to extend auth.users with additional fields
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    role user_role DEFAULT 'STUDENT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Coaches and admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('COACH', 'ADMIN')
        )
    );
CREATE TYPE cohort_status AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE project_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'TEXT', 'INTERACTIVE', 'ASSIGNMENT', 'QUIZ');
CREATE TYPE progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- Cohorts table - groups of students learning together
CREATE TABLE cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status cohort_status DEFAULT 'DRAFT',
    start_date DATE,
    end_date DATE,
    max_students INTEGER DEFAULT 20,
    current_students INTEGER DEFAULT 0,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort memberships - which students are in which cohorts
CREATE TABLE cohort_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cohort_id, student_id)
);

-- Projects table - student website projects (metadata only, not files)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
    status project_status DEFAULT 'NOT_STARTED',
    github_url TEXT,
    live_url TEXT,
    preview_image_url TEXT,
    technologies TEXT[], -- Array of technologies used
    requirements TEXT,
    feedback TEXT,
    coach_notes TEXT,
    due_date DATE,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table - lesson tracking and content structure
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- Markdown content or lesson body
    lesson_type lesson_type DEFAULT 'TEXT',
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    video_url TEXT,
    resources_urls TEXT[], -- Array of resource links
    prerequisites TEXT[], -- Array of lesson IDs or topics
    learning_objectives TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table - what students have completed
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    status progress_status DEFAULT 'NOT_STARTED',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    score DECIMAL(5,2), -- For quizzes or graded assignments
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id, cohort_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_cohorts_status ON cohorts(status);
CREATE INDEX idx_cohorts_coach_id ON cohorts(coach_id);
CREATE INDEX idx_cohorts_start_date ON cohorts(start_date);
CREATE INDEX idx_cohort_memberships_cohort_id ON cohort_memberships(cohort_id);
CREATE INDEX idx_cohort_memberships_student_id ON cohort_memberships(student_id);
CREATE INDEX idx_cohort_memberships_active ON cohort_memberships(is_active);
CREATE INDEX idx_projects_student_id ON projects(student_id);
CREATE INDEX idx_projects_cohort_id ON projects(cohort_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_lessons_cohort_id ON lessons(cohort_id);
CREATE INDEX idx_lessons_order ON lessons(cohort_id, order_index);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_progress_student_id ON progress(student_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_progress_cohort_id ON progress(cohort_id);
CREATE INDEX idx_progress_status ON progress(status);

-- Create functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON cohorts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohort_memberships_updated_at BEFORE UPDATE ON cohort_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update cohort student count
CREATE OR REPLACE FUNCTION update_cohort_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cohorts 
        SET current_students = (
            SELECT COUNT(*) 
            FROM cohort_memberships 
            WHERE cohort_id = NEW.cohort_id AND is_active = true
        )
        WHERE id = NEW.cohort_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE cohorts 
        SET current_students = (
            SELECT COUNT(*) 
            FROM cohort_memberships 
            WHERE cohort_id = NEW.cohort_id AND is_active = true
        )
        WHERE id = NEW.cohort_id;
        
        -- Also update old cohort if cohort changed
        IF OLD.cohort_id != NEW.cohort_id THEN
            UPDATE cohorts 
            SET current_students = (
                SELECT COUNT(*) 
                FROM cohort_memberships 
                WHERE cohort_id = OLD.cohort_id AND is_active = true
            )
            WHERE id = OLD.cohort_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cohorts 
        SET current_students = (
            SELECT COUNT(*) 
            FROM cohort_memberships 
            WHERE cohort_id = OLD.cohort_id AND is_active = true
        )
        WHERE id = OLD.cohort_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update cohort student count
CREATE TRIGGER update_cohort_student_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cohort_memberships
    FOR EACH ROW EXECUTE FUNCTION update_cohort_student_count();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cohorts table
CREATE POLICY "Coaches and admins can view all cohorts" ON cohorts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('COACH', 'ADMIN')
        )
    );

CREATE POLICY "Students can view their cohorts" ON cohorts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cohort_memberships cm
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE cm.cohort_id = cohorts.id 
            AND cm.student_id = auth.uid()
            AND cm.is_active = true
            AND u.role = 'STUDENT'
        )
    );

CREATE POLICY "Coaches can manage their cohorts" ON cohorts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'COACH'
            AND (cohorts.coach_id = auth.uid() OR profiles.role = 'ADMIN')
        )
    );

CREATE POLICY "Admins can manage all cohorts" ON cohorts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- RLS Policies for cohort_memberships table
CREATE POLICY "Users can view their own memberships" ON cohort_memberships
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Coaches can view memberships for their cohorts" ON cohort_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = cohort_memberships.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

CREATE POLICY "Coaches and admins can manage memberships" ON cohort_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles u
            WHERE u.id = auth.uid()
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

-- RLS Policies for projects table
CREATE POLICY "Students can view their own projects" ON projects
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can manage their own projects" ON projects
    FOR ALL USING (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'STUDENT'
        )
    );

CREATE POLICY "Coaches can view projects in their cohorts" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = projects.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

CREATE POLICY "Coaches can manage projects in their cohorts" ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = projects.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

-- RLS Policies for lessons table
CREATE POLICY "Students can view published lessons in their cohorts" ON lessons
    FOR SELECT USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM cohort_memberships cm
            WHERE cm.cohort_id = lessons.cohort_id
            AND cm.student_id = auth.uid()
            AND cm.is_active = true
        )
    );

CREATE POLICY "Coaches can view all lessons in their cohorts" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = lessons.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

CREATE POLICY "Coaches can manage lessons in their cohorts" ON lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = lessons.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

-- RLS Policies for progress table
CREATE POLICY "Students can view their own progress" ON progress
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own progress" ON progress
    FOR INSERT WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'STUDENT'
        )
    );

CREATE POLICY "Students can update their existing progress" ON progress
    FOR UPDATE USING (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'STUDENT'
        )
    );

CREATE POLICY "Coaches can view progress in their cohorts" ON progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = progress.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

CREATE POLICY "Coaches can manage progress in their cohorts" ON progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cohorts c
            JOIN public.profiles u ON u.id = auth.uid()
            WHERE c.id = progress.cohort_id
            AND (c.coach_id = auth.uid() OR u.role = 'ADMIN')
            AND u.role IN ('COACH', 'ADMIN')
        )
    );

-- Create helpful views for common queries
CREATE VIEW cohort_overview AS
SELECT 
    c.*,
    p.name as coach_name,
    au.email as coach_email,
    COUNT(cm.id) as enrolled_students,
    COALESCE(AVG(cm.progress_percentage), 0) as avg_progress
FROM cohorts c
LEFT JOIN public.profiles p ON c.coach_id = p.id
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN cohort_memberships cm ON c.id = cm.cohort_id AND cm.is_active = true
GROUP BY c.id, p.name, au.email;

CREATE VIEW student_progress_summary AS
SELECT 
    pr.id as student_id,
    pr.name as student_name,
    au.email as student_email,
    c.id as cohort_id,
    c.name as cohort_name,
    COUNT(p.id) as lessons_attempted,
    COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as lessons_completed,
    COALESCE(AVG(CASE WHEN p.status = 'COMPLETED' THEN p.score END), 0) as avg_score,
    cm.progress_percentage,
    cm.joined_at
FROM public.profiles pr
JOIN auth.users au ON pr.id = au.id
JOIN cohort_memberships cm ON pr.id = cm.student_id AND cm.is_active = true
JOIN cohorts c ON cm.cohort_id = c.id
LEFT JOIN progress p ON pr.id = p.student_id AND c.id = p.cohort_id
WHERE pr.role = 'STUDENT'
GROUP BY pr.id, pr.name, au.email, c.id, c.name, cm.progress_percentage, cm.joined_at;

-- Insert some sample data (optional - remove if not needed)
-- Note: You'll need to replace the UUID values with actual user IDs from your profiles table

-- Sample data commented out - uncomment and modify as needed:
/*
-- Sample cohort (replace coach_id with actual coach user ID)
INSERT INTO cohorts (name, description, status, start_date, end_date, max_students, coach_id, price) VALUES
('Web Fundamentals 2024', 'Complete web development fundamentals course', 'ACTIVE', '2024-01-15', '2024-04-15', 25, 'your-coach-user-id-here', 299.00);

-- Sample lessons (replace cohort_id with actual cohort ID)
INSERT INTO lessons (title, description, lesson_type, cohort_id, order_index, duration_minutes, is_published) VALUES
('HTML Basics', 'Introduction to HTML structure and syntax', 'VIDEO', 'your-cohort-id-here', 1, 45, true),
('CSS Fundamentals', 'Styling web pages with CSS', 'VIDEO', 'your-cohort-id-here', 2, 60, true),
('JavaScript Introduction', 'Basic JavaScript programming concepts', 'INTERACTIVE', 'your-cohort-id-here', 3, 75, true);
*/

-- Create a function to get user role (helpful for application logic)
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result FROM public.profiles WHERE id = user_uuid;
    RETURN user_role_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE cohorts IS 'Groups of students learning together with a coach';
COMMENT ON TABLE cohort_memberships IS 'Tracks which students belong to which cohorts';
COMMENT ON TABLE projects IS 'Student website projects with metadata and tracking';
COMMENT ON TABLE lessons IS 'Lesson content and structure for cohorts';
COMMENT ON TABLE progress IS 'Individual student progress through lessons';

COMMENT ON COLUMN cohorts.current_students IS 'Automatically updated count of active students';
COMMENT ON COLUMN progress.time_spent_minutes IS 'Self-reported or tracked time spent on lesson';
COMMENT ON COLUMN projects.technologies IS 'Array of technologies used in the project';
COMMENT ON COLUMN lessons.prerequisites IS 'Array of prerequisite lesson IDs or topics';