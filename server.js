const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Sentry = require('@sentry/node');
const cloudinary = require('cloudinary').v2;

Sentry.init({
  dsn: process.env.SENTRY_DSN
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_NAME_API_KEY,
  api_secret: process.env.CLOUD_NAME_API_SECRET
});

const app = require('./app');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    // DEFAULT SET-UP
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connected successfully!');
  });

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
