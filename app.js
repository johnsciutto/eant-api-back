const express = require('express');

const puerto = 2000;

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.listen(puerto);

app.get('/', (req, res) => {
  res.end('Este es un formulario de contacto');
});

app.post('/end', (req, res) => {
  console.log(req.body);
});
