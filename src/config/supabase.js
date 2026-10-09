require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    '[supabase] SUPABASE_URL / key belum di-set. Isi file .env terlebih dahulu.'
  );
}

// Jangan throw saat import agar endpoint non-DB (/ dan /health) tetap jalan
// di Vercel walau env lupa di-set. Route DB akan mendapat error 503 yang jelas.
let supabase;
if (!url || !key) {
  const err = new Error('Supabase belum dikonfigurasi (SUPABASE_URL / key kosong)');
  err.status = 503;
  supabase = new Proxy(
    {},
    {
      get() {
        throw err;
      },
    }
  );
} else {
  supabase = createClient(url, key);
}

module.exports = supabase;
