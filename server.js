import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import express from 'express';
import mongoose from "mongoose";
import methodOverride from "method-override";//new for delete 
import morgan from "morgan"; //importing morgan 
import Fruit from "./models/fruit.js";


const app = express();
//new for delete function 
// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));//new for delete 
app.use(morgan("dev"));//new for delete 

// Log environment variables to debug
console.log("MONGODB_URL:", process.env.MONGODB_URL);

// Set the view engine to EJS
app.set('view engine', 'ejs');



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

app.get("/fruits/:fruitId", async (req, res) =>{
    const foundFruit = await Fruit.findById(req.params.fruitId);
    res.render(
       "fruits/show.ejs", { fruit: foundFruit}
    );
});

// GET localhost:3000/fruits/:fruitId/edit
app.get("/fruits/:fruitId/edit", async (req, res) => {
    const foundFruit = await Fruit.findById(req.params.fruitId);
    res.render("fruits/edit.ejs", {
        fruit: foundFruit,
    });
  });
  
app.delete("/fruits/:fruitId", async (req, res) =>{
    await Fruit.findByIdAndDelete(req.params.fruitId);
    res.redirect("/fruits");

});

// server.js

app.put("/fruits/:fruitId", async (req, res) => {
    // Handle the 'isReadyToEat' checkbox data
    if (req.body.isReadyToEat === "on") {
      req.body.isReadyToEat = true;
    } else {
      req.body.isReadyToEat = false;
    }
    
    // Update the fruit in the database
    await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);
  
    // Redirect to the fruit's show page to see the updates
    res.redirect(`/fruits/${req.params.fruitId}`);
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
