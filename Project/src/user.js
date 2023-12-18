const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: {
      type: String,
      set: (password) => {
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        return hashedPassword;
      },
    },
  },
  { collection: "user" }
);

const user = mongoose.model("User", userSchema);

module.exports = user;
