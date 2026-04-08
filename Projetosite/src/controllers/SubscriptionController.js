const { MercadoPagoConfig, Preference } = require('mercadopago');
const User = require('../models/User');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Certifique-se de que o nome aqui é 'createCheckout' para bater com a rota
exports.createCheckout = async (req, res) => {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{
          title: 'Assinatura Premium EduInclusiva',
          quantity: 1,
          unit_price: 29.90,
          currency_id: 'BRL'
        }],
        external_reference: req.user.id.toString(),
        back_urls: { success: "https://www.google.com" },
        auto_return: "approved",
      }
    });
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Adicione esta função para o Mercado Pago não dar erro ao tentar avisar seu site
exports.webhook = async (req, res) => {
  console.log("Webhook recebido!");
  res.sendStatus(200);
};