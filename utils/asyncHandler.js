/**
 * Wrapper for async route handlers
 * Automatically catches errors and passes to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
