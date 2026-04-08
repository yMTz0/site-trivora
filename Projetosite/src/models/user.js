const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // Define se é Aluno (user) ou Professor (admin)
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  // Define o nível de acesso aos materiais
  subscriptionType: { 
    type: String, 
    enum: ['free', 'premium'], 
    default: 'free' 
  },
  // Lista de IDs de materiais que o usuário favoritou
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Material' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Criptografia de senha automática antes de salvar no banco
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);