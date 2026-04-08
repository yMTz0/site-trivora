const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Pega o token do cabeçalho da requisição
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Salva os dados do usuário na requisição
    next(); // Vai para a próxima função (o controller)
  } catch (err) {
    res.status(400).json({ error: 'Token inválido.' });
  }
};