const User = require('../models/User');
const Material = require('../models/Material');

// Dashboard principal - estatísticas gerais
exports.getDashboardStats = async (req, res) => {
  try {
    // Contadores básicos
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ subscriptionType: 'premium' });
    const freeUsers = totalUsers - premiumUsers;
    const totalMaterials = await Material.countDocuments();
    const premiumMaterials = await Material.countDocuments({ isPremium: true });

    // Novos usuários nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Taxa de conversão
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;

    res.json({
      users: {
        total: totalUsers,
        premium: premiumUsers,
        free: freeUsers,
        new: newUsers,
        conversionRate: parseFloat(conversionRate)
      },
      materials: {
        total: totalMaterials,
        premium: premiumMaterials,
        free: totalMaterials - premiumMaterials
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Gráfico de crescimento mensal de usuários
exports.getUserGrowth = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Formatar para o gráfico
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const chartData = users.map(item => ({
      month: monthNames[item._id.month - 1],
      users: item.count
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Distribuição de materiais por disciplina
exports.getMaterialsBySubject = async (req, res) => {
  try {
    const distribution = await Material.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const chartData = distribution.map(item => ({
      subject: item._id || 'Não definido',
      count: item.count
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Distribuição por nível escolar
exports.getMaterialsByGrade = async (req, res) => {
  try {
    const distribution = await Material.aggregate([
      {
        $group: {
          _id: "$gradeLevel",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const chartData = distribution.map(item => ({
      grade: item._id || 'Não definido',
      count: item.count
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Distribuição por condição especial
exports.getMaterialsByCondition = async (req, res) => {
  try {
    const distribution = await Material.aggregate([
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const chartData = distribution.map(item => ({
      condition: item._id || 'Geral',
      count: item.count
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Últimas atividades (últimos materiais e usuários)
exports.getRecentActivity = async (req, res) => {
  try {
    const recentMaterials = await Material.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name email')
      .select('title createdAt subject isPremium author');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subscriptionType role createdAt');

    res.json({
      materials: recentMaterials,
      users: recentUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
