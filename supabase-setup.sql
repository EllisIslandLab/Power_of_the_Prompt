-- Create waitlist table for coming soon page email signups
CREATE TABLE waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  notified boolean DEFAULT false,
  source text DEFAULT 'coming-soon-page'
);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for signup form)
CREATE POLICY "Allow public waitlist signup" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated admin users to view all records
CREATE POLICY "Allow admin to view waitlist" ON waitlist
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- Add a comment
COMMENT ON TABLE waitlist IS 'Email waitlist for coming soon page signups';