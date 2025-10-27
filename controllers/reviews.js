const Review = require("../../models/reviewModel");
const Listings = require("../../models/listingModel");


module.exports.createReview = async (req, res, next) => {
    const { id } = req.params;
    try {


        // Find listing
        const listing = await Listings.findById(req.params.id);

        // Create new review
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        console.log(newReview);
        // Add review to listing
        listing.reviews.push(newReview);

        // Save both
        await newReview.save();
        await listing.save();

        req.flash("success", "New Review Created!");
        res.redirect(`/listings/${listing._id}`);


    } catch (err) {
        console.error("Error creating review:", err);
        req.flash("error", "Failed to create review!");
        res.redirect(`/listings/${id}`);
    }
};

module.exports.deleteReview = (async (req, res) => {
    try {
        let { id, reviewId } = req.params;
        await Listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    }
    catch (err) {
        console.error("Error deleting review:", err);
        res.redirect(`/listings/${id}`);
    }
});