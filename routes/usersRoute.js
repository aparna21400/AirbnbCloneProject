const express = require("express");
const router = express.Router();
const user = require("../models/userModel")
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

// SIGNUP ROUTE
router.route("/signup")
    .get(userController.signupRender)
    .post(userController.signup);

// LOGIN ROUTE
router.route("/login")
    .get(userController.loginRender)
    .post(saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), userController.login);

// LOGOUT ROUTE
router.get("/logout", userController.logout);


module.exports = router;