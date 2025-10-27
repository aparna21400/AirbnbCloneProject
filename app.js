require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listings = require("./models/listingModel");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/reviewModel");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport")
const LocalStrategy = require("passport-local")
const user = require("./models/userModel")
const usersRoute = require("./routes/usersRoute");
const listingRoute = require("./routes/listingRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const dbURL = process.env.ATLASDB_URL;

// console.log("=== DEBUG INFO ===");
// console.log("dbURL:", dbURL);
// console.log("dbURL type:", typeof dbURL);
// console.log("==================");

main().then(() => {
    console.log("connected!");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);


const Store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,

    },
    touchAfter: 24 * 3600,
});

Store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: Store,
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings", listingRoute);
app.use("/listings/:id/reviews", reviewsRoute); // phle flash ayega fir routes ayega
app.use("/", usersRoute);

app.get("/", (req, res) => {
    res.send("Airbnb Clone API is running!");
});

// middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong !" } = err;
    res.render("error.ejs", { message });
});

// Server Route
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
