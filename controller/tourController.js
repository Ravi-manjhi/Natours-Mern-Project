import multer from "multer";
import sharp from "sharp";
import Tours from "../models/tourModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsyncError.js";
import {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
} from "./factoryHandler.js";

// ---------------------------------- multer configuration -----------------------
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  }
  cb(new AppError("Wrong formate please provide Image", 404), false);
};

export const uploadTourPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// multiple but one array("image", 5)

export const resizeTourImage = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1). imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 96 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 96 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  console.log(req.body);
  next();
};

// ------------------------------- Controllers -------------------------------------
export const getAllTours = getAll(Tours);
export const getTour = getOne(Tours, { path: "reviews" });
export const createTour = createOne(Tours);
export const deleteTour = deleteOne(Tours);
export const updateTour = updateOne(Tours);

// -------------------------- Default Request Parameters ---------------------------
export const topCheapTour = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficult";
  next();
};

// ------------------- aggregation pipeline matching and grouping -------------------
export const tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.0 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({ status: "Successful", stats });
});

// ----------------------- aggregation pipeline unwinding and projection -------------

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const tour = await Tours.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numToursStart: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { numToursStart: -1 } },
  ]);

  res.status(200).json({ status: "Successful", tour });
});

// --------------------------- geolocation controller ---------------------------------

export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latLng, unit } = req.params;
  const [latitude, longitude] = latLng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!latitude || !longitude) {
    return next(
      new AppError("Please Provide current Latitude and longitude,", 400)
    );
  }

  const tour = await Tours.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[latitude, longitude], radius] },
    },
  });

  res
    .status(200)
    .json({ status: "success", result: tour.length, data: { data: tour } });
});

export const getDistances = catchAsync(async (req, res, next) => {
  const { latLng, unit } = req.params;
  const [latitude, longitude] = latLng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!latitude || !longitude) {
    return next(
      new AppError("Please Provide current Latitude and longitude,", 400)
    );
  }

  const distance = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [latitude * 1, longitude * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({ status: "success", data: { data: distance } });
});
