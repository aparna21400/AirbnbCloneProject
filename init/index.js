const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("./models/listingModel");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
    console.log("connected!");
})
    .catch((err) => {
        console.log(err)
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}
const initDb = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "68ecbe7b62d5e76ee51151d4" }));
    await Listing.insertMany(initData.data);
    console.log("data was initalised");
}

initDb();