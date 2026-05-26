const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.type('text').send('hello world');
});

app.post('/details', (req, res) => {
  const data = req.body || {};
  res.json({ received: data });
});

app.use((req, res) => {
  res.status(404).type('text').send('Not found');
});

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} in use.`);
      if (attemptsLeft > 0) {
        const nextPort = port + 1;
        console.log(`Trying port ${nextPort}...`);
        setTimeout(() => startServer(nextPort, attemptsLeft - 1), 500);
      } else {
        console.error('No available ports found. Exiting.');
        process.exit(1);
      }
    } else {
      throw err;
    }
  });
}

startServer(PORT);
