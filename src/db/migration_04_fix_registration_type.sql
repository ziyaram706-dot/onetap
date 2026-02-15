-- Migration 04: Fix Leads Registration Type Constraint
-- The frontend sends 'individual', 'couple', 'family' as registration types (plans).
-- The original schema expected 'myself', 'family', 'agent'.
-- This migration updates the check constraint to match the frontend.

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_registration_type_check;

ALTER TABLE leads ADD CONSTRAINT leads_registration_type_check 
CHECK (registration_type IN ('individual', 'couple', 'family'));
