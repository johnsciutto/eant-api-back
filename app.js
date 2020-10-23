const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

// * NodeMailer ===============================================================

const miniOutlook = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'olin.homenick@ethereal.email',
    pass: 'NyqmM24VxJmk7CKv6R',
  },
});

// * Express ==================================================================
app
  // ?------------------------------------------------------------------ Config
  .use(express.static('public'))
  .use(express.urlencoded({ extended: true }))

// ?--------------------------------------------------------------- Rutas GET
  .get('/', (req, res) => { res.redirect('/contacto.html'); })

  // ?-------------------------------------------------------------- Rutas POST
  .post('/enviar', (req, res) => {
    const contacto = req.body;

    miniOutlook.sendMail({
      from: contacto.correo,
      to: 'john@johnsciutto.com',
      subject: `Asunto #${contacto.asunto}`,
      html: `<blockquote>${contacto.mensaje}</blockquote>`,
    });

    res.send('Mensaje enviado!');
  })

  // ?------------------------------------------------------------------ Listen
  .listen(2000, () => console.log('Servidor funcionando en el puerto 2000.'));
