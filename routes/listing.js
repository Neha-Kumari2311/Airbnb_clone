const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//INDEX AND CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

//CREATE ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

// GET /listings/search?q=jaipur
router.get("/search", wrapAsync(listingController.searchListing));

//UPDATE DELETE AND SHOW
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.editListing)
  )

  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
