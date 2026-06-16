-- Job Application Tracker — initial schema
-- Run this in the Supabase SQL editor (see DEPLOYMENT.md).

create type job_status as enum (
  'applied',
  'contacted',
  'interview',
  'offer',
  'rejected',
  'closed'
);

create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  summary text not null default '',
  skills text not null default '',
  base_resume_content text not null default '',
  created_at timestamptz not null default now()
);

create table job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  title text not null,
  job_description text not null default '',
  application_url text not null default '',
  status job_status not null default 'applied',
  next_step text not null default '',
  applied_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table interviews (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid not null references job_applications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  interview_date date,
  round_type text not null default '',
  interviewers text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table cover_letters (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid not null references job_applications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now()
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid references job_applications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on job_applications (user_id);
create index on interviews (job_application_id);
create index on cover_letters (job_application_id);
create index on resumes (job_application_id);

-- Row Level Security: every table is scoped to the owning user.

alter table profiles enable row level security;
alter table job_applications enable row level security;
alter table interviews enable row level security;
alter table cover_letters enable row level security;
alter table resumes enable row level security;

create policy "profiles_owner" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "job_applications_owner" on job_applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "interviews_owner" on interviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cover_letters_owner" on cover_letters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "resumes_owner" on resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
