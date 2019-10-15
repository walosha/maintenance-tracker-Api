const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  user.password = undefined;
  user.__v = undefined;
  createTokenAndSend(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'Logged out', {
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.status(200).json({
    status: 'sucess'
  });
};

exports.protect = async (req, res, next) => {
  // CHECK TOKEN AND
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, Please log in to get access', 401)
    );
  }

  // VERIFY TOKEN

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return next(new AppError('User with this token no longer exist!', 401));
  }

  // CHECK IF USER CHANGE PASSWORD AFTER TOKEN WAS ISSUED
  if (currentUser.passswordChangedAter(decode.iat)) {
    return next(
      new AppError('User changed password recently. Please log in again', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE

  req.user = currentUser;
  next();
};

exports.isLoggedIn = async (req, res, next) => {
  // CHECK TOKEN AND GET IF IT IS THERE

  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // VERIFY TOKEN

      const currentUser = await User.findById(decode.id);

      if (!currentUser) {
        return next(new AppError('User with this token no longer exist!', 401));
      }

      // CHECK IF USER CHANGE PASSWORD AFTER TOKEN WAS ISSUED
      if (currentUser.passswordChangedAter(decode.iat)) {
        return next(
          new AppError(
            'User changed password recently. Please log in again',
            401
          )
        );
      }

      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this operation',
          403
        )
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // CONFIRM WHETHER EMAIL EXIST

  if (!user) {
    return next(
      new AppError('No account is associated with this email address', 404)
    );
  }
  // GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  user.markModified(user.passwordResetExpiry);

  // THIS ACTUALLY TURN OFF THE REQUIRED SCHEMA OFF WHEN RESET PASSWORD
  await user.save({ validateBeforeSave: false });

  //SEND MAIL TO USER

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `You forgot your password ? Submit a patch request with your newpassword and confirmPassword to the reset Url : ${resetURL}\n If you didn't forget your password ignore this email.\n Olawale Afuye  `;
  console.log(message);

  try {
    await sgMail.send({
      to: user.email,
      from: '<admin@maintenanceTracker.com.ng>',
      subject: `${user.name}, your Password Reset Token ( Valid for 10mins!)`,
      text: message
      // html: `<p>${message}</p>`
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to mail'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an Error sending this message. Please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpiry: { $gt: Date.now() }
  });
  console.log('useer', req.params.token);
  if (!user) {
    return next(new AppError('Token has expired or is expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  createTokenAndSend(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // CHECK USER FROM THE COLLECTION

  const user = await User.findById(req.user.id).select('+password');

  //CHECK IF THE PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('You password is in correct!', 401));
  }

  //CHANGE THE PASSWORD TO THE UPDATED ONE

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();
  // We didnt use findUserById because it wont validate data and run the middlware in between

  //LOG USER IN AND SEND TOKEN

  createTokenAndSend(user, 200, res);
});
