const express = require('express');
const nodemailer = require('nodemailer');
const joi = require('joi');
require('dotenv').config();

const app = express();

const schema = joi.object({
  nombre: joi.string(),
  apellido: joi.string(),
  correo: joi.string().email({ minDomainSegments: 2 }),
  asunto: joi.number().integer(),
  archivo: joi.string(),
  mensaje: joi.string(),

});

// * NodeMailer ===============================================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// * Express =====================================================================
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

app.post('/enviar', async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);

    const {
      correo, asunto, mensaje, archivo,
    } = req.body;

    if (error) console.log(error);

    // Mandar mail solo si no hay un error existe.
    if (!error) {
      transporter.sendMail({
        from: correo,
        to: process.env.EMAIL_PERSONAL,
        replyTo: correo,
        subject: `Asunto: ${asunto}`,
        html: `<blockquote>${mensaje}</blockquote><br><blockquote>${archivo}</blockquote>`,
      });

      res.send('Mensaje enviado!');
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => console.log('Servidor funcionando en el puerto 3000.'));
