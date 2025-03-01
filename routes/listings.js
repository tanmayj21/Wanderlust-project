const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateListing, isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
// const upload = multer({ dest: "uploads/" }); // in the uploads folder in the current local
const upload = multer({ storage });

router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn, // Middleware to check if the user is logged in
  upload.single("listing[image]"),
  validateListing, // Middleware to validate the listing data
  wrapAsync(listingController.createListing) // Controller to handle creating a new listing
);

router.get("/new/form", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(isLoggedIn, wrapAsync(listingController.showListing))
  .put(
    isLoggedIn, // Middleware to check if the user is logged in
    isOwner, // Middleware to check if the user is the owner of the listing
    upload.single("listing[image]"),
    validateListing, // Middleware to validate the listing data
    wrapAsync(listingController.updateListing) // Controller to handle updating the listing
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get(
  "/:id/edit",
  isLoggedIn, // Middleware to check if the user is logged in
  isOwner, // Middleware to check if the user is the owner of the listing
  wrapAsync(listingController.renderEditForm) // Controller to handle rendering the edit form
);

module.exports = router;
