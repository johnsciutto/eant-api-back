const express = require('express');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const { movieAPI, seriesAPI } = require('./routes/api-v1');
const contactRoute = require('./routes/contact');
const mainRoute = require('./routes/main');
const testRoute = require('./routes/test');

const port = process.env.PORT || 3000;

express()
  // * Configurations
  .use(express.static('public'))
  .use(express.urlencoded({ extended: true }))
  .use(fileUpload())
  .use(cookieParser())
  // * Routes
  .use('/', mainRoute)
  .use('/contact', contactRoute)
  .use('/test', testRoute)
  .use('/api/v1/auth', authRoute)
  .use('/api/v1/movies', movieAPI)
  .use('/api/v1/series', seriesAPI)
  // * Listen
  .listen(port, () => console.log(`Back-End listening on port ${port}...`));
