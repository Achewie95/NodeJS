require("dotenv").config();
const mongoose = require("mongoose");
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}`;
const user = require("./src/user");
const bcrypt = require("bcrypt");

async function connect() {
  try {
    const test = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // const hashedPassword1 = await bcrypt.hash("admin", 10);
    // const hashedPassword2 = await bcrypt.hash("user", 10);

    // // Inserting two user records
    // await user.insertMany([
    //   {
    //     username: "admin",
    //     email: "admin@gmail.com",
    //     password: "admin",
    //   },
    //   { username: "user",
    //     email: "user@gmail.com",
    //     password: "user",
    //   },
    // ]);

    // console.log("Pre-inserted two users");

    // Retrieve all documents (users) from the user collection
    const users = await user.find();

    // Log the retrieved users to the console
    console.log("All users in the database:");
    console.log(users);

    return mongoose;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

module.exports = { connect };
