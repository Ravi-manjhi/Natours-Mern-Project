import mongoose from "mongoose";
import Tours from "./tourModel.js";

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: "Tours",
      required: [true, "Review must belong to tour"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: [true, "review must belong to user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingQuantity: stats[0].nRating,
    });
  } else {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.2,
      ratingQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  console.log(this.r.tour);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

export default mongoose.model("Review", reviewSchema);
