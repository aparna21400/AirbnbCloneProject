const Review = require("../models/reviewModel");
const Listings = require("../models/listingModel");
const logger = require("../utils/logger");

/**
 * Create new review
 */
module.exports.createReview = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        // Find listing
        const listing = await Listings.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Create new review
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;

        // Add review to listing and save both
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();

        req.flash("success", "New Review Created!");
        return res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        logger.error(`Error creating review: ${err.message}`);
        req.flash("error", "Failed to create review!");
        return res.redirect(`/listings/${id}`);
    }
};

/**
 * Delete review
 */
module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    
    try {
        await Listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review deleted successfully!");
        return res.redirect(`/listings/${id}`);
    } catch (err) {
        logger.error(`Error deleting review: ${err.message}`);
        req.flash("error", "Failed to delete review!");
        return res.redirect(`/listings/${id}`);
    }
};