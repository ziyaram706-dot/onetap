-- Create a default Super Admin user
-- Password will be: admin123
-- Email: admin@onetap.com

-- 1. Enable pgcrypto for password hashing if not already enabled
create extension if not exists "pgcrypto";

-- 2. Insert into auth.users (This requires valid permissions, run in Supabase SQL Editor)
-- We use ON CONFLICT DO NOTHING to avoid errors if run multiple times
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001', -- Fixed UUID for easy reference
    'authenticated',
    'authenticated',
    'admin@onetap.com',
    crypt('admin123', gen_salt('bf')), -- Password: admin123
    now(),
    null,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 3. Insert into public.profiles
-- We force the ID to match the one we just created
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@onetap.com'),
    'admin@onetap.com',
    'Super System Admin',
    'super_admin'
) ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin'; -- Ensure they are super_admin if they already exist
