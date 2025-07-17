const Review = require("../models/review");
const Listing = require("../models/listing.js");


module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  // console.log(req.params)
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review saved");
  req.flash("success", "New review added!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "review deleted!");
  console.log("successful");

  res.redirect(`/listings/${id}`);
};
