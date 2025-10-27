const express = require("express");
const router = express.Router();
const Listings = require("../models/listingModel");
const mongoose = require("mongoose");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listings")
const multer = require('multer')
const { storage } = require("../cloudConfig")
const upload = multer({ storage })

router.route("/")
    .get(listingController.index)
    .post(isLoggedIn, upload.single('listing[image]'), listingController.renderCreatePost);

// Create New Listing
router.get("/new", isLoggedIn, listingController.renderNew);

// SearchBar
router.get("/search", async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }

    try {
        // Search in title, location, country, and description
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

        res.render("Listings/indexSec.ejs", { AllListing, searchQuery: q });
    } catch (err) {
        console.error(err);
        req.flash("error", "Error searching listings");
        res.redirect("/listings");
    }
});

// Category filter
router.get("/category/:category", async (req, res) => {
    const { category } = req.params;
    const AllListing = await Listings.find({ category: category });
    res.render("Listings/indexSec.ejs", { AllListing });
});


router.route("/:id")
    .get(listingController.renderShow)
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), listingController.renderUpdate) // Added upload middleware here
    .delete(isLoggedIn, isOwner, listingController.renderDelete);

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEdit);

module.exports = router;