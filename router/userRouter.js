const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/signin', authController.signin);
Router.get('/signout', authController.logout);

Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.patch('/changePassword', authController.updatePassword);

Router.use(authController.protect);

Router.post(
  '/profileImage',
  userController.uploadImages,
  userController.profileImage
);
Router.patch('/updateMe', userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);
Router.delete(
  '/deleteUser',
  authController.restrict('admin'),
  userController.deleteUser
);
Router.get('/Me', userController.getMe);

module.exports = Router;
