const express = require('express');
const env = require('../config/env');

const router = express.Router();

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.webhookVerifyToken) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ ok: false, message: 'Webhook verification failed' });
});

router.post('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (env.webhookAccessToken && token !== env.webhookAccessToken) {
    return res.status(401).json({ ok: false, message: 'Unauthorized webhook call' });
  }

  return res.status(200).json({ ok: true, received: true, payload: req.body });
});

module.exports = router;
