const express = require('express');
const cookieParser = require('cookie-parser');
const { logInUser, signUpUser } = require('../middleware/authorization');

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
    const successfullNewUserId = await signUpUser({
      name,
      email,
      pass,
    });

    if (!successfullNewUserId) {
      response = {
        ok: false,
        message: 'Operation failed, no user was added to the database',
      };
    } else {
      const logInResponse = await logInUser({ username: name, password: pass });
      response = {
        ok: true,
        message: 'User created successfully',
        validToken: logInResponse.token,
      };
    }
    res.send(response);
  } catch (err) {
    throw new Error(err);
  }
});

auth.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const response = await logInUser({ username, password });

  if (!response.ok) {
    return res.send(response);
  }

  res.cookie('_auth', response.token, {
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  res.send(response);
});

auth.post('/logout', async (req, res) => {
  res.clearCookie('_auth');
  res.send(true);
});

module.exports = auth;
