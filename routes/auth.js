const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { verifyToken, authenticateUser } = require('../middleware/authorization');

const auth = express();

auth.use(express.urlencoded({ extended: true }));
auth.use(express.json());
auth.use(cookieParser());

auth.get('/', (req, res) => {
  res.send('This is the log-in page. To actually log in, click the button: </br> <form action="./" method="POST"><button type="submit">Log-In</button></form>');
});

auth.post('/', (req, res) => {
  const cookie = authenticateUser(req.body);
  res.cookie(...cookie);

  res.send('I\'ve created the token and sent it as a cookie. Click <a href="./test">Here</a> to see the actual contents of the cookie!');
});

auth.get('/test', verifyToken, (req, res) => {
  res.send(`Here is the token: ${req.cookies._auth}`);
});

auth.get('/expired', (req, res) => {
  res.send('The token expired, please log in again. <a href="./">Click here to generate another token</a>');
});

module.exports = auth;
