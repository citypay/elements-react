require("dotenv").config({ path: ".env.local" });

module.exports = {
  // The regex determining what domains will pass CORS checking
  CORS_REGEX: /^https?:\/\/(dev\.citypay\.local|localhost):\d+$/,
  // CORS_REGEX: /^https?:\/\/localhost:\d+$/, // https://localhost, any port

  // The hostname and port on which to run this server
  HOSTNAME: "localhost",
  PORT: process.env.EX_CP_PORT || 3005,

  // Your CityPay credentials. By default, these are pulled from the environment
  CP_CLIENT_ID: process.env.EX_CP_CLIENT_ID,
  CP_LICENSE_KEY: process.env.EX_CP_LICENSE_KEY,
  CP_MID: process.env.EX_CP_MID,
};