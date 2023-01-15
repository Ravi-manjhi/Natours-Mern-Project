import "@babel/polyfill";
import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios.post("http://localhost:5000/api/v2/user/login", {
      email,
      password,
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.Message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/v2/user/logout");

    if (res.data.status === "success") {
      location.reload(true);
    }
  } catch (error) {
    showAlert("error", "Error logging out! try again");
  }
};

export const createAccount = async (data) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/v2/user/signup",
      data
    );

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.Message);
  }
};
