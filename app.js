const express = require('express');
const nodemailer = require('nodemailer');
const joi = require('joi');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');

const {
  PORT,
  DB_NAME,
  DB_URL,
  MOVIES_COLLECTION,
  SERIES_COLLECTION,
} = process.env;

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
const puerto = PORT || 3000;
const app = express();
const API_V1 = express.Router();
app.use('/api/v1', API_V1);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

app.post('/enviar', async (req, res) => {
  try {
    // ? Validando los datos del formulario
    const { error: errorDeValidacion } = schema.validate(req.body, { abortEarly: false });

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
      const msg = {
        ok: false,
        error: errorDeValidacion.details.map((error) => error.message.replace(/"/g, '')),
      };
      res.send(`${msg}`);
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

const openCollection = async (collection, cb) => {
  try {
    const dbClient = new MongoClient(DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    await dbClient.connect();
    const database = dbClient.db(DB_NAME);
    const col = database.collection(collection);
    await cb(col);
    dbClient.close();
  } catch (err) {
    console.log(err);
  }
};

API_V1.route('/peliculas')
  .get(async (req, res) => {
    try {
      openCollection(MOVIES_COLLECTION, async (collection) => {
        const cursor = await collection.find({});
        const results = await cursor.toArray();
        await cursor.close;
        res.send(results);
      });
    } catch (err) {
      console.log(err);
    }
  })

  .post(async (req, res) => {
    try {
      openCollection(MOVIES_COLLECTION, async (collection) => {
        const inserted = await collection.insertOne(req.body);
        res.json(inserted.ops);
      });
    } catch (err) {
      console.log(err);
    }
  })

  // TODO: Implementar (preferiblemente con autenticacion)
  .delete(async (req, res) => {
    try {
      res.send('La operacion para borrar todas las peliculas todavia no fue implementada...');
    } catch (error) {
      console.log(error);
    }
  });

API_V1.route('/peliculas/:pelicula')
  .get(async (req, res) => {
    try {
      openCollection(MOVIES_COLLECTION, async (collection) => {
        const cursor = await collection
          .find({ $text: { $search: req.params.pelicula } })
          .project({ _id: 0 });
        const result = await cursor.toArray();
        if (result.length) res.send(result);
        else res.send('No se encontro ninguna pelicula por ese nombre');
      });
    } catch (error) {
      console.log(error);
    }
  })

  // TODO: Implementar
  .put()

  // TODO: Implementar
  .patch()

  // TODO: Implementar (preferiblemente con autenticacion)
  .delete((req, res) => {
  });

API_V1.route('/series')
  .get(async (req, res) => {
    try {
      openCollection(SERIES_COLLECTION, async (collection) => {
        const cursor = await collection.find({});
        const results = await cursor.toArray();
        await cursor.close;
        res.send(results);
      });
    } catch (err) {
      console.log(err);
    }
  })

  .post(async (req, res) => {
    try {
      openCollection(SERIES_COLLECTION, async (collection) => {
        const inserted = await collection.insertOne(req.body);
        res.json(inserted.ops);
      });
    } catch (err) {
      console.log(err);
    }
  })

  // TODO: Implementar (preferiblemente con autenticacion)
  .delete(async (req, res) => {
    try {
      res.send('La operacion para borrar todas las series todavia no fue implementada...');
    } catch (error) {
      console.log(error);
    }
  });

API_V1.route('/series/:serie')
  .get(async (req, res) => {
    try {
      openCollection(SERIES_COLLECTION, async (collection) => {
        const cursor = await collection
          .find({ $text: { $search: req.params.serie } })
          .project({ _id: 0 });
        const result = await cursor.toArray();
        if (result.length) res.send(result);
        else res.send('No se encontro ninguna serie por ese nombre');
      });
    } catch (error) {
      console.log(error);
    }
  })

  // TODO: Implementar
  .put()

  // TODO: Implementar
  .patch()

  // TODO: Implementar
  .delete();

app.listen(puerto, () => console.log(`Servidor funcionando en el puerto ${puerto}...`));
