// src/controllers/AuthController.js - ATUALIZADO
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ error: "Este e-mail já está em uso" }); // Erro específico
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "Sucesso!", user });
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar usuário" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "E-mail não encontrado" }); // Erro específico
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Senha incorreta" }); // Erro específico
    }

    const token = jwt.sign({ id: user._id, subscriptionType: user.subscriptionType }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.name, subscription: user.subscriptionType } });
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
};