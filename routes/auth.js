const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { JWT_SECRET } = process.env;

const verifyToken = async (req, res, next) => {
  const token = req.cookies._auth;

  try {
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);

      // TODO: DELETE FROM HERE ||||||||||||||||||||||||||||||
      console.log('--------------------------------');
      console.log({ decoded });
      console.log('--------------------------------');
      // TODO: DELETE TO HERE ||||||||||||||||||||||||||||||||
    } else {
      // TODO: DELETE FROM HERE ||||||||||||||||||||||||||||||
      console.log('--------------------test------------');
      console.log('El token expiro');
      console.log('--------------------------------');
      // TODO: DELETE TO HERE ||||||||||||||||||||||||||||||||
    }
  } catch (error) {
    console.log(error);
  }

  next();
};

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

  res.cookie('_auth', token, {
    sameSite: 'lax',
    expires: new Date(2020, 10, 28),
    secure: false,
  });

  // res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; SameSite=secure; path=/`]);

  res.send('Check if the token is in the authorization header');
});

auth.get('/test', verifyToken, (req, res) => {
  const { cookie } = req.headers;
  const [key, value] = cookie.split('=');
  res.send({ [key]: value });
});

auth.get('/test2', (req, res) => {
  res.send(req.cookies);
});

module.exports = auth;
