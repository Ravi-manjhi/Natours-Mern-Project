import catchAsync from "../utils/catchAsyncError.js";
import AppError from "../utils/appError.js";
import ApiFeature from "../utils/apiFeature.js";

export const deleteOne = (Module) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id || req.user.id;

    const doc = await Module.findByIdAndDelete(id);

    if (!doc) {
      return next(new AppError("No Document found with this id", 404));
    }

    res.status(204).json({ status: "success" });
  });

export const createOne = (Module) =>
  catchAsync(async (req, res, next) => {
    const doc = await Module.create(req.body);

    if (!doc) {
      return next(new AppError("No Document found with this id", 404));
    }

    res.status(201).json({
      status: "success",
      message: " Document Created",
      data: { data: doc },
    });
  });

export const updateOne = (Module) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id || req.user.id;

    const doc = await Module.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No Document found with this id", 404));
    }

    res.status(201).json({
      status: "success",
      message: " Document Update",
      data: { data: doc },
    });
  });

export const getOne = (Module, popOption) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id || req.user.id;

    let query = Module.findById(id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No Document found with this id", 404));
    }

    res
      .status(200)
      .json({ status: "success", result: doc.length, data: { data: doc } });
  });

export const getAll = (Module) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const feature = new ApiFeature(Module.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const doc = await feature.query;

    res
      .status(200)
      .json({ status: "success", result: doc.length, data: { data: doc } });
  });
