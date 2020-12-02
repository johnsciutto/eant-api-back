const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { verifyToken, logInUser, signInUser } = require('../middleware/authorization');

const auth = express();

auth.use(express.urlencoded({ extended: true }));
auth.use(express.json());
auth.use(cookieParser());

auth.post('/signup', async (req, res) => {
  try {
    let response;
    const {
      name, email, pass, confirmPass,
    } = req.body;
    if (pass !== confirmPass) {
      response = {
        ok: false,
        message: 'The passwords do not match',
      };
    }
    const successfullNewUserId = await signInUser({ name, email, pass });

    // TODO: For some reason the following is not waiting for the above function
    // TODO:  to finish executing, and so 'successfullNewUserId' is always
    // TODO:  'undefined'. I asked the question in the freeCodeCamp forum.

    if (!successfullNewUserId) {
      response = {
        ok: false,
        message: 'Operation failed, no user was added to the database',
      };
    } else {
      response = {
        ok: true,
        message: 'User created successfully',
        user_id: successfullNewUserId,
      };
    }
    res.send(response);
  } catch (err) {
    throw new Error(err);
  }
});

auth.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userCookie = await logInUser({ username, password });
  if (!userCookie) res.redirect('./login');
  if (userCookie) {
    res.cookie(userCookie);
    res.send(`This now redirects to the panel... The given cookie is: </br> ${userCookie}`);
  }
});

auth.get('/', (req, res) => {
  res.send('This is the log-in page. To actually log in, click the button: </br> <form action="./" method="POST"><button type="submit">Log-In</button></form>');
});

auth.post('/', (req, res) => {
  req.body.username = 'johnsciutto';
  req.body.password = '12345';

  const cookie = authenticateUser(req.body);
  if (!cookie) res.send('Cookie not created because authentication failed');
  else {
    res.cookie(...cookie);
    res.send('I\'ve created the token and sent it as a cookie. Click <a href="./test">Here</a> to see the actual contents of the cookie!');
  }
});

auth.get('/test', verifyToken, (req, res) => {
  res.send(`Here is the token: ${req.cookies._auth}`);
});

auth.get('/expired', (req, res) => {
  res.send('The token expired, please log in again. <a href="./">Click here to generate another token</a>');
});

module.exports = auth;
