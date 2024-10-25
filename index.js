const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const urlderana = 'https://sinhala.adaderana.lk/sinhala-hot-news.php';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

async function scrapeDescription(newsUrl) {
  try {
    const response = await axios.get(newsUrl);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const newsDescription = $('.news-content p').text();
      return newsDescription;
    }
  } catch (error) {
    console.error('Error scraping description:', error);
  }
  return '';
}

async function scrapeImage(newsUrl) {
  try {
    const response = await axios.get(newsUrl);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const imageUrl = $('div.news-banner img.img-responsive').attr('src');
      return imageUrl;
    }
  } catch (error) {
    console.error('Error scraping image:', error);
  }
  return '';
}

// Route
app.get('/derana', async (req, res) => {
  try {
    const response = await axios.get(urlderana);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const newsArticle = $('.story-text').first();
      const newsHeadline = newsArticle.find('h2 a').text();
      const newsDate = newsArticle.find('.comments span').text().trim();
      const newsTime = newsArticle.find('.comments span').next().text().trim();
      const fullTime = (newsDate + ' ' + newsTime).trim();
      const newsUrl = 'https://sinhala.adaderana.lk/' + newsArticle.find('h2 a').attr('href');
      const newsDescription = await scrapeDescription(newsUrl);
      const imageUrl = await scrapeImage(newsUrl);
      const newsData = {
        title: newsHeadline,
        description: newsDescription,
        image: imageUrl,
        time: fullTime,
        new_url: newsUrl,
        creator: "Pink-Venom"
      };

      res.json(newsData);
    } else {
      throw new Error('Failed to fetch data from the website');
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/ada', async (req, res) => {
  try {
       const url = 'https://www.ada.lk/latest-news/11';
       const { data } = await axios.get(url);
        if (response.status === 200) {
        const $ = cheerio.load(data);
        const latestNews = $('.cat-b-row').first(); // Get the first article
        const link = latestNews.find('h5 a').attr('href');
        const date = latestNews.find('.far.fa-clock').parent().text().trim();
        const image = latestNews.find('img').attr('src');

        const data2 = await axios.get(link);
        const $2 = cheerio.load(data2.data);
        const title = $2('title').text().trim();
        const description = $2('.single-body-wrap p')
        .map((i, el) => $(el).text().trim())
        .get()
        .join(' ');


        // Create an object for the latest news
        const latestNewsItem = {
            title,
            link,
            date,
            description,
            image,
            powerd_by: "PINK VENOM OFC" 
        };

      res.json(latestNewsItem);
    } else {
      throw new Error('Failed to fetch data from the website');
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
