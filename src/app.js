const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENV || 'development';
const apiKey = process.env.API_KEY || 'not-set';

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello, CI/CD World! ssh and docker', 
    version: '1.0.0',
    environment: environment
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    hasApiKey: apiKey !== 'not-set'
  });
});

app.get('/goodbye', (req, res) => {
  res.json({ message: 'Goodbye, CI/CD World!' });
});

const server = app.listen(port, () => {
  console.log(`App listening on port ${port} in ${environment} mode`);
});

module.exports = { app, server };