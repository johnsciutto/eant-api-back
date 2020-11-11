const { openCollection, SERIES_COLLECTION } = require('../../db');

module.exports = (app) => {
  app.route('/series')
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

  app.route('/series/:serie')
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
};
