const User = require('../models/User');
const Material = require('../models/Material');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Exportar usuários para Excel
exports.exportUsersToExcel = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuários');

    // Definir colunas
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Tipo', key: 'role', width: 15 },
      { header: 'Assinatura', key: 'subscriptionType', width: 15 },
      { header: 'Data de Cadastro', key: 'createdAt', width: 20 }
    ];

    // Adicionar linhas
    users.forEach(user => {
      worksheet.addRow({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role === 'admin' ? 'Admin' : 'Usuário',
        subscriptionType: user.subscriptionType === 'premium' ? 'Premium' : 'Free',
        createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR')
      });
    });

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3A86FF' }
    };
    worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };

    // Configurar resposta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Exportar materiais para Excel
exports.exportMaterialsToExcel = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Materiais');

    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Título', key: 'title', width: 40 },
      { header: 'Disciplina', key: 'subject', width: 20 },
      { header: 'Nível', key: 'gradeLevel', width: 20 },
      { header: 'Condição', key: 'condition', width: 25 },
      { header: 'Tipo', key: 'isPremium', width: 15 },
      { header: 'Autor', key: 'author', width: 30 },
      { header: 'Data', key: 'createdAt', width: 20 }
    ];

    materials.forEach(material => {
      worksheet.addRow({
        _id: material._id.toString(),
        title: material.title,
        subject: material.subject || 'N/A',
        gradeLevel: material.gradeLevel || 'N/A',
        condition: material.condition || 'Geral',
        isPremium: material.isPremium ? 'Premium' : 'Gratuito',
        author: material.author ? material.author.name : 'Desconhecido',
        createdAt: new Date(material.createdAt).toLocaleDateString('pt-BR')
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3A86FF' }
    };
    worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=materiais.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Gerar relatório PDF com estatísticas
exports.generatePDFReport = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ subscriptionType: 'premium' });
    const totalMaterials = await Material.countDocuments();
    const premiumMaterials = await Material.countDocuments({ isPremium: true });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
    
    doc.pipe(res);

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('Relatório EduInclusiva', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);

    // Seção Usuários
    doc.fontSize(16).font('Helvetica-Bold').text('📊 Estatísticas de Usuários');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de Usuários: ${totalUsers}`);
    doc.text(`Usuários Premium: ${premiumUsers}`);
    doc.text(`Usuários Free: ${totalUsers - premiumUsers}`);
    doc.text(`Taxa de Conversão: ${totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0}%`);
    doc.moveDown(2);

    // Seção Materiais
    doc.fontSize(16).font('Helvetica-Bold').text('📚 Estatísticas de Materiais');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de Materiais: ${totalMaterials}`);
    doc.text(`Materiais Premium: ${premiumMaterials}`);
    doc.text(`Materiais Gratuitos: ${totalMaterials - premiumMaterials}`);
    doc.moveDown(2);

    // Distribuição por disciplina
    const subjectDist = await Material.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    doc.fontSize(16).font('Helvetica-Bold').text('📖 Distribuição por Disciplina');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    subjectDist.forEach(item => {
      doc.text(`${item._id || 'Não definido'}: ${item.count} materiais`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Exportar CSV simples de usuários
exports.exportUsersToCSV = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    let csv = 'ID,Nome,Email,Tipo,Assinatura,Data de Cadastro\n';
    
    users.forEach(user => {
      csv += `"${user._id}","${user.name}","${user.email}","${user.role}","${user.subscriptionType}","${new Date(user.createdAt).toLocaleDateString('pt-BR')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
