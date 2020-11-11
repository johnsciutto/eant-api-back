const express = require('express');
const fileUpload = require('express-fileupload');
const { transporter, EMAIL_PERSONAL } = require('./email-transporter');
const { schema } = require('./form-validation');

const MOVIE_API_V1 = express.Router();
require('./routes/api/movies-v1')(MOVIE_API_V1);

const SERIES_API_V1 = express.Router();
require('./routes/api/series-v1')(SERIES_API_V1);

// * Configuracion y Rutas de Express
const puerto = process.env.PORT || 3000;
const app = express();
app.use('/api/v1', MOVIE_API_V1);
app.use('/api/v1', SERIES_API_V1);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

app.post('/enviar', async (req, res) => {
  try {
    const { error: errorDeValidacion } = schema.validate(req.body, { abortEarly: false });
    const { correo, asunto, mensaje } = req.body;
    const { archivo } = req.files;

    if (archivo) {
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

app.listen(puerto, () => console.log(`Servidor funcionando en el puerto ${puerto}...`));
