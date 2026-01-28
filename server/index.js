const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const projectsRouter = require('./routes/projects');
const scriptsRouter = require('./routes/scripts');
const charactersRouter = require('./routes/characters');
const shotlistsRouter = require('./routes/shotlists');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('AI Novel Movie Server is running!');
});

app.use('/api/projects', projectsRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/shotlists', shotlistsRouter);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
