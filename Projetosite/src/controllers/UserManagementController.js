const User = require('../models/User');

// Listar todos os usuários com filtros e paginação
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', subscription = '' } = req.query;
    
    // Construir query de filtro
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (subscription) query.subscriptionType = subscription;

    // Executar query com paginação
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter um usuário específico
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar usuário (admin pode editar qualquer campo)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, subscriptionType } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, subscriptionType },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado com sucesso', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar usuário
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Promover usuário para Premium
exports.upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionType: 'premium' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário promovido para Premium!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remover Premium do usuário
exports.downgradeToFree = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionType: 'free' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário rebaixado para Free', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tornar usuário Admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário promovido a Admin!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remover Admin do usuário
exports.demoteToUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'user' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário rebaixado para User', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
