require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    '[supabase] SUPABASE_URL / key belum di-set. Isi file .env terlebih dahulu.'
  );
}

const supabase = createClient(url, key);

module.exports = supabase;
