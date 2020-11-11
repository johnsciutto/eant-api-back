const { openCollection, MOVIES_COLLECTION } = require('../../db');

module.exports = (app) => {
  app.route('/peliculas')
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

  app.route('/peliculas/:pelicula')
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
    .delete();
};
