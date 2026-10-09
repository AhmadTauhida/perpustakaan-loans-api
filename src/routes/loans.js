const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();
const VALID_STATUS = ['Dipinjam', 'Kembali', 'Terlambat'];
const LOAN_SELECT = '*, members(id, name, email), books(id, title, author, isbn)';

// POST /loans
router.post('/', async (req, res, next) => {
  try {
    const { member_id, book_id, loan_date, due_date, return_date, status } = req.body;
    if (!member_id || !book_id) {
      return res.status(400).json({ error: 'member_id dan book_id wajib diisi' });
    }
    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: `status harus salah satu: ${VALID_STATUS.join(', ')}` });
    }

    const payload = { member_id, book_id };
    if (loan_date !== undefined) payload.loan_date = loan_date;
    if (due_date !== undefined) payload.due_date = due_date;
    if (return_date !== undefined) payload.return_date = return_date;
    if (status !== undefined) payload.status = status;

    const { data, error } = await supabase
      .from('loans')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /loans?status=Terlambat&member_id=&book_id=
router.get('/', async (req, res, next) => {
  try {
    const { status, member_id, book_id } = req.query;
    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: `status harus salah satu: ${VALID_STATUS.join(', ')}` });
    }

    let query = supabase.from('loans').select(LOAN_SELECT).order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (member_id) query = query.eq('member_id', member_id);
    if (book_id) query = query.eq('book_id', book_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /loans/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(LOAN_SELECT)
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Loan tidak ditemukan' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /loans/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { member_id, book_id, loan_date, due_date, return_date, status } = req.body;
    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: `status harus salah satu: ${VALID_STATUS.join(', ')}` });
    }

    const payload = {};
    if (member_id !== undefined) payload.member_id = member_id;
    if (book_id !== undefined) payload.book_id = book_id;
    if (loan_date !== undefined) payload.loan_date = loan_date;
    if (due_date !== undefined) payload.due_date = due_date;
    if (return_date !== undefined) payload.return_date = return_date;
    if (status !== undefined) payload.status = status;

    const { data, error } = await supabase
      .from('loans')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(404).json({ error: 'Loan tidak ditemukan' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /loans/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('loans').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Loan dihapus' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
