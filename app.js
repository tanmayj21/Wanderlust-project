if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
const ExpressError = require("./utils/ExpressError.js");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

const dbUrl = process.env.ATLAS_DB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => console.log("Connection successful"))
  .catch((err) => console.log(err));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET,
  },
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); // initialize the passport middleware for incoming requests, allowing authentication strategies to be applied.
/*
 * Middleware that will restore login state from a session.
 * Web applications typically use sessions to maintain login state between requests. For example, a user will authenticate by entering credentials into a form which is submitted to the server. If the credentials are valid, a login session is established by setting a cookie containing a session identifier in the user's web browser. The web browser will send this cookie in subsequent requests to the server, allowing a session to be maintained.
 * If sessions are being utilized, and a login session has been established, this middleware will populate req.user with the current user.
 */
app.use(passport.session()); // A web application needs the ability to identify users as they browse from page to page, i.e., if it is the same user.
passport.use(new LocalStrategy(User.authenticate())); // use the local strategy to authenticate the user.

passport.serializeUser(User.serializeUser()); // to store user info into the session
passport.deserializeUser(User.deserializeUser()); // to remove the user info from the session

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user; // We can't directly use req.user in the ejs template so we store its content in the locals
  next();
});

// Use the listings route for all routes starting with /listings
app.use("/listings", listingsRouter);
// Use the reviews route for all routes starting with /listings/:id/reviews
app.use("/listings/:id/reviews", reviewsRouter);
// Use the user route for all routes starting with /listings
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
