import express from 'express';
import { load } from 'cheerio';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/search', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: 'Send a valid query in JSON: {"query": "your card name"}' });
  }

  try {
    const fetchResponse = await fetch('https://130point.com/cards/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Origin': 'https://130point.com',
        'Referer': 'https://130point.com/cards/'
      },
      body: new URLSearchParams({ search: query.trim() })
    });

    if (!fetchResponse.ok) {
      throw new Error(`130point returned ${fetchResponse.status}`);
    }

    const html = await fetchResponse.text();
    const $ = load(html);

    // Robust parsing: find lines with the labels and grab the price after
    const lines = $('body').text().split('\n');
    const values: { [key: string]: string } = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('Real Value:')) values.realValue = trimmed.replace('Real Value:', '').trim();
      if (trimmed.startsWith('Last Sold:')) values.lastSold = trimmed.replace('Last Sold:', '').trim();
      if (trimmed.startsWith('1 Mo Ago:')) values.oneMo = trimmed.replace('1 Mo Ago:', '').trim();
      if (trimmed.startsWith('6 Mo Ago:')) values.sixMo = trimmed.replace('6 Mo Ago:', '').trim();
    });

    res.json({
      realValue: values.realValue || 'N/A',
      lastSold: values.lastSold || 'N/A',
      oneMo: values.oneMo || 'N/A',
      sixMo: values.sixMo || 'N/A'
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get data – ' + error.message });
  }
});

app.get('/', (req, res) => {
  res.send('130point API ready! POST to /search with JSON body {"query": "PSA 10 Snorlax GX Promo"}');
});

export default app;
