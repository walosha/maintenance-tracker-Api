const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: [true, 'Please Provide us your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a Valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false //THIS OPTION HIDE THE PASSWORD FROM BEING RETURNED TO USERS
  },
  passwordConfirm: {
    type: String,
    required: [true, 'PasswordConfirm is required'],
    validate: {
      // THIS ONLY WORKS ON SAVE or CREATE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password do not match'
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passswordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date
});

userSchema.pre('save', async function(next) {
  // RUN THIS IF PASSWORD IS NOT MODIFIED
  if (!this.isModified('password')) return next();
  // RUN THIS IF PASSWORD IS CREATED OR MODIFIED
  this.password = await bycrypt.hash(this.password, 16);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bycrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
