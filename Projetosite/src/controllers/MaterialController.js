const Material = require('../models/Material');
// ... resto do código igual ao primeiro que te passei

exports.createMaterial = async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      author: req.user.id
    };
    const material = new Material(materialData);
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const userType = req.user.subscriptionType;
    let query = {};
    
    // Se não for premium, só vê materiais básicos
    if (userType !== 'premium') {
      query.isPremium = false;
    }

    const materials = await Material.find(query).populate('author', 'name');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};