const Listings = require("../models/listingModel");
const mongoose = require("mongoose"); // ADD THIS LINE

module.exports.index = async (req, res) => {
    try {
        const AllListing = await Listings.find({});
        res.render("Listings/indexSec.ejs", { AllListing });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching listings");
    }
};

module.exports.renderNew = (req, res) => {
    res.render("Listings/newSec.ejs");
};

module.exports.renderShow = async (req, res) => {
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
        console.log("listing data", listing);
        res.render("Listings/showSec", { listing });
    } catch (err) {
        console.error(err);
        req.flash("error", "Error loading listing");
        res.redirect("/listings");
    }
};


module.exports.renderCreatePost = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    try {

        const newListing = new Listings(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename }
        await newListing.save();
        req.flash("success", "New Listing created!");
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Some error occurred. Please try again.");
        return res.render("Listings/newSec", { listing: req.body.listing || {} });
    }
};

module.exports.renderEdit = async (req, res) => {
    let { id } = req.params;

    const listing = await Listings.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");

    }

    let originalImageUrl = listing.image?.url
        ? listing.image.url.replace("/upload", "/upload/h_300,w_250")
        : listing.image || '/default.jpg';
    res.render("Listings/editSec.ejs", { listing, originalImageUrl });

};

module.exports.renderUpdate = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedListing = await Listings.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            updatedListing.image = { url, filename }
            await updatedListing.save();
        }

        req.flash("success", "Listing updated successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update listing");
        res.redirect(`/listings/${id}`);
    }
};

module.exports.renderDelete = async (req, res) => {
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
        res.redirect("/listings");
        console.log("Deleted listing:", deletedListing);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete listing");
        res.redirect("/listings");
    }
};