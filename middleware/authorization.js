const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../utils/mongo-users-interface');

const { JWT_SECRET } = process.env;

const saltRounds = 10;

/**
 * Given a signed token and a configuration object, produce a cookie with a key
 * of "_auth", a value of the signed token with the given configurations.
 * @param {string} signedToken - a signed token
 * @param {object} config - a configuration object with the following possible
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
 * @returns {string} signed JSON Web Token.
 */
const createSignedToken = (payload) => jwt.sign(payload, JWT_SECRET);

/**
 * @param {object} obj - object containing two properties:
 * @property {string} obj.username
 * @property {string} obj.password
 * @returns {string|false} if the user is found in the database, return the
 * user_id, else return false.
 */
const validUser = async (obj) => {
  const { username, password } = obj;
  const user = await Users.find(username);
  if (!user) return false;
  const result = await bcrypt.compare(password, user.pass);
  if (result) return user._id;
  return false;
};

/**
 * @param {object} obj
 * @property {string} obj.username
 * @property {string} obj.password
 * @returns {string|boolean} a valid cookie or false.
 * @description
 * Given an object with a username and a password, checks the username and the
 * password against the database, and if the user is found and the password is
 * correct, then returns a cookie used to validate the user on the site. Else,
 * returns false.
 */
const logInUser = async (obj) => {
  const userId = await validUser(obj);
  if (userId) {
    const token = createSignedToken({ user_id: userId });
    return token;
  }
  return false;
};

/**
 * A user.
 * @typedef {object} User
 * @property {string} name - The user's username
 * @property {string} email - The user's email
 * @property {string} pass - The user's password
 */

/**
 * Given a user object, adds the user to the User database and collection. If
 * the operation is successful, returns the userId, else returns null.
 * By default, the new users are granted access to the API.
 * @param {User} user - A user
 * @returns {Promise<string|null>}
 */
const signInUser = async (user) => {
  const foundUser = await Users.find(user.name || user.email);
  if (foundUser) return null;
  const newUser = { ...user, access: true, admin: false };
  const hashedPassword = await bcrypt.hash(user.pass, saltRounds);
  if (!hashedPassword) return null;
  const result = await Users.insert({ ...newUser, pass: hashedPassword });
  return result;
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
  const { cookies } = req;

  try {
    // TODO: Investigate the following line:
    // !!! This is what I need to test and work on next...
    if (!token) return res.redirect('login');
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) res.redirect('login');
      else next();
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { logInUser, verifyToken, signInUser };
