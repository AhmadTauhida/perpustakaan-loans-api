const express = require('express');
const cors = require('cors');

const membersRouter = require('./routes/members');
const booksRouter = require('./routes/books');
const loansRouter = require('./routes/loans');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Library Loans API running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/members', membersRouter);
app.use('/books', booksRouter);
app.use('/loans', loansRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
