-- Schema Responsi: Perpustakaan Loans API (3 tabel)
-- Cara pakai: Supabase Dashboard > SQL Editor > New Query > paste seluruh file > Run

-- 1. Tabel members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- 2. Tabel books
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text unique,
  stock int not null default 1 check (stock >= 0),
  created_at timestamptz default now()
);

-- 3. Tabel loans (relasi member <-> book)
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  loan_date date not null default current_date,
  due_date date,
  return_date date,
  status text not null default 'Dipinjam'
    check (status in ('Dipinjam', 'Kembali', 'Terlambat')),
  created_at timestamptz default now()
);

create index if not exists idx_loans_member on loans(member_id);
create index if not exists idx_loans_book on loans(book_id);
create index if not exists idx_loans_status on loans(status);

-- 4. RLS: aktif + policy longgar untuk kebutuhan responsi
-- (API backend memakai publishable/anon key langsung dari server)
alter table members enable row level security;
alter table books enable row level security;
alter table loans enable row level security;

drop policy if exists "allow all for anon" on members;
drop policy if exists "allow all for anon" on books;
drop policy if exists "allow all for anon" on loans;

create policy "allow all for anon" on members for all to anon using (true) with check (true);
create policy "allow all for anon" on books for all to anon using (true) with check (true);
create policy "allow all for anon" on loans for all to anon using (true) with check (true);

drop policy if exists "allow all for authenticated" on members;
drop policy if exists "allow all for authenticated" on books;
drop policy if exists "allow all for authenticated" on loans;

create policy "allow all for authenticated" on members for all to authenticated using (true) with check (true);
create policy "allow all for authenticated" on books for all to authenticated using (true) with check (true);
create policy "allow all for authenticated" on loans for all to authenticated using (true) with check (true);

-- 5. Data contoh (opsional)
-- insert into members (name, email) values ('Budi Santoso', 'budi@example.com') returning *;
-- insert into books (title, author, isbn, stock) values ('Laskar Pelangi', 'Andrea Hirata', '9789793062792', 3) returning *;
-- insert into loans (member_id, book_id, status) values ('<member_id>', '<book_id>', 'Dipinjam') returning *;
