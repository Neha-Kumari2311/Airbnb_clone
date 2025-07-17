const Listing = require("../models/listing.js");
const { geocodePlace } = require("../utils/geocode");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let listings;
  if (category) {
    listings = await Listing.find({ category: category.toLowerCase() });
  } else {
    listings = await Listing.find({});
  }
  res.render("listings/index.ejs", {
    listings,
    currentCategory: category || null,
  });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing  you  requested for  does  not  exist");
    res.redirect("/listings");
  } else {
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  }
};

module.exports.createListing = async (req, res, next) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    const location = req.body.listing.location;
    console.log("📍 Location entered:", location);
    let geoResult;
    try {
      geoResult = await geocodePlace(location);
    } catch (geoError) {
      console.error("❌ Failed to call geocodePlace:", geoError.message);
      req.flash("error", "MapTiler failed to respond. Try again later.");
      return res.redirect("/listings/new");
    }
    if (!geoResult) {
      console.warn(
        "⚠️ geoResult is null. Possible timeout or invalid location."
      );
      req.flash("error", "Geocoding failed or returned no result.");
      return res.redirect("/listings/new");
    }
    const geometry = {
      type: "Point",
      coordinates: [geoResult.lng, geoResult.lat],
    };
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
      url: req.file?.path || "",
      filename: req.file?.filename || "",
    };
    newListing.geometry = geometry;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("❌ Create Listing Outer Error:", err);
    next(err);
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing  you  requested for  does  not  exist");
    res.redirect("/listings");
  } else {
    let originalListingUrl = listing.image.url;
    originalListingUrl.replace("/upload", "/upload/,w_250");
    res.render("listings/edit.ejs", { listing, originalListingUrl });
  }
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated !");

  res.redirect(`/listings/${id}`);
};
module.exports.searchListing = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.redirect("/listings");
  }
  const regex = new RegExp(query, "i"); // case-insensitive search
  const listings = await Listing.find({
    $or: [{ title: regex }, { location: regex }, { country: regex }],
  });

  res.render("listings/index", { listings,currentCategory:null });
};
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
