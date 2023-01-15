import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";
import tourRouter from "./router/tourRouter.js";
import userRouter from "./router/userRouter.js";
import globalErrorController from "./controller/ErrorController.js";
import reviewRouter from "./router/reviewRouter.js";
import AppError from "./utils/appError.js";
import viewRouter from "./router/viewRouter.js";
import BookingRouter from "./router/bookingRouter.js";

// -------------------------- express template, static file setup -------------------------
dotenv.config({ path: "config.env" });

const app = express();

app.set("view engine", "pug");
app.use(express.static("public"));

// ---------------------------------- global middleware -----------------------------------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ["*"],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["*"],
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
      },
    },
  })
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "To Many request! Please try 30 Minutes Later.",
  })
);
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(
  hpp({
    // hpp for duplicate parameter filter
    whitelist: [
      "duration",
      "maxGroupSize",
      "ratingsAverage",
      "ratingQuantity",
      "difficulty",
      "price",
    ],
  })
);
app.use(bodyParser.json({ limit: "3mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

//  --------------------------------- Routers Middleware ---------------------------------
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/", viewRouter);
app.use("/api/v2/tours", tourRouter);
app.use("/api/v2/user", userRouter);
app.use("/api/v2/review", reviewRouter);
app.use("/api/v2/booking", BookingRouter);
app.use("*", (req, res, next) => {
  return next(new AppError("This Router Not Found in this site", 404));
});
app.use(globalErrorController);

export default app;
