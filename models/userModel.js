import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A User Must have a Name!"],
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Please provide your email!"],
    validate: [validator.isEmail, "Invalid email address!"],
  },
  password: {
    type: String,
    select: false,
    minlength: 8,
    required: [true, "Required Password"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "A confirm Password needed."],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Password not Match",
    },
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "guide", "lead-guide", "admin"],
  },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
  passwordChangedAt: {
    type: Date,
  },
  forgotPasswordToken: {
    type: String,
  },
  forgotPasswordTokenExpire: {
    type: Date,
  },
});

// ---------------------------------- mongoose Query ----------------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $eq: true } });
  next();
});
// ------------------------------------- Methods ---------------------------------

userSchema.methods.checkPassword = function (password, usePassword) {
  return bcrypt.compare(usePassword, password);
};

userSchema.methods.changePasswordAfter = function (jwtTime) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTime < changeTimeStamp;
  }
  return false;
};

userSchema.methods.generatePasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.forgotPasswordTokenExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

export default mongoose.model("Users", userSchema);
