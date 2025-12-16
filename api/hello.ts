import express from 'express';
import { load } from 'cheerio';

const app = express();
app.use(express.json());

app.post('/search', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Need {"query": "card name"}' });
  }

  try {
    const fetchResponse = await fetch('https://130point.com/cards/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: new URLSearchParams({ search: query })
    });

    const html = await fetchResponse.text();
    const $ = load(html);

    // Target the black price summary box – common classes/structures on 130point
    const summaryBox = $('div').filter((i, el) => $(el).text().includes('Real Value:'));

    const realValue = summaryBox.find('strong:contains("Real Value:")').next().text().trim() || 
                     summaryBox.text().match(/Real Value:\s*\$?([\d.,]+)/)?.[1] || 'N/A';

    const lastSold = summaryBox.text().match(/Last Sold:\s*\$?([\d.,]+)/)?.[1] || 'N/A';

    const oneMo = summaryBox.text().match(/1 Mo Ago:\s*\$?([\d.,]+)/)?.[1] || 'N/A';

    const sixMo = summaryBox.text().match(/6 Mo Ago:\s*\$?([\d.,]+)/)?.[1] || 'N/A';

    const salesCount = $('div:contains("Sold")').first().text().match(/(\d+)\s*Sold/)?.[1] || 'N/A';

    res.json({
      realValue: realValue !== 'N/A' ? '$' + realValue : 'N/A',
      lastSold: lastSold !== 'N/A' ? '$' + lastSold : 'N/A',
      oneMo: oneMo !== 'N/A' ? '$' + oneMo : 'N/A',
      sixMo: sixMo !== 'N/A' ? '$' + sixMo : 'N/A',
      salesCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('POST to /search with {"query": "PSA 10 Snorlax GX"}'));

export default app;
