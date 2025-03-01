const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const saveRedirectUrl = require("../middleware.js").saveRedirectUrl;
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login", // Redirect to the login page if authentication fails
      failureFlash: true, // Display a flash message if authentication fails
    }), // Middleware to authenticate the user using the 'local' strategy provided by passport-local-mongoose
    userController.login
  );

router.get("/logout", userController.logout);

module.exports = router;
