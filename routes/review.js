const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync.js");

const Review = require("../models/review.js");

const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js");
const reviewController=require("../controllers/review.js")
//REVIEWS
//POST ROUTE
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);
//DELETE ROUTE
router.delete(
  "/:reviewId",
  isLoggedIn,isAuthor,
  wrapAsync(reviewController.deleteReview)
);
module.exports = router;
