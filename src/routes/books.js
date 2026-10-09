const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// POST /books
router.post('/', async (req, res, next) => {
  try {
    const { title, author, isbn, stock } = req.body;
    if (!title) return res.status(400).json({ error: 'title wajib diisi' });

    const { data, error } = await supabase
      .from('books')
      .insert([{ title, author, isbn, stock }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /books
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Book tidak ditemukan' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /books/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, isbn, stock } = req.body;
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (author !== undefined) payload.author = author;
    if (isbn !== undefined) payload.isbn = isbn;
    if (stock !== undefined) payload.stock = stock;
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang diupdate' });
    }
    const { data, error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(404).json({ error: 'Book tidak ditemukan' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /books/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('books').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Book dihapus' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
