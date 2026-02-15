-- Migration to add missing fields to leads table

-- 1. Add simple columns
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pincode text;

-- 2. Add JSONB columns for grouped data (Emergency, Preferences, etc.)
-- We use JSONB to be flexible with the many form fields
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS emergency_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS existing_diseases jsonb DEFAULT '[]'::jsonb;

-- 3. Update the handle_new_lead function (if any exists) or policies?
-- Policies usually cover "all" columns so we are good.
