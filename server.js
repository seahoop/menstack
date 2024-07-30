import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import express from 'express';
import mongoose from "mongoose";
import Fruit from "./models/fruit.js";

const app = express();

// Log environment variables to debug
console.log("MONGODB_URL:", process.env.MONGODB_URL);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoDBUrl = process.env.MONGODB_URL;
if (!mongoDBUrl) {
  throw new Error("MONGODB_URL environment variable is not defined");
}

mongoose.connect(mongoDBUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/fruits", async (req, res) => {
    const allFruits = await Fruit.find();
    res.render("fruits/index.ejs", { fruits: allFruits});
  });
  


app.get("/fruits/new", (req, res) => {
  res.render("fruits/new");
});

// POST /fruits
app.post("/fruits", async (req, res) => {
  if (req.body.isReadyToEat === "on") {
    req.body.isReadyToEat = true;
  } else {
    req.body.isReadyToEat = false;
  }
  await Fruit.create(req.body);
  res.redirect("/fruits");
});

app.listen(3000, () => {
  console.log("Listening on Port 3000");
});
