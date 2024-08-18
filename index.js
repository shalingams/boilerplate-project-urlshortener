require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const url = require('url');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

const urlDatabase = {};
let urlCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  let parserdUrl;
  try {
    parserdUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({error: 'invalid url'});
  }

  const hostname = parserdUrl.hostname;

  dns.lookup(hostname, (err, address, family) => {
    if (err) return res.json({error: 'invalid url'});

    let shourtUrl = Object.keys(urlDatabase).find(key => urlDatabase[key] === originalUrl);

    if (!shourtUrl){
      shourtUrl = urlCounter++;
      urlDatabase[shourtUrl] = originalUrl;

    }
    res.json({ original_url: originalUrl, short_url: shourtUrl });
  })
});

app.get('api/shortulr/:shourt_url', (req, res) => {
  const shortUrl = req.params.shourt_url;

  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl){
    res.redirect(originalUrl);
  }else{
    res.json({error: 'No short URL found for the given input'});
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
