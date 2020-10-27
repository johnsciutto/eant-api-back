const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// * NodeMailer ===============================================================

const miniOutlook = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // TODO: Cambiar el host y el puerto para GMail
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// * Express ==================================================================
// ?------------------------------------------------------------------ Config
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ?--------------------------------------------------------------- Rutas GET
app.get('/', (req, res) => { res.redirect('/contacto.html'); });

// ?-------------------------------------------------------------- Rutas POST
app.post('/enviar', (req, res) => {
  const contacto = req.body;

  miniOutlook.sendMail({
    from: contacto.correo,
    to: 'john@johnsciutto.com',
    subject: `Asunto #${contacto.asunto}`,
    html: `<blockquote>${contacto.mensaje}</blockquote>`,
  });

  res.send('Mensaje enviado!');
});

// ?------------------------------------------------------------------ Listen
app.listen(2000, () => console.log('Servidor funcionando en el puerto 2000.'));
