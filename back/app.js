// Requires
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
// security settings
const helmet = require("helmet");
require("dotenv").config({path: "./config/.env"});

// express settings
const app = express();
app.use(express.json()); 

// Routes
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce")

// Connect to MongoDB
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@cluster0.94ian.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(error));

// Helmet settings
app.use(helmet({
  crossOriginResourcePolicy: false,
}
));

// Settings CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Routes settings
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

module.exports = app;