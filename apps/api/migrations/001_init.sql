-- Stuffaroo schema. Targets Tiger Cloud (Postgres + pgvector + pgvectorscale).
-- vectorscale CASCADE also installs pgvector. btree_gist backs the
-- no-overlapping-bookings exclusion constraint.
create extension if not exists vectorscale cascade;
create extension if not exists btree_gist;

create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth0_user_id text unique,
  display_name text not null check (char_length(display_name) between 1 and 80),
  email text,
  email_verified boolean not null default false,
  avatar_url text,
  campus text,
  program text,
  created_at timestamptz not null default now()
);
create index profiles_email_idx on profiles (lower(email));

create table listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) <= 2000),
  category text not null check (
    category in ('electronics', 'cameras', 'textbooks', 'outdoor', 'music', 'kitchen', 'tools', 'sports')
  ),
  condition text not null check (condition in ('New', 'Like new', 'Good', 'Fair')),
  price_per_day_cents integer check (price_per_day_cents >= 0),
  deposit_cents integer check (deposit_cents >= 0),
  location text not null check (char_length(location) between 1 and 80),
  availability_status text not null default 'available'
    check (availability_status in ('available', 'on_loan', 'paused')),
  -- Gemini embedding of title + description (RETRIEVAL_DOCUMENT, 768 dims).
  -- Null until embedded; such listings are only found by keyword matching.
  embedding vector(768),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_browse_idx on listings (availability_status, category, created_at desc);
create index listings_owner_idx on listings (owner_id);
create index listings_embedding_idx on listings using diskann (embedding vector_cosine_ops);

create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);
create index listing_images_listing_idx on listing_images (listing_id);

create table wanted_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) <= 2000),
  category text not null check (
    category in ('electronics', 'cameras', 'textbooks', 'outdoor', 'music', 'kitchen', 'tools', 'sports')
  ),
  budget_per_day_cents integer check (budget_per_day_cents >= 0),
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open', 'fulfilled', 'closed')),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index wanted_posts_status_idx on wanted_posts (status, created_at desc);
create index wanted_posts_user_idx on wanted_posts (user_id);

create table rental_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  borrower_id uuid not null references profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'active', 'completed')),
  message text not null default '' check (char_length(message) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  -- Two accepted/active bookings for one listing can never overlap.
  constraint rental_requests_no_overlap exclude using gist (
    listing_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('accepted', 'active'))
);
create index rental_requests_listing_idx on rental_requests (listing_id, status);
create index rental_requests_borrower_idx on rental_requests (borrower_id, created_at desc);

-- Solana Devnet deposit demo records (not escrow).
create table deposits (
  id uuid primary key default gen_random_uuid(),
  rental_request_id uuid not null references rental_requests (id) on delete cascade,
  amount_lamports bigint not null check (amount_lamports > 0),
  network text not null default 'devnet' check (network = 'devnet'),
  transaction_signature text unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  created_at timestamptz not null default now()
);
create index deposits_request_idx on deposits (rental_request_id);
