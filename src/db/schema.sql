-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Tables

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('super_admin', 'manager', 'telecaller', 'marketing_lead')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Create leads table
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  phone_number text,
  status text default 'new' check (status in ('new', 'called', 'waiting', 'rejected', 'completed')),
  payment_status text default 'pending' check (payment_status in ('pending', 'received', 'not_received')),
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  medical_history text,
  registration_type text check (registration_type in ('individual', 'couple', 'family')),
  agent_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on leads
alter table leads enable row level security;

-- 2. Define Helper Functions (Must be before policies that use them)

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

-- 3. Create Policies

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Super Admins can manage all profiles"
  on profiles
  for all
  using ( is_super_admin() );

-- Policies for leads

-- Super Admin Policy
create policy "Super Admin can do everything on leads"
  on leads
  for all
  using ( is_super_admin() );

-- Manager Policies
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

-- Telecaller Policies
create policy "Telecallers can view assigned leads"
  on leads
  for select
  using ( is_telecaller() and assigned_to = auth.uid() );

create policy "Telecallers can update assigned leads"
  on leads
  for update
  using ( is_telecaller() and assigned_to = auth.uid() );

-- Public/Registration Policy
create policy "Anyone can insert leads"
  on leads
  for insert
  with check ( true );

-- 4. Create Triggers

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

-- Drop trigger if exists to avoid error on rerun
drop trigger if exists protect_payment_status on leads;

create trigger protect_payment_status
  before update on leads
  for each row
  execute function check_payment_status_update();
