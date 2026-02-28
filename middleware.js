/**
 * DEPRECATED: This file is kept for backward compatibility.
 * All middleware has been moved to middleware/ folder.
 * Please update your imports to use the new middleware/auth.js file.
 */

const auth = require("./middleware/auth");

// Re-export for backward compatibility
module.exports = {
    ...auth,
    isAuthorr: auth.isAuthor, // Handle typo for backward compatibility
};