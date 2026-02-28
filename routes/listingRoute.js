const express = require("express");
const router = express.Router();
const Listings = require("../models/listingModel");
const mongoose = require("mongoose");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require('multer');
const { storage } = require("../cloudConfig");
const logger = require("../utils/logger");

const upload = multer({ storage });

router.route("/")
    .get(listingController.index)
    .post(isLoggedIn, upload.single('listing[image]'), listingController.renderCreatePost);

// Create New Listing
router.get("/new", isLoggedIn, listingController.renderNew);

/**
 * Search listings by title, location, country, description
 */
router.get("/search", async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }

    try {
        const AllListing = await Listings.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
                { country: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        });

        if (AllListing.length === 0) {
            req.flash("error", `No results found for "${q}"`);
        } else {
            req.flash("success", `Found ${AllListing.length} results for "${q}"`);
        }

        return res.render("Listings/indexSec.ejs", { AllListing, searchQuery: q });
    } catch (err) {
        logger.error(`Search error: ${err.message}`);
        req.flash("error", "Error searching listings");
        return res.redirect("/listings");
    }
});

/**
 * Filter listings by category
 */
router.get("/category/:category", async (req, res) => {
    const { category } = req.params;
    
    try {
        const AllListing = await Listings.find({ category: category });
        return res.render("Listings/indexSec.ejs", { AllListing });
    } catch (err) {
        logger.error(`Category filter error: ${err.message}`);
        req.flash("error", "Error filtering by category");
        return res.redirect("/listings");
    }
});

// Single listing routes
router.route("/:id")
    .get(listingController.renderShow)
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), listingController.renderUpdate)
    .delete(isLoggedIn, isOwner, listingController.renderDelete);

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEdit);

module.exports = router;