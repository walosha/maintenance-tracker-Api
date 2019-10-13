const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  request: {
    type: String,
    required: [true, 'You must provide a request. Please provide a request']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  status: {
    type: String,
    enum: ['accepted', 'pending', 'cancelled'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Request must belong to a user!']
  }
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
