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
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'melisa47@ethereal.email',
    pass: 'jGCnUdsFttUj4TeRvY',
  },
});

// * Express =====================================================================
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

app.post('/enviar', async (req, res) => {
  try {
    const contacto = req.body;

    const { error, value } = schema.validate(contacto);

    if (error) console.log(error);

    // Mandar mail solo si no hay un error existe.
    if (!error) {
      transporter.sendMail({
        from: contacto.correo,
        to: 'john@johnsciutto.com',
        subject: `Asunto: ${contacto.asunto}`,
        html: `<blockquote>${contacto.mensaje}</blockquote><br><blockquote>${contacto.archivo}</blockquote>`,
      });

      res.send('Mensaje enviado!');
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => console.log('Servidor funcionando en el puerto 3000.'));
