const express = require('express');
const fileUpload = require('express-fileupload');
const authRoute = require('./routes/auth');
const { movieAPI, seriesAPI } = require('./routes/api-v1');
const contactRoute = require('./routes/contacto');
const mainRoute = require('./routes/main');

const port = process.env.PORT || 3000;

express()
// * Configuraciones
  .use(express.static('public'))
  .use(express.urlencoded({ extended: true }))
  .use(fileUpload())
// * Rutas
  .use('/', mainRoute)
  .use('/enviar', contactRoute)
  .use('/api/v1/auth', authRoute)
  .use('/api/v1/peliculas', movieAPI)
  .use('/api/v1/series', seriesAPI)
// * Listen
  .listen(port, () => console.log(`Back-End listening on port ${port}...`));
