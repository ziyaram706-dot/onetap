-- Create a default Super Admin user
-- Password will be: admin123
-- Email: admin@onetap.com

-- 1. Enable pgcrypto for password hashing if not already enabled
create extension if not exists "pgcrypto";

-- 2. Insert into auth.users (Safe Insert without ON CONFLICT)
-- We use INSERT ... SELECT ... WHERE NOT EXISTS to avoid constraint errors
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
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(), -- Generate a new random UUID (or use a fixed one if you prefer, but random is safer if ID constraint issues arise)
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
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@onetap.com'
);

-- 3. Insert into public.profiles
-- We look up the ID we just inserted (or the existing one)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id,
    email, 
    'Super System Admin',
    'super_admin'
FROM auth.users 
WHERE email = 'admin@onetap.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin'; -- Ensure they are super_admin if they already exist
