const express = require('express');

const authController = require('../controllers/authController');

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/signin', authController.signin);
Router.get('/signin', authController.logout);

Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.patch('/changePassword', authController.updatePassword);

module.exports = Router;
