const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');

const tokenSign = function(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createTokenAndSend = function(user, statusCode, res) {
  const token = tokenSign(user._id);

  // SENDING JWY VIA COOKIES
  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOOKIES_EXPIRES_IN * 24 * 60 * 60 * 1
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

  res.cookie('jwt', token, cookiesOptions);

  res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createTokenAndSend(newUser, 201, res);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email or password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  //  CHECK IF USER PASSWORD IS SAME AS THAT ON DATABASE

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('You have supplied an invalid emaill or password!'),
      401
    );
  }

  createTokenAndSend(user, 200, res);
});
