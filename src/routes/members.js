const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// POST /members
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'name wajib diisi' });

    const { data, error } = await supabase
      .from('members')
      .insert([{ name, email, phone, address }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /members
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /members/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Member tidak ditemukan' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /members/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (email !== undefined) payload.email = email;
    if (phone !== undefined) payload.phone = phone;
    if (address !== undefined) payload.address = address;
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang diupdate' });
    }
    const { data, error } = await supabase
      .from('members')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email sudah digunakan oleh member lain' });
      }
      return res.status(404).json({ error: 'Member tidak ditemukan' });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /members/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('members').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Member dihapus' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
