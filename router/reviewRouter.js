import express from "express";
import {
  getAllReview,
  createReview,
  DeleteReview,
  updateReview,
  setToursUserIds,
  getReview,
} from "../controller/reviewController.js";
import {
  protectMiddleware,
  restrictToMiddleware,
} from "../controller/authController.js";

const Router = express.Router({ mergeParams: true });

Router.use(protectMiddleware); // protecting middleware Only login user perform this task

Router.route("/")
  .get(getAllReview)
  .post(restrictToMiddleware("user"), setToursUserIds, createReview);

Router.route("/:id")
  .get(getReview)
  .delete(restrictToMiddleware("admin", "user"), DeleteReview)
  .patch(restrictToMiddleware("admin", "user"), updateReview);

export default Router;
