const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGODB_URI,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  webhookAccessToken: process.env.WHATSAPP_ACCESS_TOKEN,
};
