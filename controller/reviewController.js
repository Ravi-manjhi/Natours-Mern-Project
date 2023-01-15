import Review from "../models/reviewModel.js";
import catchAsync from "../utils/catchAsyncError.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./factoryHandler.js";

export const setToursUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};

export const getAllReview = getAll(Review);
export const getReview = getOne(Review);
export const updateReview = updateOne(Review);
export const DeleteReview = deleteOne(Review);
export const createReview = createOne(Review);
