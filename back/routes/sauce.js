//Requires
const express = require("express");
const router = express.Router();
// Middlewares import
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// Sauce controller import
const sauceCtrl = require("../controllers/sauce");

// Create routes
router.get("/", auth, sauceCtrl.getAllSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/:id/like", auth, sauceCtrl.AddUserLike);
router.put("/:id", auth, multer, sauceCtrl.updateSauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);

module.exports = router;