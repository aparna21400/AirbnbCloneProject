const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listingModel");
const Review = require("../models/reviewModel");
const mongoose = require("mongoose");
const { isLoggedIn, isAuthorr } = require("../middleware")
const reviewController = require("../controllers/reviews")

// post route
router.post("/", isLoggedIn, (reviewController.createReview));

// delete review route
router.delete("/:reviewId", isLoggedIn, isAuthorr, (reviewController.deleteReview));

module.exports = router;