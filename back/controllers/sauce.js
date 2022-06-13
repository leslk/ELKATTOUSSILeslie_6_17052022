// Requires
const Sauce = require("../models/sauce");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// Create sauce
exports.createSauce = (req, res, next) => {
    let newSauce = JSON.parse(req.body.sauce);
    // Create new sauce based on the sauceShcema created, add image Url and save it to database
    const sauce = new Sauce ({
        ...newSauce,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
    .then(() => res.status(201).json({message: "sauce Créée !"}))
    .catch(error => res.status(400).json({ error }));
};

// Get all sauces
exports.getAllSauce = (req, res, next) => {
    // Find all sauces in database
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Get one sauce 
exports.getOneSauce = (req, res, next) => {
    // Get one sauce by sauce Id found in URL
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Update sauce
exports.updateSauce = (req, res, next) => {
    // Set an empty sauce object
    let sauceObject = {};
    // Check if there is a file in request
    if(req.file)  {
        // Find the sauce by ID to remove the replaced image from images folder
        Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlinkSync(`images/${filename}`)
        })
        // Set the sauce object created before with request body sauce and request file
        // Request body sauce is a string that we have to set in JSON.
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
    // If there is no file set the sauce object created before with request body
    } else {
        sauceObject = {
            ...req.body
        }
    }
    // Update sauce in database by ID 
    Sauce.updateOne({ _id: req.params.id}, {
             ...sauceObject,
            _id: req.params.id
        })
    .then(() => res.status(200).json({
        message: 'Sauce modifiée !'
    }))
    .catch((error) => res.status(400).json({
        error
    }));
}

// Delete sauce
exports.deleteSauce = (req, res, next) => {
    // Decode token
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    // get sauce in database by ID and delete it unless the userId is not matching
    // also delete image from image folder
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        if (sauce.userId != userId) {
            return res.status(401).json("requête non autorisée !");
        }
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(__dirname + "/../images/" + filename, (err) => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !"}))
            .catch(error => res.status(400).json({ error: error })); 
        })
          
    })
    .catch(error => res.status(500).json({error: error}));
};

// Like or dislike sauce
exports.AddUserLike = (req, res, next) => {
    // Get sauce in database by ID
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        switch(req.body.like) {

            //The user add a like
            case 1:
                // User has already liked = error
                if(sauce.usersLiked.includes(req.body.userId)) {
                    res.status(400).json({error: "Vous avez deja liké cette sauce"}); 
                // User has already disliked this sauce = error
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    res.status(400).json({error: "Vous ne pouvez pas liké une sauce que vous avez deja disliké !"});
                // Incrementing likes and push userId into usersLiked array
                } else {
                    Sauce.updateOne({_id: req.params.id},
                        {$push : {usersLiked: req.body.userId},
                        $inc: {likes: +1}})
                    .then(() => {
                        res.status(200).json({message: "vous avez ajouté un like à cette sauce"});
                    })
                    .catch(error => res.status(400).json({ error }));    
                }
                break;
            
            // the user want to erase its opinion
            case 0: 
                // Check if the userId is in the usersLiked array and delete it if it's the case + decrementing likes
                if(sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({_id: req.params.id},
                        {$pull : {usersLiked: req.body.userId},
                        $inc: {likes: -1}})
                    .then(() => {
                        res.status(200).json({message: "vous avez retiré votre like"});
                    })
                    .catch(error => res.status(400).json({ error }));
                // Check if the userId is in the usersDisliked array and delete it if it's the case + decrementing dislikes
                } else if (sauce.usersDisliked.includes(req.body.userId)){
                    Sauce.updateOne({_id: req.params.id},
                        {$pull : {usersDisliked: req.body.userId},
                        $inc: {dislikes: -1}})
                    .then(() => {
                        res.status(200).json({message: "vous avez retiré votre dislike"});
                    })
                    .catch(error => res.status(400).json({ error }));
                }
                break;

            case -1:
                // User has already disliked = error
                if(sauce.usersDisliked.includes(req.body.userId)) {
                    res.status(400).json({error: "Vous avez deja disliké cette sauce"});
                // User has already liked this sauce = error 
                } else if (sauce.usersLiked.includes(req.body.userId)){
                    res.status(400).json({error: "Vous ne pouvez pas disliké une sauce que vous avez deja liké !"});
                // Incrementing dislikes and push userId into usersDisliked array
                } else {
                    Sauce.updateOne({_id: req.params.id},
                        {$push : {usersDisliked: req.body.userId},
                        $inc: {dislikes: +1}})
                    .then(() => {
                        res.status(200).json({message: "vous avez ajouté un dislike à cette sauce"});
                    })
                    .catch(error => res.status(400).json({ error })); 
                }
                break;

            default : 
            res.status(400).json({error: "Paramêtre de requête invalide ! "});
        }
        
    })
    .catch(error => res.status(500).json({error: error}));
};