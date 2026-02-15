-- Migration 05: Add missing columns to leads table for Registration Form
-- The Registration Form sends many fields that were missing in the initial schema.

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS member_name text,
ADD COLUMN IF NOT EXISTS relative_name text,
ADD COLUMN IF NOT EXISTS relationship text,
ADD COLUMN IF NOT EXISTS relative_phone text,
ADD COLUMN IF NOT EXISTS relative_email text,
ADD COLUMN IF NOT EXISTS update_frequency text,
ADD COLUMN IF NOT EXISTS communication_mode text[], -- Array for checkboxes
ADD COLUMN IF NOT EXISTS support_areas text[], -- Array for checkboxes
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_relationship text,
ADD COLUMN IF NOT EXISTS emergency_contact_number text,
ADD COLUMN IF NOT EXISTS emergency_permission boolean default false,
ADD COLUMN IF NOT EXISTS authorized_person text,
ADD COLUMN IF NOT EXISTS payment_mode text,
ADD COLUMN IF NOT EXISTS cheque_number text,
ADD COLUMN IF NOT EXISTS payment_date date,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS declaration_info boolean default false,
ADD COLUMN IF NOT EXISTS declaration_rules boolean default false;
