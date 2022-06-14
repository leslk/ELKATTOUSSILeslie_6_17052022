// Requires
const multer = require("multer");
const fs = require("fs");
const imageDir = "./images";
// Create images folder

if (fs.existsSync(imageDir)) {
    console.log("Dossier image déjà créé")
} else {
    fs.mkdir('./images', (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Dossier images créé !');
    });
}


// Set files extensions
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png"
}

// Set multer storage configuration
const storage = multer.diskStorage({
    // Set destination of files
    destination: (req, file, callback) => {
        callback(null, "images")
    },
    // Set filename
    filename: (req, file, callback) => {
        // Remove extension
        let nameWhithoutExt = file.originalname.split(".")[0];
        // Replace space by underscore
        let name = nameWhithoutExt.split(" ").join("_");
        // define the type of file
        const extension = MIME_TYPES[file.mimetype];
        // Generate name of file
        callback(null, name + Date.now() + "." + extension);
    }
});

module.exports = multer({storage: storage}).single("image");