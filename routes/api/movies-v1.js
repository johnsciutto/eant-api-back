const { ObjectId } = require('mongodb');
const express = require('express');
const { openCollection, MOVIES_COLLECTION, isValidId } = require('../../db');

const { DELETE_PASSWORD } = process.env;

module.exports = (app) => {
  app.use(express.urlencoded({ extended: true }));

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

    .delete(async (req, res) => {
      if (req.body.password && req.body.password === DELETE_PASSWORD) {
        try {
          openCollection(MOVIES_COLLECTION, async (collection) => {
            const result = await collection.deleteMany({});
            res.send(`${result.deletedCount} peliculas fueron borradas con exito`);
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        res.send('No tenes la autorizacion para eliminar todas las peliculas');
      }
    });

  app.route('/peliculas/:pelicula')
    .get(async (req, res) => {
      try {
        openCollection(MOVIES_COLLECTION, async (collection) => {
          const cursor = await collection
            .find({ $text: { $search: req.params.pelicula } });
            // .project({ _id: 0 });
          const result = await cursor.toArray();
          if (result.length) res.send(result);
          else res.send('No se encontro ninguna pelicula por ese nombre');
        });
      } catch (error) {
        console.log(error);
      }
    })

    .put(async (req, res) => {
      const id = req.params.pelicula;
      if (!isValidId(id)) {
        const error = 'El ID es invalido';
        res.send(error);
        throw new Error(error);
      } else {
        const filterObject = { _id: ObjectId(id) };
        try {
          openCollection(MOVIES_COLLECTION, async (collection) => {
            const { result } = await collection.updateOne(filterObject, { $set: { ...req.body } });
            if (result.ok) res.send('Pelicula actualizada exitosamente');
            else res.send('Error al actualizar la pelicula');
          });
        } catch (error) {
          console.log(error);
        }
      }
    })

    .delete(async (req, res) => {
      const id = req.params.pelicula;
      if (!isValidId(id)) res.send('Id es invalido');
      const filterObject = { _id: ObjectId(id) };
      try {
        openCollection(MOVIES_COLLECTION, async (collection) => {
          const result = await collection.deleteOne(filterObject);
          if (!result.deletedCount) {
            res.send('Error al borrar la pelicula');
          } else {
            res.send('Pelicula borrada exitosamente');
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
};
