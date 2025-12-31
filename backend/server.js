require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('./models/Article');

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is missing in .env file.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));


app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ last_updated: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/articles/:id', async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seed', async (req, res) => {
  try {
    console.log("🕷️ Starting scraper on BeyondChats...");
    
    // Fetch the Blog Page
    const TARGET_URL = 'https://beyondchats.com/blogs/';
    const { data } = await axios.get(TARGET_URL, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      }
    });
    
    const $ = cheerio.load(data);
    let articlesFound = [];

    $('h2 a, h3 a').each((i, el) => {
      if (articlesFound.length >= 5) return;
      
      const title = $(el).text().trim();
      const relativeLink = $(el).attr('href');
      
      if (title && relativeLink) {
        const link = relativeLink.startsWith('http') 
          ? relativeLink 
          : `https://beyondchats.com${relativeLink}`;
          
        articlesFound.push({ title, link });
      }
    });

    console.log(`Found ${articlesFound.length} potential articles.`);

    let savedCount = 0;
    for (const item of articlesFound) {
      const exists = await Article.findOne({ url: item.link });
      if (exists) {
        console.log(`Skipped duplicate: ${item.title}`);
        continue;
      }

      try {
        const pageRes = await axios.get(item.link);
        const $$ = cheerio.load(pageRes.data);
        
        const content = $$('div.entry-content, div.post-content, article, main').find('p').text().trim();

        if (content.length > 50) { 
          await Article.create({
            title: item.title,
            url: item.link,
            original_content: content.substring(0, 3000), 
            status: "Pending"
          });
          console.log(`Saved: ${item.title}`);
          savedCount++;
        }
      } catch (innerErr) {
        console.error(`Failed to scrape inner page: ${item.link}`);
      }
    }

    res.json({ 
      message: `Scraping finished. Saved ${savedCount} new articles.`,
      found: articlesFound.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scraping failed: " + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));