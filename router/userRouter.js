import express from "express";
import multer from "multer";
import {
  changePassword,
  forgetPassword,
  login,
  resetPassword,
  signup,
  protectMiddleware,
  restrictToMiddleware,
  logOut,
} from "../controller/authController.js";
import {
  DeleteMe,
  getAllUser,
  getMe,
  getMeParam,
  updateMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from "../controller/userController.js";

const Router = express.Router();

Router.post("/signup", signup);
Router.post("/login", login);
Router.get("/logout", logOut);
Router.post("/forgotPassword", forgetPassword);
Router.patch("/resetPassword/:token", resetPassword);

Router.use(protectMiddleware); //restrict all the router after to protect middleware (login users only)

Router.patch("/changePassword", changePassword);
Router.get("/aboutMe", getMeParam, getMe);

Router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
Router.delete("/deleteMe", DeleteMe);

Router.use(restrictToMiddleware("admin")); // restrict  all the router after to admin middleware
Router.route("/").get(getAllUser);

export default Router;
