import express from "express";
import {
  createTour,
  getAllTours,
  getTour,
  deleteTour,
  updateTour,
  topCheapTour,
  tourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourPhoto,
  resizeTourImage,
} from "../controller/tourController.js";
import {
  protectMiddleware,
  restrictToMiddleware,
} from "../controller/authController.js";

import reviewRouter from "../router/reviewRouter.js";

const Router = express.Router();
Router.use("/:tourId/review", reviewRouter);

// ------------------------------- extra shortcut Routes -------------------------------------
Router.get("/topCheapTour", topCheapTour, getAllTours);
Router.get("/tourStats", tourStats);
Router.get("/getMonthlyPlan/:year", getMonthlyPlan);

// ------------------------------------ Routers ----------------------------------------------
Router.route("/")
  .get(getAllTours)
  .post(
    protectMiddleware,
    restrictToMiddleware("admin", "lead-guide"),
    createTour
  );

Router.route("/tours-within/:distance/center/:latLng/unit/:unit").get(
  getToursWithin
);

Router.route("/distances/:latLng/unit/:unit").get(getDistances);

Router.route("/:id")
  .get(getTour)
  .delete(
    protectMiddleware,
    restrictToMiddleware("admin", "lead-guide"),
    deleteTour
  )
  .patch(
    protectMiddleware,
    restrictToMiddleware("admin", "lead-guide"),
    uploadTourPhoto,
    resizeTourImage,
    updateTour
  );

export default Router;
