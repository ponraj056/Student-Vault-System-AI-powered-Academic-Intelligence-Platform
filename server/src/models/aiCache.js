/**
 * AI Cache Model
 * Stores pre-computed query results to serve AI responses instantly
 */
const mongoose = require('mongoose');

const aiCacheSchema = new mongoose.Schema({
  key:         { type: String, required: true, unique: true, index: true }, // e.g. "TOPPER_5_cse"
  intent:      { type: String, required: true },
  dept:        { type: String, default: 'all' },
  params:      { type: mongoose.Schema.Types.Mixed, default: {} },
  data:        { type: mongoose.Schema.Types.Mixed, default: [] },
  message:     { type: String, default: '' },
  computedAt:  { type: Date, default: Date.now },
  ttl:         { type: Number, default: 3600 }, // seconds — 1 hour
});

// TTL index: MongoDB auto-deletes stale cache after ttl seconds
aiCacheSchema.index({ computedAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('AiCache', aiCacheSchema, 'ai_cache');
