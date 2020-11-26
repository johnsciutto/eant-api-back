const express = require('express');
const { Movies, Series } = require('../database/mongo-interface');

const createAPI = (databaseCollection) => {
  const app = express.Router();

  app.route('/')
    .get(async (req, res) => {
      try {
        const result = await databaseCollection.find();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    })

    .post(async (req, res) => {
      try {
        const result = await databaseCollection.insert(req.body);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    })

    .delete(async (req, res) => {
      const { flag, password } = req.body;
      try {
        const result = await databaseCollection.delete(flag, password);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

  app.route('/:param')
    .get(async (req, res) => {
      try {
        const result = await databaseCollection.find(req.params.param);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    .put(async (req, res) => {
      try {
        const result = await databaseCollection.update(req.params.param, req.body);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    .delete(async (req, res) => {
      const filter = req.params.param;
      const { flag } = req.body;
      try {
        const result = await databaseCollection.delete(filter, flag);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

  return app;
};

const movieAPI = createAPI(Movies);
const seriesAPI = createAPI(Series);

module.exports = { movieAPI, seriesAPI };
