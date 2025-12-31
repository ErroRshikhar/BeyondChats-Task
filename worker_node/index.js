require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

const API_KEY = process.env.OPENAI_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL || 'https://beyondchat-backend-f67f.onrender.com';
const openai = new OpenAI({ apiKey: API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getGoogleContext(query) {
  console.log(`🔍 Searching Google for: "${query}"`);
  let contextData = "";
  let references = [];

  try {
    // 1. Fetch Google Search Page
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    const { data } = await axios.get(googleUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      }
    });

    const $ = cheerio.load(data);
    $('div.g').each((i, element) => {
      if (references.length >= 2) return;

      const link = $(element).find('a').attr('href');

      if (link && link.startsWith('http') && !link.includes('google.com') && !link.includes('beyondchats.com')) {
        console.log(`  -> Found Source: ${link}`);
        references.push(link);
      }
    });

    for (const url of references) {
      try {
        const pageRes = await axios.get(url, { 
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        const $$ = cheerio.load(pageRes.data);
        
        const text = $$('p').text().slice(0, 800).replace(/\s+/g, ' ').trim();
        if (text.length > 50) {
           contextData += `SOURCE (${url}): ${text}\n\n`;
        }
      } catch (scrapeErr) {
        console.log(`  -> ⚠️ Skipped ${url} (Load failed)`);
      }
    }

  } catch (err) {
    console.error(`Search Error: ${err.message}`);
    contextData = "Search failed. Please improve the article using general professional knowledge.";
  }

  return { contextData, references };
}

async function runWorker() {
  console.log("🚀 Worker Node.js Script Started...");

  while (true) {
    try {
      let articles = [];
      try {
        const res = await axios.get(BACKEND_URL);
        articles = res.data;
      } catch (e) {
        console.log("Waiting for Backend...");
        await sleep(5000);
        continue;
      }

      const pending = articles.filter(a => a.status === 'Pending');

      if (pending.length === 0) {
        process.stdout.write(".");
        await sleep(5000);
        continue;
      }

      console.log(`\nFound ${pending.length} pending articles.`);

      for (const article of pending) {
        console.log(`\n⚡ Processing: ${article.title}`);

        await axios.patch(`${BACKEND_URL}/${article._id}`, { status: 'Processing' });

        const { contextData, references } = await getGoogleContext(article.title);

        const prompt = `
          Original Article: "${article.original_content.slice(0, 1500)}..."
          
          New Research: ${contextData}
          
          Task: Rewrite the article to be more professional. 
          Use HTML tags (<p>, <h3>, <ul>).
        `;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo",
        });

        const newContent = completion.choices[0].message.content;

        await axios.patch(`${BACKEND_URL}/${article._id}`, {
          updated_content: newContent,
          reference_links: references,
          status: 'Completed'
        });

        console.log(`Finished: ${article.title}`);
        await sleep(2000);
      }

    } catch (err) {
    console.error(`❌ Search Error: ${err.message}`);
    contextData = "AI enhancement based on general knowledge (Search limit reached).";
    references = ["https://en.wikipedia.org/wiki/Artificial_intelligence", "https://techcrunch.com/"];
    }
  }
}
runWorker();
