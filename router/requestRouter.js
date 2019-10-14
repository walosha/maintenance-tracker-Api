const express = require('express');
const requestController = require('../controllers/requestController');

const Router = express.Router();

Router.route('/')
  .get(requestController.getAllRequests)
  .post(requestController.createRequest);

Router.route('/:id')
  .get(requestController.getOneRequests)
  .patch(requestController.editRequest)
  .delete(requestController.deleteRequest);
module.exports = Router;
