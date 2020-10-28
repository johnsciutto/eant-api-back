const express = require('express');
const nodemailer = require('nodemailer');
const joi = require('joi');
require('dotenv').config();

// * Configuracion de un objeto modelo para validar datos
const schema = joi.object({
  nombre: joi.string(),
  apellido: joi.string(),
  correo: joi.string().email({ minDomainSegments: 2 }),
  asunto: joi.number().integer(),
  archivo: joi.string(),
  mensaje: joi.string(),

});

// * Configuracion de un transporter para mandar emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// * Configuracion y Rutas de Express
const puerto = process.env.PORT || 3000;
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

app.post('/enviar', async (req, res) => {
  try {
    // ? Validando los datos del formulario
    const { error: errorDeValidacion } = schema.validate(req.body);

    // ? Desestructurando las variables del req.body
    const {
      correo, asunto, mensaje, archivo,
    } = req.body;

    // ? Si hay un error de validacion del formulario, logear el problema
    if (errorDeValidacion) console.log(errorDeValidacion);

    // ? Si no hay un error de validacion del formulario:
    // ?    - mandar el formulario a mi correo
    // ?    - mandar un mensaje al usuario diciendo "Mensaje enviado!"
    if (!errorDeValidacion) {
      transporter.sendMail({
        from: correo,
        to: process.env.EMAIL_PERSONAL,
        replyTo: correo,
        subject: `Asunto: ${asunto}`,
        html: `<p>${mensaje}</p><br><p>${archivo}</p>`,
      });

      res.send('Mensaje enviado!');
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(puerto, () => console.log(`Servidor funcionando en el puerto ${puerto}...`));
