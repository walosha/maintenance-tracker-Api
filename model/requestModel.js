const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    request: {
      type: String,
      required: [true, 'You must provide a request. Please provide a request']
    },
    status: {
      type: String,
      enum: ['accepted', 'pending', 'cancelled'],
      default: 'pending'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must belong to a user!']
    }
  },
  { timestamps: true }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true }
  // }
);

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
