const nodemailer = require('nodemailer');

const {
  EMAIL_USER,
  EMAIL_PORT,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PERSONAL,
} = process.env;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

module.exports = { transporter, EMAIL_PERSONAL };
