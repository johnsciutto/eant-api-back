const express = require('express');
const nodemailer = require('nodemailer');
const joi = require('joi');
const fileUpload = require('express-fileupload');

// * Configuracion de un objeto modelo para validar datos
const schema = joi.object({
  nombre: joi.string().max(30).required(),
  apellido: joi.string().required(),
  correo: joi.string().email({ minDomainSegments: 2 }).required(),
  asunto: joi.number().integer().required(),
  mensaje: joi.string().required(),
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
app.use(fileUpload());

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

app.post('/enviar', async (req, res) => {
  try {
    // ? Validando los datos del formulario
    const { error: errorDeValidacion } = schema.validate(req.body);

    // ? Desestructurando las variables del req.body
    const {
      correo, asunto, mensaje,
    } = req.body;

    // ? Desestructurando la variable del req.files
    const { archivo } = req.files;

    // ? Si hay un archivo, mover el archivo a /public/uploads
    if (archivo) {
      archivo.mv(`${__dirname}/public/uploads/${archivo.name}`, (err) => {
        if (err) console.log(err);
      });
    }

    // ? Si hay un error de validacion del formulario, mandar el problema al front
    if (errorDeValidacion) {
      res.send(`${errorDeValidacion.message}`);
    }

    // ? Si no hay un error de validacion del formulario:
    // ?    - mandar el formulario a mi correo
    // ?    - mandar un mensaje al usuario diciendo "Mensaje enviado!"
    if (!errorDeValidacion) {
      transporter.sendMail({
        from: correo,
        to: process.env.EMAIL_PERSONAL,
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

app.listen(puerto, () => console.log(`Servidor funcionando en el puerto ${puerto}...`));
