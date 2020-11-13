const express = require('express');
const { Movies } = require('../../database/mongo-interface');

module.exports = (app) => {
  app.use(express.urlencoded({ extended: true }));

  app.route('/peliculas')
    .get(async (req, res) => {
      try {
        const result = await Movies.find();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    })

    .post(async (req, res) => {
      try {
        const result = await Movies.insert(req.body);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    })

    .delete(async (req, res) => {
      const { flag, password } = req.body;
      try {
        const result = await Movies.delete(flag, password);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

  app.route('/peliculas/:pelicula')
    .get(async (req, res) => {
      try {
        const result = await Movies.find(req.params.pelicula);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    .put(async (req, res) => {
      try {
        const result = await Movies.update(req.params.pelicula, req.body);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    .delete(async (req, res) => {
      const filter = req.params.pelicula;
      const { flag } = req.body;
      try {
        const result = await Movies.delete(filter, flag);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
};
