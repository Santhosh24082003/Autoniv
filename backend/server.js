const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const vapiRouter = require('./routes/vapi');
const webhooksRouter = require('./routes/webhooks');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'autoniv-api' });
});

app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/vapi', vapiRouter);
app.use('/webhooks', webhooksRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'autoniv-api', port: PORT });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
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

async function bootstrap() {
  await initDatabase();
  startServer(PORT);
}

bootstrap().catch((error) => {
  console.error('Failed to initialize the database:', error);
  process.exit(1);
});
