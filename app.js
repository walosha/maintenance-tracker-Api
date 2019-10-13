const express = require('express');
const morgan = require('morgan');

const userRouter = require('./router/userRouter');
const requestRouter = require('./router/requestRouter');

const app = express();

app.use(morgan('dev'));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/requests', requestRouter);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'Bad Request',
    response: 'route no defined'
  });
});

module.exports = app;
