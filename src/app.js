const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, CI/CD World!', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/goodbye', (req, res) => {
  res.json({ message: 'Goodbye, CI/CD World!' });
});

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = { app, server };