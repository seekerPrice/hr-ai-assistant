-- Run this SQL in your Supabase SQL Editor to create the employees table

CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated', 'probation')),
  start_date DATE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table for chatbot workflows
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  leave_balance INTEGER NOT NULL DEFAULT 12,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE promotion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_requests ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations" ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON promotion_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample employee data
INSERT INTO employees (first_name, last_name, email, role, department, status, start_date, location) VALUES
  ('Sarah', 'Chen', 'sarah.chen@company.com', 'Senior Software Engineer', 'Engineering', 'active', '2022-03-15', 'San Francisco'),
  ('Marcus', 'Johnson', 'marcus.j@company.com', 'Product Designer', 'Design', 'active', '2023-01-08', 'New York'),
  ('Emily', 'Rodriguez', 'emily.r@company.com', 'Product Manager', 'Product', 'active', '2021-06-20', 'Austin'),
  ('David', 'Kim', 'david.kim@company.com', 'Frontend Developer', 'Engineering', 'probation', '2024-12-01', 'Seattle'),
  ('Jessica', 'Williams', 'jessica.w@company.com', 'HR Manager', 'Human Resources', 'active', '2020-09-10', 'Chicago'),
  ('Michael', 'Brown', 'michael.b@company.com', 'Sales Representative', 'Sales', 'active', '2023-04-15', 'Boston'),
  ('Amanda', 'Taylor', 'amanda.t@company.com', 'Marketing Specialist', 'Marketing', 'on_leave', '2022-11-28', 'Denver'),
  ('Christopher', 'Lee', 'chris.lee@company.com', 'DevOps Engineer', 'Engineering', 'active', '2021-02-14', 'Portland'),
  ('Sophia', 'Martinez', 'sophia.m@company.com', 'UX Researcher', 'Design', 'active', '2023-07-22', 'Miami'),
  ('James', 'Anderson', 'james.a@company.com', 'Financial Analyst', 'Finance', 'active', '2022-08-05', 'New York'),
  ('Olivia', 'Thomas', 'olivia.t@company.com', 'Operations Manager', 'Operations', 'active', '2020-03-12', 'Chicago'),
  ('Daniel', 'Garcia', 'daniel.g@company.com', 'Backend Developer', 'Engineering', 'active', '2023-09-18', 'San Francisco');

INSERT INTO profiles (email, full_name, leave_balance, city, state, country) VALUES
  ('sarah.chen@company.com', 'Sarah Chen', 12, 'San Francisco', 'CA', 'USA'),
  ('marcus.j@company.com', 'Marcus Johnson', 15, 'New York', 'NY', 'USA'),
  ('emily.r@company.com', 'Emily Rodriguez', 10, 'Austin', 'TX', 'USA');
