import "@babel/polyfill";
import axios from "axios";
import { showAlert } from "./alert";

export const updateSetting = async (type, data) => {
  const url =
    type === "password"
      ? "http://localhost:5000/api/v2/user/changePassword"
      : "http://localhost:5000/api/v2/user/updateMe";
  try {
    const res = await axios.patch(url, data);

    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully`);
      if (type !== "password") {
        location.reload(true);
      }
    }
  } catch (error) {
    showAlert("error", error.response.data.Message);
  }
};
