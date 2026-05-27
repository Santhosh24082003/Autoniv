const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const vapiRouter = require('./routes/vapi');

app.use(express.json());

app.get('/', (req, res) => {
  res.type('text').send('hello world');
});

app.use('/vapi', vapiRouter);

app.use((req, res) => {
  res.status(404).type('text').send('Not found');
});

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.log(`Port ${port} is in use, trying ${nextPort}...`);
      startServer(nextPort, attemptsLeft - 1);
      return;
    }

    throw err;
  });
}

startServer(PORT);
