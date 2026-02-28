/**
 * Safe authentication middleware
 * Prevents double responses
 */
const Listings = require("../models/listingModel");
const Review = require("../models/reviewModel");
const logger = require("../utils/logger");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in to access");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    try {
        const listing = await Listings.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        if (!listing.owner._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You have no permission to edit this listing");
            return res.redirect(`/listings/${id}`);
        }
        
        next();
    } catch (err) {
        logger.error(`isOwner middleware error: ${err.message}`);
        req.flash("error", "Something went wrong");
        return res.redirect("/listings");
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    try {
        const review = await Review.findById(reviewId);
        
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }
        
        if (!review.author._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You have no permission to delete this review");
            return res.redirect(`/listings/${id}`);
        }
        
        next();
    } catch (err) {
        logger.error(`isAuthor middleware error: ${err.message}`);
        req.flash("error", "Something went wrong");
        return res.redirect(`/listings/${id}`);
    }
};
