const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Filter based on the criteria passed in
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // RETURN ERROR IF USER POST PASSWORD DATA

  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for Password update. Please use update password rour=te',
        401
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'sucess',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.body.id, { active: false });
  res.status(200).json({
    status: 'sucess',
    data: null
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  console.log(req.user);
  res.status(200).json({
    status: 'sucess',
    data: {
      user: req.user
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'sucess',
    data: null
  });
});
