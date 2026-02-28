require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/userModel");
const usersRoute = require("./routes/usersRoute");
const listingRoute = require("./routes/listingRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Set working directory
process.chdir(__dirname);

// ==================== View Engine Setup ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ==================== Static Files & Body Parser ====================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ==================== Session Store ====================
const Store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

Store.on("error", (err) => {
    logger.error(`Session Store Error: ${err.message}`);
});

const sessionOptions = {
    store: Store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    },
};

app.use(session(sessionOptions));
app.use(flash());

// ==================== Passport Authentication ====================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==================== Local Variables Middleware ====================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ==================== Routes ====================
app.get("/", (req, res) => {
    return res.send("Airbnb Clone API is running!");
});

app.use("/listings", listingRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", usersRoute);

// ==================== 404 Handler ====================
app.use((req, res) => {
    return res.status(404).send("Page not found");
});

// ==================== Centralized Error Handler (MUST BE LAST) ====================
app.use(errorHandler);

// ==================== Unhandled Promise Rejections ====================
process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// ==================== Uncaught Exceptions ====================
process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

module.exports = app;
