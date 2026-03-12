-- Create form_submissions table for client revision and video conference requests
-- This table stores all form submissions from the /portal/support page

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('revision-start', 'revision-modifier', 'video-conference')),
  date_submitted TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Store selected checkboxes/options as JSONB array
  selected_items JSONB DEFAULT '[]'::jsonb,

  -- Main instructions field (max 2000 chars for revisions)
  detailed_instructions TEXT NOT NULL,

  -- Revision Modifier specific field
  revision_status TEXT, -- 'modifying', 'adding', 'both'

  -- Video Conference specific fields
  topic_1_name TEXT,
  topic_1_details TEXT, -- max 500 chars
  topic_2_name TEXT,
  topic_2_details TEXT, -- max 500 chars

  -- Admin workflow fields
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in-progress', 'completed', 'archived')),
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX idx_form_submissions_form_type ON public.form_submissions(form_type);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX idx_form_submissions_created_at ON public.form_submissions(created_at DESC);

-- Add RLS policies
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view their own form submissions"
  ON public.form_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can create their own form submissions"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all submissions
CREATE POLICY "Admins can view all form submissions"
  ON public.form_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update all submissions (for status and notes)
CREATE POLICY "Admins can update all form submissions"
  ON public.form_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete submissions
CREATE POLICY "Admins can delete form submissions"
  ON public.form_submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_form_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_form_submissions_updated_at
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_form_submissions_updated_at();

-- Add helpful comment
COMMENT ON TABLE public.form_submissions IS 'Stores client form submissions for website revisions and video conference requests from the portal support page';
