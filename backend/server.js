const express = require('express');

const app = express();
const PORT = 3000;

const vapiRouter = require('./routes/vapi');

app.use(express.json());

app.get('/', (req, res) => {
  res.type('text').send('hello world');
});

app.use('/vapi', vapiRouter);

app.use((req, res) => {
  res.status(404).type('text').send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
