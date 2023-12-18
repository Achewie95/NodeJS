require("dotenv").config();

const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connect } = require("./database.js");
const product = require("./src/product.js");
const user = require("./src/user.js");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const db = require("./database.js");

//Declaring a variable to hold the client
app.use("/", express.static("src"));
app.set("view engine", "ejs");
app.set("views", "src");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Mongoose connection
connect()
  .then((connectedClient) => {
    client = connectedClient;

    // Start the server after the database connection is ready
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);

    process.exit(1);
  });

app.get("/", (req, res) => {
  const successMessage = req.query.success || "";
  res.render("login", { successMessage });
});

app.post("/", async (req, res) => {
  const { loginField, password } = req.body;

  try {
    const User = await user.findOne({
      $or: [{ username: loginField }, { email: loginField }],
    });

    console.log(User);

    console.log("Input Password:", password);
    console.log("User Password (Hashed):", User.password);

    const passwordMatch = await bcrypt.compare(password, User.password);

    if (!passwordMatch) {
      return res.render("login", {
        error: "Invalid username/email or password",
      });
    }

    // Redirect or do something else
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/register", (req, res) => {
  res.render("register", { errors: [], name: "", email: "" });
});

app.post("/register", async (req, res) => {
  const { username, email, password, password_confirmation } = req.body;
  let errors = [];

  // Perform form validation
  if (!username || !email || !password || !password_confirmation) {
    errors.push("All fields are required");
  }

  if (password !== password_confirmation) {
    errors.push("Passwords do not match");
  }

  try {
    const existingUser = await user.findOne({ email: email });

    if (existingUser) {
      errors.push("Email already exists");
    }

    if (errors.length > 0) {
      return res.render("register", { errors, username, email });
    }

    // Create a new user with hashed password
    const newUser = new user({
      username: username,
      email: email,
      password: password,
    });

    console.log(newUser);

    // Save the user to the database
    await newUser.save();
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Registration failed, try again");
  }
});

// To display Dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// To display All Products
app.get("/products", async (req, res) => {
  try {
    const allProducts = await product.find({});
    res.render("products", { products: allProducts });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// To add a product
app.get("/add-product", (req, res) => {
  res.render("addProduct");
});

app.post("/add-product", async (req, res) => {
  try {
    const {
      productID,
      name,
      description,
      price,
      category,
      weight,
      manufacturer,
      stockQuantity,
      SKU,
      imageURL,
    } = req.body;

    // Simple validation checks
    if (!productID || !name || !price || !category || !stockQuantity) {
      return res.status(400).send("Please provide all required fields");
    }

    // Create a new product object using the model
    const newProduct = new product({
      productID,
      name,
      description,
      price,
      category,
      weight,
      manufacturer,
      stockQuantity,
      SKU,
      imageURL,
    });

    // Save the product to the database
    await newProduct.save();
    res.redirect("/products");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// To update a product
app.get("/update-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const Product = await product.findById(productId);

    res.render("updateProduct", { Product });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/update-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      category,
      weight,
      manufacturer,
      stockQuantity,
      SKU,
      imageURL,
    } = req.body;

    // Convert productID to a number before updating
    const productID = parseInt(req.body.productID, 10);

    // Find the product by ID and update its details
    const updatedProduct = await product.findByIdAndUpdate(
      productId,
      {
        productID,
        name,
        description,
        price,
        category,
        weight,
        manufacturer,
        stockQuantity,
        SKU,
        imageURL,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.redirect("/products");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// To delete a product
app.post("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    await product.findByIdAndDelete(productId);

    res.redirect("/products");
  } catch (err) {
    res.status(500).send(err.message);
  }
});
