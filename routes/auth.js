const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { JWT_SECRET } = process.env;

const sessionStore = {};

/**
 * @param { string } sessionId
 * @returns { boolean }
 * @description return true if the sessionId is a valid active session.
 */
const isValidSession = (sessionId) => sessionStore[sessionId];

const verifyToken = async (req, res, next) => {
  const token = req.cookies._auth;
  try {
    if (token) {
      // * decode the token
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          if (decoded && decoded.SID in sessionStore) {
            delete sessionStore[decoded.SID];
          }
          res.redirect('./');
        } else {
          next();
        }
      });
    } else {
      res.redirect('expired');
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * createCookieArr
 * @param { string } signedToken - a signed token
 * @param { object } config - a configuration object with the following possible
 *                            configurations:
 *                                - domain: String
 *                                - encode: Function
 *                                - expires: Date
 *                                - httpOnly: Boolean
 *                                - maxAge: Number
 *                                - path: String
 *                                - secure: Boolean
 *                                - signed: Boolean
 *                                - sameSite: Boolean or String
 *                            To find out more about the configurations, visit:
 *                            https://expressjs.com/en/5x/api.html#res.cookie
 * @returns { array }
 *    The returned array includes:
 *    - 0: "_auth",
 *    - 1: <signedToken>:string,
 *    - 2: Config object.
 */
const createCookie = (signedToken, config) => ['_auth', signedToken, config];

/**
 * createTokenPayload
 * @param { string } userId
 * @param { string } sessionId
 * @returns { object } - payload of a token
 */
const createTokenPayload = (userId, sessionId) => ({
  user_id: userId,
  SID: sessionId,
});

/**
 * createSignedToken
 * @param { object } payload - the payload for a signed token
 * @returns { JsonWebToken } signed JSON Web Token.
 */
const createSignedToken = (payload) => jwt.sign(payload, JWT_SECRET);

/**
 * createSessionId
 * @returns { object } randomly generated string as a key, and true as it's
 *                     value to represent a session.
 */
const createSessionId = () => `S${Math.random().toString(36).slice(2)}`;

/**
 * addSessionToStore
 * @param { string } session
 * @returns { boolean } true if successful adding session to store, else return
 *                      false.
 */
const addSessionToStore = (session) => {
  if (!sessionStore.includes(session)) {
    sessionStore.push(session);
  } else {
    addSessionToStore(createSessionId());
  }
  return session;
};

/**
 * validUser
 * @param { object } obj - object containing two properties:
 * @param { string } obj.username
 * @param { string } obj.password
 * @returns { string | false } if the user is found in the database, return the
 *                             user_id, else return false.
 * TODO: !!!
 * TODO: Maybe this function should be part of the database operations for users.
 */
const validUser = (obj) => {
  // checks obj.username and obj.password against the database;
  // returns either a user_id or false;
};

// TODO: 1. Crear una colleccion en mi base de datos de usuarios
// TODO:      - crear dos usuarios modelo
// TODO: 2. Crear un modulo en mi interface de MongoDB para operar sobre los usuarios
// TODO: 3. Aplicar

// TODO: Crear una funcion que cada un intervalo de tiempo determinado hace una
// TODO: busqueda de sessiones que estan vencidas y las borra del array.
// TODO:    (Date.now() > session.expires) -> borrar 'session'

const authenticateUser = (obj) => {
  const userId = validUser(obj);
  const sessionId = createSessionId();
  const success = addSessionToStore(sessionId);
  if (success) {
    const payload = createTokenPayload(userId, sessionId);
    const token = createSignedToken(payload);
    return createCookie(token);
  }
  return 'Unable to authenticate user';
};

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
