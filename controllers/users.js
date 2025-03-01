const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let user = new User({ email, username });
    let registeredUser = await User.register(user, password); // Register the user in db with the given password.
    console.log(registeredUser);
    // This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
    // after completion of login, registeredUser will be assigned to the req.user
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome! You are logged in.");
  let redirectUrl = res.locals.redirectUrl || "/listings"; // this is because when the user does first time login from login button, isLoggedIn will not be called. Hence req.session.redirectUrl would be empty.
  res.redirect(redirectUrl);
}; // after authentication middleware is completed, then the callback will work.

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out.");
    res.redirect("/listings");
  });
};
