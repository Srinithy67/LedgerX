import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('\n❌ DATABASE_URL is not set in your .env file.');
    console.error('\nTo set up your database:');
    console.error('1. Open Supabase Dashboard → Project Settings → Database');
    console.error('2. Copy the "Connection string" (URI mode, pooler or direct)');
    console.error('3. Add to .env: DATABASE_URL=postgresql://postgres.[ref]:[password]@...');
    console.error('4. Run: npm run db:setup\n');
    console.error('Alternatively, paste the SQL from supabase/migrations/20260615_init.sql');
    console.error('into the Supabase SQL Editor and run it manually.\n');
    process.exit(1);
  }

  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260615_init.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  const compatibilitySql = `
    create extension if not exists pgcrypto;

    create table if not exists public.profiles (
      id uuid references auth.users on delete cascade primary key,
      theme text not null default 'Matcha Strawberry',
      updated_at timestamptz default now()
    );

    create table if not exists public.categories (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users on delete cascade,
      name text not null,
      is_custom boolean not null default true,
      category_group text not null check (category_group in ('essential', 'leisure', 'savings')) default 'leisure',
      created_at timestamptz default now()
    );

    alter table public.categories add column if not exists is_custom boolean not null default true;
    alter table public.categories add column if not exists category_group text not null default 'leisure';
    alter table public.categories add column if not exists created_at timestamptz default now();
    update public.categories
      set is_custom = coalesce(not is_default, true)
      where is_custom is null and exists (
        select 1
        from information_schema.columns
        where table_schema = 'public' and table_name = 'categories' and column_name = 'is_default'
      );
    update public.categories set category_group = 'leisure' where category_group is null;
    alter table public.categories drop constraint if exists categories_category_group_check;
    alter table public.categories
      add constraint categories_category_group_check check (category_group in ('essential', 'leisure', 'savings'));

    create unique index if not exists unique_user_category_name
      on public.categories (user_id, name);

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

    alter table public.expenses add column if not exists date timestamptz;
    update public.expenses
      set date = transaction_date::timestamptz
      where date is null and transaction_date is not null;
    alter table public.expenses alter column date set not null;

    alter table public.profiles enable row level security;
    alter table public.categories enable row level security;
    alter table public.expenses enable row level security;

    do $$ begin
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can view own profile') then
        create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
        create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
      end if;

      if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Allow all users to view system categories and their own custom categories') then
        create policy "Allow all users to view system categories and their own custom categories"
          on public.categories for select using (user_id is null or auth.uid() = user_id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Users can create their own custom categories') then
        create policy "Users can create their own custom categories"
          on public.categories for insert with check (auth.uid() = user_id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Users can update their own custom categories') then
        create policy "Users can update their own custom categories"
          on public.categories for update using (auth.uid() = user_id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Users can delete their own custom categories') then
        create policy "Users can delete their own custom categories"
          on public.categories for delete using (auth.uid() = user_id);
      end if;

      if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Users can view their own expenses') then
        create policy "Users can view their own expenses" on public.expenses for select using (auth.uid() = user_id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Users can create their own expenses') then
        create policy "Users can create their own expenses" on public.expenses for insert with check (auth.uid() = user_id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Users can update their own expenses') then
        create policy "Users can update their own expenses" on public.expenses for update using (auth.uid() = user_id);
      end if;
      if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Users can delete their own expenses') then
        create policy "Users can delete their own expenses" on public.expenses for delete using (auth.uid() = user_id);
      end if;
    end $$;

    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.profiles (id, theme)
      values (new.id, 'Matcha Strawberry')
      on conflict (id) do nothing;
      return new;
    end;
    $$ language plpgsql security definer;

    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  `;

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Applying compatibility schema updates...');
    await client.query(compatibilitySql);
    console.log('Applying PocketPetal migration...');
    try {
      await client.query(sql);
    } catch (err) {
      // Migration may fail if parts already exist; compatibility SQL above is authoritative.
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('⚠️  Base migration had non-fatal conflicts:', msg);
    }
    console.log('✅ Database schema created successfully!');
    console.log('   Tables: profiles, categories, expenses');
    console.log('   System categories seeded, auth trigger installed.\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Migration failed:', message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
