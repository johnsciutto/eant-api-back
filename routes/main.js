const express = require('express');

const app = express();

app.get('/', (req, res) => { res.redirect('/contacto.html'); });

module.exports = app;
