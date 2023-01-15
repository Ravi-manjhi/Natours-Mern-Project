import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsyncError.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";
import { promisify } from "util";
import Email from "../utils/mailSender.js";

const SendAuthToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE,
  });
  const cookieOption = {
    maxAge: 90 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };

  if (process.env.NODE_ENV !== "development") cookieOption.httpOnly = true;

  user.password = undefined;
  res.cookie("jwt", token, cookieOption);
  res.status(statusCode).json({ status: "success", user, token });
};

export const signup = catchAsync(async (req, res, next) => {
  const url = `${req.protocol}://${req.get("host")}/me`;
  req.body.role = undefined;
  req.body.active = undefined;

  try {
    await new Email(req.body, url).sendWelcome();
  } catch (error) {
    return next(new AppError(error.message, 501));
  }

  const user = await User.create(req.body);
  SendAuthToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(user.password, password))) {
    return next(new AppError("Email or Password is incorrect", 400));
  }

  SendAuthToken(user, 200, res);
});

export const logOut = (req, res) => {
  res.cookie("jwt", "logout", {
    maxAge: 60 * 1000,
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No User belong to this email address", 404));
  }
  const token = await user.generatePasswordToken();
  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v2/user/resetPassword/${token}`;

  try {
    await new Email(user, url).passwordReset();
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }

  res.status(200).json({
    status: "successful",
    message: "Email sent to your Register email handler",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpire: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Link Expire or Invalid "));
  if (!password || !passwordConfirm)
    return next(
      new AppError("Please provide password and confirm password", 404)
    );

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpire = undefined;
  await user.save();

  res
    .status(200)
    .json({ status: "success", message: "Password changed successfully" });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.checkPassword(user.password, currentPassword))) {
    return next(new AppError("Incorrect Current Password", 404));
  }
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  await user.save();

  SendAuthToken(user, 200, res);
});

export const protectMiddleware = catchAsync(async (req, res, next) => {
  const authorization = req.headers.authorization;
  let token;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== "logout") {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError("Please Login to Make a request"));
  const decode = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  const user = await User.findById(decode.id);

  if (!user) {
    return next(
      new AppError("The User belonging this token does not exits", 401)
    );
  }
  if (user.changePasswordAfter(decode.iat)) {
    return next(new AppError("Password Change Recently! Please Login", 401));
  }

  req.user = user;
  res.locals.user = user;
  next();
});

export const isLoggedIn = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token || token === "logout") {
    return next();
  }

  const decode = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET
  );

  const user = await User.findById(decode.id);
  if (!user || user.changePasswordAfter(decode.iat)) {
    return next();
  }

  res.locals.user = user;
  next();
});

export const restrictToMiddleware = (...role) => {
  return async (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(new AppError("You not allowed for this action", 404));
    }
    next();
  };
};
