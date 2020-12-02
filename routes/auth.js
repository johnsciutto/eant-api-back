const express = require('express');
const cookieParser = require('cookie-parser');
const { logInUser, signInUser } = require('../middleware/authorization');

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

module.exports = auth;
