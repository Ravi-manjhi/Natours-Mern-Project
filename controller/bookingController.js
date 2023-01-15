import Stripe from "stripe";
import catchAsync from "../utils/catchAsyncError.js";
import Tour from "../models/tourModel.js";
import { getAll } from "../controller/factoryHandler.js";
import AppError from "../utils/appError.js";

const stripe = new Stripe(process.env.STRIPE_API_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError("No Tour Found To this Id", 404));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} tour`,
        description: tour.summery,
        images: ["https://static.toiimg.com/photo/67382132.cms"],
        amount: tour.price * 100,
        currency: "inr",
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    session,
  });
});
