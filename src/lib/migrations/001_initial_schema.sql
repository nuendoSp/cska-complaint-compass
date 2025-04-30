-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE complaint_category AS ENUM (
  'other',
  'technical',
  'billing',
  'service',
  'suggestion'
);

CREATE TYPE complaint_status AS ENUM (
  'new',
  'in_progress',
  'resolved',
  'rejected'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'support'
);

-- Create assignees table
CREATE TABLE IF NOT EXISTS assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'support'
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  title TEXT NOT NULL,
  description TEXT,
  category complaint_category NOT NULL DEFAULT 'other',
  status complaint_status NOT NULL DEFAULT 'new',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  attachments JSONB DEFAULT '[]'::jsonb,
  submitter_email TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  assignee_id UUID REFERENCES assignees(id)
);

-- Create complaint_responses table
CREATE TABLE IF NOT EXISTS complaint_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  complaint_id UUID NOT NULL REFERENCES complaints(id),
  assignee_id UUID NOT NULL REFERENCES assignees(id),
  text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  respondedat TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_submitter_email ON complaints(submitter_email);
CREATE INDEX IF NOT EXISTS idx_complaints_assignee_id ON complaints(assignee_id);
CREATE INDEX IF NOT EXISTS idx_complaint_responses_complaint_id ON complaint_responses(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_responses_assignee_id ON complaint_responses(assignee_id);

-- Create RLS policies
ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_responses ENABLE ROW LEVEL SECURITY;

-- Assignees policies
CREATE POLICY "Allow public read access to assignees"
  ON assignees FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow authenticated insert to assignees"
  ON assignees FOR INSERT
  TO authenticated
  WITH CHECK (role = 'support');

CREATE POLICY "Allow users to update their own record"
  ON assignees FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (role = 'support');

-- Complaints policies
CREATE POLICY "Allow public insert to complaints"
  ON complaints FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow support to update assigned complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (assignee_id::text = auth.uid()::text);

-- Complaint responses policies
CREATE POLICY "Allow public read access to responses"
  ON complaint_responses FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow support to insert responses"
  ON complaint_responses FOR INSERT
  TO authenticated
  WITH CHECK (assignee_id::text = auth.uid()::text);

CREATE POLICY "Allow support to update their responses"
  ON complaint_responses FOR UPDATE
  TO authenticated
  USING (assignee_id::text = auth.uid()::text);

-- Create functions
CREATE OR REPLACE FUNCTION apply_migration(sql_content TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_content;
END;
$$; 