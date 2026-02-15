-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('super_admin', 'manager', 'telecaller', 'marketing_lead')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Super Admin can manage all profiles (bypass RLS for setup)
-- Note: is_super_admin() uses security definer to avoid recursion
create policy "Super Admins can manage all profiles"
  on profiles
  for all
  using ( is_super_admin() );

-- Create leads table
create table leads (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  phone_number text,
  status text default 'new' check (status in ('new', 'called', 'waiting', 'rejected', 'completed')),
  payment_status text default 'pending' check (payment_status in ('pending', 'received', 'not_received')),
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  medical_history text,
  registration_type text check (registration_type in ('myself', 'family', 'agent')),
  agent_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on leads
alter table leads enable row level security;

-- Policies for leads

-- 1. Super Admin can do everything
-- (We assume super_admin is checking role in profiles)
-- But for simplicity in policies, we can use a helper function or just check profiles.
-- Better to have a secure function to check role.

create or replace function public.is_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'super_admin'
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_manager()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'manager'
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_telecaller()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'telecaller'
  );
end;
$$ language plpgsql security definer;

-- Super Admin Policy
create policy "Super Admin can do everything on leads"
  on leads
  for all
  using ( is_super_admin() );

-- Manager Policy
-- View: created_by = auth.uid() OR assigned_to = their telecaller (but we don't have hierarchy yet).
-- Requirement: "manager added lead details should not be visible on another managers table".
-- So just created_by = auth.uid().
create policy "Managers can view own leads"
  on leads
  for select
  using ( is_manager() and created_by = auth.uid() );

create policy "Managers can insert leads"
  on leads
  for insert
  with check ( is_manager() and created_by = auth.uid() );

create policy "Managers can update own leads"
  on leads
  for update
  using ( is_manager() and created_by = auth.uid() );

create policy "Managers can delete own leads"
  on leads
  for delete
  using ( is_manager() and created_by = auth.uid() );

-- Telecaller Policy
-- View: assigned_to = auth.uid()
create policy "Telecallers can view assigned leads"
  on leads
  for select
  using ( is_telecaller() and assigned_to = auth.uid() );

-- Update: assigned_to = auth.uid()
-- IMPORTANT: Telecallers should NOT update payment_status.
-- We handle this with a trigger or just trust the policy (policy allows update access to row).
-- The prompt says "this shall only be filled by managers and super admins".
-- We can use a trigger to prevent payment_status change if role is telecaller.
create policy "Telecallers can update assigned leads"
  on leads
  for update
  using ( is_telecaller() and assigned_to = auth.uid() );

-- Public Registration (Insert only)
-- "registered registerations from website should also visible"
create policy "Public can insert leads (registration)"
  on leads
  for insert
  with check ( auth.role() = 'anon' ); 
  -- or just true if we want authenticated users to register too?
  -- "user should be able to choose registering for myself or my family or i am agent"
  -- Agents are authenticated. Public is anon.
  -- So allow insert for all?
create policy "Anyone can insert leads"
  on leads
  for insert
  with check ( true );

-- Trigger to protect payment_status for Telecallers
create or replace function check_payment_status_update()
returns trigger as $$
begin
  if (old.payment_status is distinct from new.payment_status) and public.is_telecaller() then
    raise exception 'Telecallers cannot update payment status';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger protect_payment_status
  before update on leads
  for each row
  execute function check_payment_status_update();

