const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  original_content: { type: String, required: true },
  updated_content: { type: String, default: "" },
  reference_links: [String],
  status: { type: String, default: 'Pending' },
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', ArticleSchema);