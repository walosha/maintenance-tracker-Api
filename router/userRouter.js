const express = require('express');

const Router = express.Router();

Router.route('/').get((req, res) => {
  res.status(200).json({
    status: 'sucess',
    data: {
      data: 'users'
    }
  });
});

module.exports = Router;
