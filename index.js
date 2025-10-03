var express = require('express');
var app = express();
var cors = require('cors');
var dns = require('dns');

// Middleware
app.use(cors({optionsSuccessStatus: 200}));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Home route
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory storage for URLs
let urls = {};
let counter = 1;

// POST endpoint: create a short URL
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) return res.json({ error: 'invalid url' });

    const id = counter++;
    urls[id] = url;

    res.json({
      original_url: url,
      short_url: id
    });
  });
});

// GET endpoint: redirect using short URL
app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  const url = urls[id];

  if (!url) return res.json({ error: 'No short URL found' });

  res.redirect(url);
});

// Listener
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
