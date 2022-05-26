const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config")

router.get("/", auth);
router.get("/:id", auth);
router.post("/", auth, multer);
router.put("/:id", auth, multer);
router.delete("/:id", auth);

module.exports = router;