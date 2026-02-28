/**
 * Centralized error handling middleware
 * Must be defined last in app.use() chain
 */
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    // Always log the error
    logger.error(`${err.name}: ${err.message}`);

    // Set default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // MongoDB validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // MongoDB cast error
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = `${Object.keys(err.keyPattern)[0]} already exists`;
    }

    // MongoDB authentication error
    if (err.codeName === "AtlasError" || err.message.includes("authentication failed")) {
        statusCode = 500;
        message = "Database connection failed. Please try again later.";
        logger.error("CRITICAL: MongoDB Authentication failed - Check credentials and IP whitelist");
    }

    // For rendering views (HTML)
    if (req.path.includes("/listings") || req.path.includes("/users")) {
        if (req.flash) {
            req.flash("error", message);
            return res.redirect("/listings");
        }
    }

    // For API responses (JSON)
    return res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
