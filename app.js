const express = require('express');
const fileUpload = require('express-fileupload');
const authRoute = require('./routes/auth');
const movieRoute = require('./routes/api/movies-v1');
const seriesRoute = require('./routes/api/series-v1');
const contactRoute = require('./routes/contacto');
const mainRoute = require('./routes/main');

const puerto = process.env.PORT || 3000;

// * Configuracion y Rutas de Express
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use('/', mainRoute);
app.use('/enviar', contactRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/peliculas', movieRoute);
app.use('/api/v1/series', seriesRoute);


app.listen(puerto, () => console.log(`Servidor funcionando en el puerto ${puerto}...`));
