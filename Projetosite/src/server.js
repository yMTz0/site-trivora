require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Isso faz o Node servir os arquivos da pasta public

// Rota de teste
app.get('/', (req, res) => res.send("Servidor Online"));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => {
    console.log("✅ MongoDB Conectado!");
    app.listen(PORT, () => console.log(`🚀 Rodando em http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Erro MongoDB:", err.message));