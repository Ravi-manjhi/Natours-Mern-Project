import express from "express";
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  signup,
} from "../controller/viewController.js";
import { isLoggedIn, protectMiddleware } from "../controller/authController.js";

const Router = express.Router();

Router.get("/me", protectMiddleware, getAccount);

Router.get("/signup", signup);
Router.use(isLoggedIn);
Router.get("/", getOverview);
Router.get("/login", getLoginForm);
Router.get("/tour/:slug", getTour);

export default Router;
