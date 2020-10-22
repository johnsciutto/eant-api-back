const express = require('express');

const puerto = 2000;

const app = express();

app.listen(puerto);
app.use(express.urlencoded({ extended: true }));

app.get('/contacto', (req, res) => {
  res.end('Este es un formulario de contacto');
});

app.post('/end', (req, res) => {
  console.log(req.body);
});
