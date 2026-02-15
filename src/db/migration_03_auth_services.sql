-- Migration 03: Add Member Role and Service Requests

-- 1. Update profiles role check to include 'member'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('super_admin', 'manager', 'telecaller', 'marketing_lead', 'member'));

-- 2. Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  requested_date date NOT NULL,
  requested_time text, 
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Users can view their own requests
CREATE POLICY "Users can view own requests" 
ON service_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests" 
ON service_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins (Super Admin & Manager) can view all
CREATE POLICY "Admins can view all requests" 
ON service_requests FOR ALL 
USING (public.is_super_admin() OR public.is_manager());
