const jwt = require('jsonwebtoken');
const Users = require('../utils/mongo-users-interface');

const { JWT_SECRET } = process.env;

const sessionStore = {};

/**
 * Produce true if the sessionId is a valid active session.
 * @param { string } sessionId
 * @returns { boolean } true if sessionId is a valid active session. Else false.
 */
const isValidSession = (sessionId) => sessionStore.hasOwnProperty(sessionId);

/**
 * Perform a verification on the token recieved in the request object, and only
 * continue towards the route if the verification is successfull. Else redirect
 * the user to the appropiate endpoints.
 * @param { object } req - The request object.
 * @param { object } res - The response object.
 * @param { function } next - A function that executes after the middleware is successfull.
 */
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
  if (!sessionStore.hasOwnProperty(session)) {
    // TODO: Add a proper property and expiration date. Maybe separate the
    // TODO: creating of the session object itself into a different function.
    sessionStore[session] = { exp: 'This represents the expiration date...' };
  } else {
    addSessionToStore(createSessionId());
  }
  return session;
};

/**
 * @param { object } obj - object containing two properties:
 * @param { string } obj.username
 * @param { string } obj.password
 * @returns { string | false } if the user is found in the database, return the
 *                             user_id, else return false.
 */
const validUser = (obj) => {
  const { username, password } = obj;
  const user = Users.find(username);
  // TODO: Hash password modification here...
  if (user.pass === password) return user._id;
  return false;
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
    return createCookie(token, {
      maxAge: 1000 * 60 * 1,
    });
  }
  return 'Unable to authenticate user';
};

module.exports = { authenticateUser, verifyToken };
