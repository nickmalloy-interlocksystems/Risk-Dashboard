
create table if not exists feedback (
  id uuid not null default gen_random_uuid(),
  risk_title text,
  feedback_text text,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);
