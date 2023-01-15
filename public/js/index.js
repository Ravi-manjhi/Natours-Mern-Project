import { login, logout, createAccount } from "./account";
import { displayMap } from "./mapbox";
import { updateSetting } from "./updateSetting";

//------------------------------------- dom element ----------------------------
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userProfileUpdateForm = document.querySelector(".form-user-data");
const userPasswordChangeForm = document.querySelector(".form-user-password");
const signupForm = document.querySelector(".form--signup");

//---------------------------------------  Delegation --------------------------
// mapBox
if (mapBox) {
  displayMap(JSON.parse(mapBox.dataset.locations));
}

// login
if (loginForm) {
  document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    login(email, password);
  });
}

// logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
  });
}

// updateMe
if (userProfileUpdateForm) {
  userProfileUpdateForm.addEventListener("submit", async (e) => {
    document.querySelector(".btn__save--profile").textContent = "Updating...";
    e.preventDefault();

    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    await updateSetting("profile", form);
  });
}

if (userPasswordChangeForm) {
  userPasswordChangeForm.addEventListener("submit", async (e) => {
    document.querySelector(".btn--save-password").textContent = "Updating...";

    e.preventDefault();
    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    await updateSetting("password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";

    document.querySelector(".btn--save-password").textContent = "Save Password";
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--signup").textContent = "Creating Account...";

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    await createAccount({ name, email, password, passwordConfirm });
  });
}
