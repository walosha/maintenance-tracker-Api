const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Request = require('../model/requestModel');

exports.getOneRequests = async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'sucess',
    data: {
      data: request
    }
  });
};

exports.getAllRequests = async (req, res, next) => {
  let requests;
  if (req.user.role === 'user') {
    requests = await Request.find({ user: req.user.id });
  } else {
    requests = await Request.find().populate({
      path: 'user'
    });
  }

  if (!requests) {
    return next(new AppError('No document found', 404));
  }

  res.status(200).json({
    status: 'sucess',
    request: requests.length,
    data: {
      data: requests
    }
  });
};

exports.createRequest = catchAsync(async (req, res, next) => {
  const { title, request } = req.body;
  if (!req.body.user) req.body.user = req.user.id;
  if (!title || !request)
    return next(new AppError('Please provide a title or a request!', 404));

  const newRequest = await Request.create({
    title,
    request,
    user: req.body.user
  });
  res.status(200).json({
    status: 'sucess',
    data: {
      data: newRequest
    }
  });
});

exports.editRequest = async (req, res, next) => {
  const request = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!request) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'sucess',
    data: {
      data: request
    }
  });
};

exports.deleteRequest = async (req, res, next) => {
  const request = await Request.findByIdAndDelete(req.params.id);

  if (!request) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'sucess',
    data: null
  });
};
