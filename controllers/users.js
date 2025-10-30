const user = require("../models/userModel");
// const passport = require("passport");
// SIGN UP
module.exports.signupRender = (req, res) => {
    res.render("Users/signupPage");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new user({ email, username });
        const registerUser = await user.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        })

    } catch (e) {
        console.log(e);
        req.flash("error", e.message);

        res.redirect("/signup");
    }
};

//lOGIN 
module.exports.loginRender = (req, res) => {
    res.render("Users/signupPage");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

//LOGOUT

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};