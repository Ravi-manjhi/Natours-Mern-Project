import mongoose from "mongoose";
import slugify from "slugify";

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [8, "A tour name must have more then 8 character"],
      maxLength: [50, "A tour name must have less the 20 character"],
      trim: true,
      require: [true, "A tour must have a name!"],
    },

    duration: { type: Number, require: [true, "A Tour is must have Duration"] },
    maxGroupSize: {
      type: Number,
      require: [true, "A tour is must have Group of people"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "difficult"],
      require: [true, "A Tour have a Level of adventure"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, "Rating should not less then 1.0"],
      max: [5, "Rating should not more then 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, "A Tour have a Level of adventure"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount Price not less the actual Price",
      },
    },
    summary: {
      type: String,
      require: [true, "Summary is required"],
    },
    description: {
      type: String,
      require: [true, "description is required"],
    },
    imageCover: {
      type: String,
      require: [true, "Image is required"],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    slug: {
      type: String,
    },
    secreteTour: {
      type: Boolean,
      default: false,
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// -------------------------------Virtual -------------------------------

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("weeks").get(function (next) {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
});

// // ------------------- A) mongoose Document middleware ----------------------
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// -------------------- B) mongoose query middleware ------------------------
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: "guides", select: "-__v -passwordChangedAt" });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  next();
});

// ----------------- c) Aggregation Middleware ------------------------------
// tourSchema.pre("aggregate", function (next) {
//   // Add a $match state to the beginning of each pipeline.
//   this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
//   next;
// });
export default mongoose.model("Tours", tourSchema);
