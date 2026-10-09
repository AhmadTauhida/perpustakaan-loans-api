# Perpustakaan Loans API

REST API sederhana untuk pencatatan peminjaman buku perpustakaan.
Stack: **Node.js + Express.js + Supabase**, deploy ke **Vercel**.

## Deskripsi & Tujuan

Proyek ini berupa layanan backend untuk mencatat siapa meminjam buku apa, kapan, dan statusnya. Proyek dibuat untuk memenuhi tugas praktikum Pemrograman Perangkat Bergerak Modul 1.
Fitur:

- CRUD `members` (anggota)
- CRUD `books` (buku)
- CRUD `loans` (peminjaman, relasi member ↔ book)
- Filter `GET /loans?status=Terlambat` (juga `?member_id=`, `?book_id=`)

## Struktur Data / Schema

3 tabel di Supabase (`supabase/schema.sql`):

**members**

| kolom      | tipe        | keterangan       |
| ---------- | ----------- | ---------------- |
| id         | uuid PK     | default `gen_random_uuid()` |
| name       | text        | NOT NULL         |
| email      | text unique | nullable         |
| phone      | text        | nullable         |
| address    | text        | nullable         |
| created_at | timestamptz | default `now()`  |

**books**

| kolom      | tipe        | keterangan       |
| ---------- | ----------- | ---------------- |
| id         | uuid PK     | default `gen_random_uuid()` |
| title      | text        | NOT NULL         |
| author     | text        | nullable         |
| isbn       | text unique | nullable         |
| stock      | int         | default 1, `>= 0` |
| created_at | timestamptz | default `now()`  |

**loans**

| kolom       | tipe | keterangan |
| ----------- | ---- | --- |
| id          | uuid PK | default `gen_random_uuid()` |
| member_id   | uuid FK → `members(id)` ON DELETE CASCADE | NOT NULL |
| book_id     | uuid FK → `books(id)` ON DELETE CASCADE | NOT NULL |
| loan_date   | date | default `current_date` |
| due_date    | date | nullable |
| return_date | date | nullable |
| status      | text | `Dipinjam` \| `Kembali` \| `Terlambat`, default `Dipinjam` |
| created_at  | timestamptz | default `now()` |

SQL lengkap + RLS policy ada di `supabase/schema.sql`. Cara pasang: Supabase Dashboard > SQL Editor > paste isi file > Run.

## Contoh Request & Response

Base URL lokal: `http://localhost:3000`. Ganti dengan URL Vercel untuk yang deploy.

### Health

```bash
curl http://localhost:3000/
# {"message":"Library Loans API running"}
```

### Members

```bash
# Create
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi Santoso","email":"budi@example.com"}'
# 201 {"id":"uuid...","name":"Budi Santoso","email":"budi@example.com",...}

# List
curl http://localhost:3000/members

# Detail / Update / Delete
curl http://localhost:3000/members/<id>
curl -X PUT http://localhost:3000/members/<id> -H "Content-Type: application/json" -d '{"phone":"08123"}'
curl -X DELETE http://localhost:3000/members/<id>
# {"message":"Member dihapus"}
```

### Books

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Laskar Pelangi","author":"Andrea Hirata","isbn":"9789793062792","stock":3}'
# 201 {"id":"uuid...","title":"Laskar Pelangi",...}

curl http://localhost:3000/books
curl http://localhost:3000/books/<id>
curl -X PUT http://localhost:3000/books/<id> -H "Content-Type: application/json" -d '{"stock":2}'
curl -X DELETE http://localhost:3000/books/<id>
```

### Loans

```bash
# Create
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{"member_id":"<member_id>","book_id":"<book_id>","status":"Dipinjam"}'
# 201 {"id":"uuid...","member_id":"...","book_id":"...","status":"Dipinjam",...}

# List + filter (wajib responsi)
curl http://localhost:3000/loans
curl "http://localhost:3000/loans?status=Terlambat"
curl "http://localhost:3000/loans?member_id=<member_id>"
curl "http://localhost:3000/loans?book_id=<book_id>"

# Detail (join member + book)
curl http://localhost:3000/loans/<id>
# {"id":"...","status":"Dipinjam","members":{"id":"...","name":"Budi"},"books":{"id":"...","title":"Laskar Pelangi"},...}

# Update status
curl -X PUT http://localhost:3000/loans/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"Kembali","return_date":"2026-10-05"}'

# Delete
curl -X DELETE http://localhost:3000/loans/<id>
# {"message":"Loan dihapus"}
```

Error umum: `400` validasi gagal, `404` id tidak ketemu.

## Instalasi & Menjalankan Lokal

```bash
git clone https://github.com/AhmadTauhida/perpustakaan-loans-api.git
cd perpustakaan-loans-api
npm install
cp .env.example .env
# isi SUPABASE_URL dan SUPABASE_ANON_KEY di .env
npm run dev   # http://localhost:3000
```

Setup DB (sekali saja):

1. Buka Supabase SQL Editor.
2. Paste isi `supabase/schema.sql` > Run.
3. Cek Table Editor: `members`, `books`, `loans` muncul.

## Deployment Vercel

- **Base URL:** `https://perpustakaan-loans-api.vercel.app`
- Cara deploy: import repo GitHub di Vercel > set Env `SUPABASE_URL`, `SUPABASE_ANON_KEY` (dan `SUPABASE_SERVICE_ROLE_KEY` jika ada) > Deploy.
- File penting: `api/index.js` (entry serverless), `vercel.json` (rewrite ke `/api`).

## Struktur Project

```
api/index.js            # entry Vercel
src/app.js              # express app
src/index.js            # listen lokal
src/config/supabase.js  # supabase client
src/routes/members.js   # CRUD members
src/routes/books.js     # CRUD books
src/routes/loans.js     # CRUD loans + filter
supabase/schema.sql     # DDL + RLS + index
```
