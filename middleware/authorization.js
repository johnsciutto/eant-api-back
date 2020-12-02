const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../utils/mongo-users-interface');

const { JWT_SECRET } = process.env;

const saltRounds = 10;

// const sessionStore = {};

/**
 * @param { string } sessionId
 * @returns { boolean } true if sessionId is a valid active session. Else false.
 * @description
 * Produce true if the sessionId is a valid active session.
 */
// const isValidSession = (sessionId) => sessionStore.hasOwnProperty(sessionId);

/**
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
 * @param { string } userId
 * @param { string } sessionId
 * @returns { object } - payload of a token
 */
const createTokenPayload = (userId, sessionId) => ({
  user_id: userId,
  SID: sessionId,
});

/**
 * @param { object } payload - the payload for a signed token
 * @returns { JsonWebToken } signed JSON Web Token.
 */
const createSignedToken = (payload) => jwt.sign(payload, JWT_SECRET);

/**
 * @returns { string } randomly generated string as a key, and true as it's
 * value to represent a session.
 */
const createSessionId = () => `S${Math.random().toString(36).slice(2)}`;

/**
 * @param { string } session
 * @returns { boolean } true if successful adding session to store, else return
 * false.
 */
// const addSessionToStore = (session) => {
//   if (!sessionStore.hasOwnProperty(session)) {
//     // TODO: Add a proper property and expiration date. Maybe separate the
//     // TODO: creating of the session object itself into a different function.
//     sessionStore[session] = { exp: 'This represents the expiration date...' };
//   } else {
//     addSessionToStore(createSessionId());
//   }
//   return session;
// };

/**
 * @param { object } obj - object containing two properties:
 * @param { string } obj.username
 * @param { string } obj.password
 * @returns { string | false } if the user is found in the database, return the
 * user_id, else return false.
 */
const validUser = async (obj) => {
  const { username, password } = obj;
  const user = await Users.find(username);
  bcrypt.compare(password, user.pass, (err, result) => {
    if (err) throw new Error(err);
    if (!result) return false;
    if (result) return user._id;
  });
};

/**
 * @param { object } obj
 * @param { string } obj.username
 * @param { string } obj.password
 * @returns { string | false } a valid cookie or false.
 * @description
 * Given an object with a username and a password, checks the username and the
 * password against the database, and if the user is found and the password is
 * correct, then returns a cookie used to validate the user on the site. Else,
 * returns false.
 */
const logInUser = async (obj) => {
  const userId = await validUser(obj);
  if (userId) {
    const sessionId = createSessionId();
    const payload = createTokenPayload(userId, sessionId);
    const token = createSignedToken(payload);
    return createCookie(token, {
      maxAge: 1000 * 60 * 1,
    });
  }
  return false;
};

/**
 * @param { object } user
 * @param { string } user.name
 * @param { string } user.email
 * @param { string } user.pass
 * @returns { string }
 * @description
 * given a user object, adds the user to the User database and collection. If
 * the operation is successful, returns the userId, else returns an empty
 * string. By default, the new users are granted access to the API.
 */
const signInUser = async (user) => {
  const newUser = { ...user, access: true, admin: false };
  await bcrypt.hash(user.pass, saltRounds, async (error, hashedPass) => {
    if (error) throw new Error(error);
    const result = await Users.insert({ ...newUser, pass: hashedPass });
    if (!result) return '';
    return result;
  });
};

/**
 * @param { object } req - The request object.
 * @param { object } res - The response object.
 * @param { function } next - A function that executes after the middleware is successfull.
 * @description
 * Perform a verification on the token recieved in the request object, and only
 * continue towards the route if the verification is successfull. Else redirect
 * the user to the appropiate endpoints.
 */
const verifyToken = async (req, res, next) => {
  const token = req.cookies._auth;
  try {
    // TODO: Investigate the following line:
    if (!token) /* return (is this necessary?) */ res.redirect('./login');
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) res.redirect('./login');
      else next();
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { logInUser, verifyToken, signInUser };
