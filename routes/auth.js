const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { JWT_SECRET } = process.env;

const auth = express();

auth.use(express.urlencoded({ extended: true }));
auth.use(express.json());
auth.use(cookieParser());

auth.get('/', (req, res) => {
  const jwtPayload = {
    name: 'John Sciutto',
    email: 'test@test.com',
    expiresIn: '3hs',
  };

  const token = jwt.sign(jwtPayload, JWT_SECRET);

  res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; SameSite=secure; path=/`]);

  res.send('Check if the token is in the authorization header');
});

auth.get('/test', (req, res) => {
  const { cookie } = req.headers;
  res.send(`the cookie was read, and it was: ${cookie}`);
});

module.exports = auth;
