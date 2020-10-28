const express = require('express');
const hbs = require('express-handlebars');
const withQuery = require('with-query').default;
const fetch = require('node-fetch');

END_POINT = 'http://api.giphy.com/v1/gifs/search';
API_KEY = process.env.API_KEY;
LIMIT = '2';

port = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 4545;

const app = express();
app.use(express.static('static'));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.engine(
  'hbs',
  hbs({
    defaultLayout: 'default.hbs',
  })
);

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/lucky', async (req, res) => {
  try {
    const response = await fetch(
      withQuery('http://api.giphy.com/v1/gifs/random', {
        api_key: API_KEY,
      })
    );

    jsonResponse = await response.json();
    const image = jsonResponse['data']['images']['original']['url'];

    res.status(200);
    res.render('searchPage', { image });
  } catch (err) {
    console.log(err);
    res.status(400);
    res.send('ERROR');
  }
});

app.post('/search', async (req, res) => {
  try {
    const response = await fetch(
      withQuery(END_POINT, {
        q: req.body.search,
        api_key: API_KEY,
        limit: LIMIT,
      })
    );

    jsonResponse = await response.json();
    if (jsonResponse['data'].length === 0) {
      return res.render('notFound');
    }
    const image = jsonResponse['data'][0]['images']['original']['url'];
    res.status(200);
    res.render('searchPage', { image });
  } catch (err) {
    console.log(err);
    res.status(400);
    res.send('ERROR');
  }
});

app.get('/trending', async (req, res) => {
  try {
    const response = await fetch(
      withQuery('http://api.giphy.com/v1/gifs/trending', {
        api_key: API_KEY,
        limit: 9,
      })
    );

    jsonResponse = await response.json();
    const images = jsonResponse['data'];
    let payload = [];

    images.forEach((image) => {
      payload.push(image.images.downsized.url);
    });
    res.status(200);
    res.render('trending', { payload });
  } catch (err) {
    console.log(err);
    res.status(400);
    res.send('ERROR');
  }
});

app.get('/', (req, res) => {
  res.status(200);
  res.type('text/html');
  res.render('landing');
});

app.use((req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Running on http://localhost:${port} at ${new Date()}`);
  console.log(`with key ${API_KEY}`);
});
