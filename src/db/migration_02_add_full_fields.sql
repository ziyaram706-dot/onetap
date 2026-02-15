-- Migration 02: Add ALL legacy membership fields to leads table
-- Based on user's INSERT statement from membership_applications

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS payment_mode text,
ADD COLUMN IF NOT EXISTS cheque_number text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS payment_date date,

-- Member/Relative Details
ADD COLUMN IF NOT EXISTS member_name text, -- Might be duplicate of customer_name, but keeping for safety
ADD COLUMN IF NOT EXISTS relative_name text,
ADD COLUMN IF NOT EXISTS relationship text,
ADD COLUMN IF NOT EXISTS relative_phone text, -- contactNumber in legacy
ADD COLUMN IF NOT EXISTS relative_email text,

-- Preferences
ADD COLUMN IF NOT EXISTS update_frequency text,
ADD COLUMN IF NOT EXISTS communication_mode text[], -- Array
ADD COLUMN IF NOT EXISTS support_areas text[], -- Array

-- Emergency (Overriding JSONB from previous step if prefer flat, or just add missing)
ADD COLUMN IF NOT EXISTS emergency_permission boolean,
ADD COLUMN IF NOT EXISTS authorized_person text,

-- Declarations
ADD COLUMN IF NOT EXISTS declaration_info boolean default false,
ADD COLUMN IF NOT EXISTS declaration_rules boolean default false,

-- Photos
ADD COLUMN IF NOT EXISTS photo_url_member text,
ADD COLUMN IF NOT EXISTS photo_url_spouse text;

-- Note: 'age', 'address', 'email' were added in previous migration.
-- 'emergency_details' jsonb was added, but we can also add flat columns if needed. 
-- For now, I will map the legacy emergency columns to the new form state, 
-- but might populate 'emergency_details' jsonb OR add flat columns. 
-- Let's add flat columns for emergency to match legacy exactly.
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_relationship text,
ADD COLUMN IF NOT EXISTS emergency_contact_number text;
