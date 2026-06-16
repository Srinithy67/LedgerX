-- PocketPetal Initialization Migration
-- Set up database schema for user profiles, categories, and expenses.

-- 1. Create Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  theme text not null default 'Matcha Strawberry',
  updated_at timestamptz default now()
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Create Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade, -- NULL for system-wide categories
  name text not null,
  is_custom boolean not null default true,
  category_group text not null check (category_group in ('essential', 'leisure', 'savings')) default 'leisure',
  created_at timestamptz default now(),
  constraint unique_user_category_name unique (user_id, name)
);

-- Enable RLS on Categories
alter table public.categories enable row level security;

create policy "Allow all users to view system categories and their own custom categories"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can create their own custom categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own custom categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own custom categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- 3. Create Expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  category_id uuid references public.categories on delete set null,
  payment_method text not null,
  date timestamptz not null,
  created_at timestamptz default now()
);

-- Enable RLS on Expenses
alter table public.expenses enable row level security;

create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can create their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- 4. User Registration Profile Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, theme)
  values (new.id, 'Matcha Strawberry');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Seed System Categories
insert into public.categories (user_id, name, is_custom, category_group)
values
  (null, 'Food', false, 'essential'),
  (null, 'Groceries', false, 'essential'),
  (null, 'Dining Out', false, 'leisure'),
  (null, 'Shopping', false, 'leisure'),
  (null, 'Health', false, 'essential'),
  (null, 'Wellness', false, 'essential'),
  (null, 'Bills', false, 'essential'),
  (null, 'Transport', false, 'essential'),
  (null, 'Entertainment', false, 'leisure'),
  (null, 'Creativity', false, 'leisure')
on conflict (user_id, name) do update 
set category_group = excluded.category_group;
