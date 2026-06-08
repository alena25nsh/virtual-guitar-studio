import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'virtual-guitar-studio',
  });
});

app.get('/api/guitars', (_req, res) => {
  res.json({
    guitars: [
      {
        id: 'electric',
        name: 'Электрогитара',
        tone: 'bright',
      },
      {
        id: 'classic',
        name: 'Классическая гитара',
        tone: 'warm',
      },
    ],
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
