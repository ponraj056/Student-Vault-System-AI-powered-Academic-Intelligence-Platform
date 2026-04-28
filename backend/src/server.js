const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const { connectDatabase } = require('./db/mongoose');
const apiRouter = require('./routes/api');
const whatsappRouter = require('./whatsapp');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);
app.use('/webhook', whatsappRouter);

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('[backend] unhandled error', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend:', error.message);
  process.exit(1);
});

module.exports = app;
