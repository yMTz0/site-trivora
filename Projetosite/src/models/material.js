const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  fileType: String,
  subject: { 
    type: String, 
    enum: ['matemática', 'português', 'história', 'geografia', 'ciências', 'inglês'] 
  },
  gradeLevel: { 
    type: String, 
    enum: ['educação infantil', 'fundamental 1', 'fundamental 2', 'ensino médio'] 
  },
  condition: { 
    type: String, 
    enum: ['TDAH', 'dislexia', 'autismo', 'deficiência intelectual', 'superdotação'] 
  },
  isPremium: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);