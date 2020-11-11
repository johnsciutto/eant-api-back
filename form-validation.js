const joi = require('joi');

// * Configuracion de un objeto modelo para validar datos
const schema = joi.object({
  nombre: joi.string().max(30).required(),
  apellido: joi.string().required(),
  correo: joi.string().email({ minDomainSegments: 2 }).required(),
  asunto: joi.number().integer().required(),
  mensaje: joi.string().required(),
});

module.exports = schema;
