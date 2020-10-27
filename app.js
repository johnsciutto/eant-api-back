const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// * NodeMailer ===============================================================

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'melisa47@ethereal.email',
    pass: 'jGCnUdsFttUj4TeRvY',
  },
});

// * Express ==================================================================
// ?------------------------------------------------------------------ Config
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ?--------------------------------------------------------------- Rutas GET
app.get('/', (req, res) => { res.redirect('/contacto.html'); });

// ?-------------------------------------------------------------- Rutas POST
app.post('/enviar', async (req, res) => {
  try {
    const contacto = req.body;

    transporter.sendMail({
      from: contacto.correo,
      to: 'john@johnsciutto.com',
      subject: `Asunto: ${contacto.asunto}`,
      html: `<blockquote>${contacto.mensaje}</blockquote>`,
    });

    res.send('Mensaje enviado!');
  } catch (err) {
    console.log(err);
  }
});

// ?------------------------------------------------------------------ Listen
app.listen(3000, () => console.log('Servidor funcionando en el puerto 2000.'));
