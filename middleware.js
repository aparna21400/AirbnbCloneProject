const Listings = require("./models/listingModel")
const Review = require("./models/reviewModel")

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
    let { id } = req.params;  // ✅ Extract id, not reviewId
    try {
        let listing = await Listings.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        if (!listing.owner._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You have no permission");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

module.exports.isAuthorr = async (req, res, next) => {
    let { id, reviewId } = req.params;
    try {
        let review = await Review.findById(reviewId);
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }
        if (!review.author._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You have no permission");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect(`/listings/${id}`);
    }
};