import multer from "multer";
import sharp from "sharp";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsyncError.js";
import { getAll, getOne } from "./factoryHandler.js";

// -------------------------------------- multer configuration -------------------------------
// multer photo upload middleware
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not a Image! Please upload only Images", 400), false);
  }
};

export const uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single("photo");

export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

// --------------------------------------- user Router Controller ------------------------------------
export const DeleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  }).select("+active");

  res
    .status(204)
    .json({ status: "success", message: "Account is Deleted", data: null });
});

export const getMeParam = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  let { name, email, role, photo } = req.body;
  if (req.user.role !== "admin") {
    role = undefined;
  }
  if (req.file) {
    photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, photo, role },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedUser) {
    return next(new AppError("No Document found with this id", 404));
  }

  res.status(201).json({
    status: "success",
    message: " Profile Updated Successful",
    data: { data: updatedUser },
  });
});

export const getAllUser = getAll(User);
export const getMe = getOne(User);
