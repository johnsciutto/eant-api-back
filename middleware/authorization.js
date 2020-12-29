const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../utils/mongo-users-interface');

const { JWT_SECRET } = process.env;

/**
 * The number of salting rounds that bcrypt performs.
 * @type {number}
 */
const saltRounds = 10;

/**
 * @param {Object} payload - the payload for a signed token
 * @returns {string} signed JSON Web Token.
 */
const createSignedToken = (payload) => jwt.sign(payload, JWT_SECRET);

/**
 * Given a user object with username and password, produce either the user_id
 * of the user or false;
 * @param {Object} obj - object containing two properties:
 * @property {string} username
 * @property {string} password
 * @returns {Promise<string|false>} if the user is found in the database, return the
 * user_id, else return false.
 */
const validUser = async (obj) => {
  const { username, password } = obj;
  const user = await Users.find(username);
  if (!user) return false;
  const result = await bcrypt.compare(password, user.pass);
  if (result) {
    return {
      userId: user._id,
      admin: user.admin,
    };
  }
  return false;
};

/**
 * Given an object with a username and a password, checks the username and the
 * password against the database, and if the user is found and the password is
 * correct, then returns a cookie used to validate the user on the site. Else,
 * returns false.
 * @param {Object} obj
 * @property {string} username
 * @property {string} password
 * @returns {Promise<string|boolean>} a valid cookie or false.
 */
const logInUser = async (obj) => {
  const { userId, admin } = await validUser(obj);
  if (userId) {
    const token = createSignedToken({ user_id: userId, admin });
    return token;
  }
  return false;
};

/**
 * A user.
 * @typedef {Object} User
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
  if (foundUser) {
    return {
      ok: false,
      message: 'User with the given username / email already exists',
    };
  }
  const newUser = { ...user, access: true, admin: false };
  const hashedPassword = await bcrypt.hash(user.pass, saltRounds);
  if (!hashedPassword) {
    return {
      ok: false,
      message: 'The operation could not be completed successfully.',
    };
  }
  const result = await Users.insert({ ...newUser, pass: hashedPassword });

  // TODO: DELETE FROM HERE ||||||||||||||||||||||||||||||
  console.log('--------------------------------');
  console.log({ result });
  console.log('--------------------------------');
  // TODO: DELETE TO HERE ||||||||||||||||||||||||||||||||

  return result;
};

/**
 * Perform a verification on the token recieved in the request object, and only
 * continue towards the route if the verification is successfull. Else redirect
 * the user to the appropiate endpoints.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - A function that executes after the middleware is
 * successfull.
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies._auth;
    if (!token) return res.redirect('/auth/login'); // TODO: Edit this to redirect to the front-end login page.
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) res.redirect('/auth/login'); // TODO: Edit this to redirect to the front-end login page.
      else next();
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  logInUser, verifyToken, signInUser,
};
