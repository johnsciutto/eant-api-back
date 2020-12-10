const express = require('express');
const { transporter, EMAIL_PERSONAL } = require('../utils/email-transporter');
const schema = require('../utils/form-validation');

const app = express.Router();

app.post('/', async (req, res) => {
  try {
    const { error: errorDeValidacion } = schema.validate(req.body, { abortEarly: false });
    const { correo, asunto, mensaje } = req.body;

    if (req.files) {
      const { archivo } = req.files;
      archivo.mv(`${__dirname}/public/uploads/${archivo.name}`, (err) => {
        if (err) console.log(err);
      });
    }

    if (errorDeValidacion) {
      const msg = {
        ok: false,
        error: errorDeValidacion.details.map((error) => error.message.replace(/"/g, '')),
      };
      res.send(`${msg}`);
    }

    if (!errorDeValidacion) {
      transporter.sendMail({
        from: correo,
        to: EMAIL_PERSONAL,
        replyTo: correo,
        subject: `Asunto: ${asunto}`,
        html: `<p>${mensaje}</p><br>`,
      });

      res.send('Mensaje enviado!');
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
