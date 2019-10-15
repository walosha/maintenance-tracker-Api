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

app.use('/api/v1/users', userRouter);
app.use('/api/v1/requests', requestRouter);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'Bad Request',
    response: 'route no defined'
  });
});

app.use(globalErrorHandler);

module.exports = app;
