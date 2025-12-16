import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API working! POST to /hello with {"query": "PSA 10 card name"}');
});

app.post('/hello', async (req, res) => {
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const response = await fetch('https://130point.com/cards/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: new URLSearchParams({ search: query })
    });

    const html = await response.text();

    const realValue = html.match(/Real Value[:\s]*\$?([\d.,]+)/i)?.[1] || 'N/A';
    const lastSold = html.match(/Last Sold[:\s]*\$?([\d.,]+)/i)?.[1] || 'N/A';
    const oneMo = html.match(/1 Mo Ago[:\s]*\$?([\d.,]+)/i)?.[1] || 'N/A';
    const sixMo = html.match(/6 Mo Ago[:\s]*\$?([\d.,]+)/i)?.[1] || 'N/A';

    res.json({
      realValue: realValue !== 'N/A' ? '$' + realValue : 'N/A',
      lastSold: lastSold !== 'N/A' ? '$' + lastSold : 'N/A',
      oneMo: oneMo !== 'N/A' ? '$' + oneMo : 'N/A',
      sixMo: sixMo !== 'N/A' ? '$' + sixMo : 'N/A'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default app;
