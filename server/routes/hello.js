module.exports = (app) => {
  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Olá do backend!' });
  });
};


