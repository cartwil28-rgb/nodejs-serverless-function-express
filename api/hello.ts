import express from 'express';
import { load } from 'cheerio';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API live! POST to /search with {"query": "PSA 10 card name"} for 130point comps.');
});

app.post('/search', async (req, res) => {
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Need query' });

  try {
    const response = await fetch('https://130point.com/cards/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ search: query })
    });
    const html = await response.text();
    const $ = load(html);

    // Simple text-based parsing (robust for price box)
    const text = $('body').text();
    const realValue = text.match(/Real Value:\s*\$([\d.,]+)/)?.[1] || 'N/A';
    const lastSold = text.match(/Last Sold:\s*\$([\d.,]+)/)?.[1] || 'N/A';
    const oneMo = text.match(/1 Mo Ago:\s*\$([\d.,]+)/)?.[1] || 'N/A';
    const sixMo = text.match(/6 Mo Ago:\s*\$([\d.,]+)/)?.[1] || 'N/A';

    res.json({
      realValue: realValue !== 'N/A' ? '$' + realValue : 'N/A',
      lastSold: lastSold !== 'N/A' ? '$' + lastSold : 'N/A',
      oneMo: oneMo !== 'N/A' ? '$' + oneMo : 'N/A',
      sixMo: sixMo !== 'N/A' ? '$' + sixMo : 'N/A'
    });
  } catch (e) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

export default app;
