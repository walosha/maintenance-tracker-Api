const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./router/userRouter');
const requestRouter = require('./router/requestRouter');

const app = express();

app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'dev-data/templates'));

// GLOBAL MIDDLEWARES

//SERVING OF STATIC FILES

app.use('/api/v1/users', userRouter);
app.use('/api/v1/requests', requestRouter);

app.get('*', (req, res) => {
  res.status(404).render('error');
});

app.use(globalErrorHandler);

module.exports = app;
