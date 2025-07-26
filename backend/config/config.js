const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || "mongodb://localhost:27017/taskhive",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  clientURL: process.env.CLIENT_URL || "http://localhost:3000",

  // Optional: Email config for future use (e.g. nodemailer)
  email: {
    service: process.env.EMAIL_SERVICE || "",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
};

module.exports = config;
