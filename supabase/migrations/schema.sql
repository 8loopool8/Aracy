-- Aracy Supabase Schema

create table if not exists profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users,
    display_name text,
    role text check (role in ('alchemist', 'muse')),
    traits jsonb,
    astro_data jsonb
);

create table if not exists bonds (
    id uuid primary key default gen_random_uuid(),
    sender_id uuid references profiles(id),
    receiver_id uuid references profiles(id),
    bond_code text unique not null,
    created_at timestamptz not null default now()
);

create table if not exists alint_logs (
    id uuid primary key default gen_random_uuid(),
    bond_id uuid references bonds(id),
    content text,
    category text,
    etymology text,
    quiz_data jsonb,
    is_revealed boolean default false,
    created_at timestamptz not null default now()
);

create table if not exists streaks (
    id uuid primary key default gen_random_uuid(),
    bond_id uuid references bonds(id),
    count integer default 0,
    last_interaction timestamptz
);