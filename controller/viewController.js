import Tours from "../models/tourModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsyncError.js";
import AppError from "../utils/appError.js";

export const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tours.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tours.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) return next(new AppError(" There no tour with that name ", 404));

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

export const getLoginForm = (req, res, next) => {
  res.status(200).render("login", { title: "Login" });
};

export const getAccount = (req, res, next) => {
  res.status(200).render("account", { title: "Your Account" });
};

export const updateUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      email,
    },
    { new: true, runValidators: true }
  );

  res.status(200).render("account", { title: "Your Account", user: user });
});

export const signup = (req, res, next) => {
  res.status(200).render("signup", { title: "Create Account" });
};
