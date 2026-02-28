const Listings = require("../models/listingModel");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Get all listings
 */
module.exports.index = async (req, res, next) => {
    try {
        const AllListing = await Listings.find({});
        return res.render("Listings/indexSec.ejs", { AllListing });
    } catch (err) {
        logger.error(`Error fetching listings: ${err.message}`);
        return next(err);
    }
};

/**
 * Render new listing form
 */
module.exports.renderNew = (req, res) => {
    return res.render("Listings/newSec.ejs");
};

/**
 * Get single listing with reviews
 */
module.exports.renderShow = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing ID");
        return res.redirect("/listings");
    }

    try {
        const listing = await Listings.findById(id)
            .populate("author")
            .populate({
                path: "reviews",
                populate: { path: "author" },
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        return res.render("Listings/showSec", { listing });
    } catch (err) {
        logger.error(`Error loading listing: ${err.message}`);
        return next(err);
    }
};

/**
 * Create new listing
 */
module.exports.renderCreatePost = async (req, res, next) => {
    try {
        if (!req.file) {
            req.flash("error", "Image is required");
            return res.render("Listings/newSec", { listing: req.body.listing || {} });
        }

        const { path: url, filename } = req.file;
        const newListing = new Listings(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        
        await newListing.save();
        
        req.flash("success", "New Listing created!");
        return res.redirect("/listings");
    } catch (err) {
        logger.error(`Error creating listing: ${err.message}`);
        req.flash("error", "Failed to create listing. Please try again.");
        return res.render("Listings/newSec", { listing: req.body.listing || {} });
    }
};

/**
 * Render edit form
 */
module.exports.renderEdit = async (req, res, next) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid listing ID");
            return res.redirect("/listings");
        }

        const listing = await Listings.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        const originalImageUrl = listing.image?.url
            ? listing.image.url.replace("/upload", "/upload/h_300,w_250")
            : listing.image || '/default.jpg';
        
        return res.render("Listings/editSec.ejs", { listing, originalImageUrl });
    } catch (err) {
        logger.error(`Error loading edit form: ${err.message}`);
        return next(err);
    }
};

/**
 * Update listing
 */
module.exports.renderUpdate = async (req, res, next) => {
    const { id } = req.params;

    try {
        const updatedListing = await Listings.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { new: true, runValidators: true }
        );

        if (!updatedListing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (req.file) {
            const { path: url, filename } = req.file;
            updatedListing.image = { url, filename };
            await updatedListing.save();
        }

        req.flash("success", "Listing updated successfully!");
        return res.redirect(`/listings/${id}`);
    } catch (err) {
        logger.error(`Error updating listing: ${err.message}`);
        return next(err);
    }
};

/**
 * Delete listing
 */
module.exports.renderDelete = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing ID");
        return res.redirect("/listings");
    }

    try {
        const deletedListing = await Listings.findByIdAndDelete(id);
        
        if (!deletedListing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing deleted successfully!");
        return res.redirect("/listings");
    } catch (err) {
        logger.error(`Error deleting listing: ${err.message}`);
        return next(err);
    }
};