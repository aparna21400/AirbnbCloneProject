const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Clean, modern MongoDB connection
 * - No deprecated options
 * - Proper error handling
 * - Connection monitoring
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.ATLASDB_URL, {
            // Modern MongoDB driver - no deprecated options
            // useNewUrlParser and useUnifiedTopology are no longer needed in v4+
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        
        // Monitor connection events
        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        });

        mongoose.connection.on("error", (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
            // Don't crash the server, allow graceful shutdown
        });

        return conn;
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit process if connection fails on startup
    }
};

module.exports = connectDB;
