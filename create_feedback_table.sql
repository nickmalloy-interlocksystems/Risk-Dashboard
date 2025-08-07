-- Run this in Supabase SQL Editor
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamp with time zone default timezone('utc'::text, now()),
  risk_title text,
  feedback_text text
);