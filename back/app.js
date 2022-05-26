const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");

// express settings
const app = express();
app.use(express.json()); 

// security settings
require("dotenv").config({path: "./config/.env"});
app.use(helmet());


const userRoutes = require("./routes/user");

mongoose.connect(process.env.MONGO_LOGIN,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(error));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(path.join(__dirname, "images"));
app.use("/api/auth", userRoutes);

module.exports = app;