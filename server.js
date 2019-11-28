const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://c634bae5a8694bcb8c7f58b2d6c6285f@sentry.io/1837736'
});

const app = require('./app');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    // DEFAULT SET-UP
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connected successfully!');
  });

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
