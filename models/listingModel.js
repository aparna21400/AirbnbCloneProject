const mongoose = require("mongoose");
const reviews = require("./reviewModel");
const Schema = mongoose.Schema;

// SCHEMA
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    zip: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    category: {
        type: String,
        enum: ["Mountains", "Arctic", "Farms", "Pools", "Beach", "Lounge", "Camping", "Castles", "Iconic cities", "Rooms"]
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await reviews.deleteMany({ reviews: { $in: listing.reviews } })

    }
});

// MODEL
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;