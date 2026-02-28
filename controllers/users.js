const User = require("../models/userModel");
const logger = require("../utils/logger");

/**
 * Render signup/login page
 */
module.exports.signupRender = (req, res) => {
    return res.render("Users/signupPage");
};

/**
 * Register new user
 */
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        
        const registerUser = await User.register(newUser, password);
        
        req.login(registerUser, (err) => {
            if (err) {
                logger.error(`Login error during signup: ${err.message}`);
                return next(err);
            }
            
            req.flash("success", "Welcome to WanderLust!");
            return res.redirect("/listings");
        });
    } catch (err) {
        logger.error(`Signup error: ${err.message}`);
        req.flash("error", err.message);
        return res.redirect("/signup");
    }
};

/**
 * Render login page
 */
module.exports.loginRender = (req, res) => {
    return res.render("Users/signupPage");
};

/**
 * Handle login (handled by passport middleware)
 */
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    return res.redirect(redirectUrl);
};

/**
 * Handle logout
 */
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            logger.error(`Logout error: ${err.message}`);
            return next(err);
        }
        
        req.flash("success", "You are logged out!");
        return res.redirect("/listings");
    });
};