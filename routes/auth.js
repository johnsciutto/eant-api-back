const express = require('express');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const auth = express();

auth.use(express.urlencoded({ extended: true }));
auth.use(express.json());

auth.route('/')
  .get((req, res) => {
    const jwtPayload = {
      name: 'John Sciutto',
      email: 'johnsciutto@gmail.com',
      expiresIn: 1400,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET);

    res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; SameSite=secure; path=/`]);

    res.send('Check if the token is in the authorization header');
  });

auth.route('/test')
  .get((req, res) => {
    const { cookie } = req.headers;
    res.send(`the cookie was read, and it was: ${cookie}`);
  });

module.exports = auth;
