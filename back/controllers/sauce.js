const Sauce = require("../models/sauce");
const fs = require("fs");
const jwt = require("jsonwebtoken");


exports.createSauce = (req, res, next) => {
    let newSauce = req.body.sauce;
    if (typeof(newSauce) === "string") {
        newSauce = JSON.parse(newSauce);
    }
    const sauce = new Sauce ({
        ...newSauce,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
    .then(() => res.status(201).json({message: "sauce Crée !"}))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.updateSauce = (req, res, next) => {
    let sauceObject = {};
    if(req.file)  {
        Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlinkSync(`images/${filename}`);
        })
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
    } else {
        sauceObject = {
            ...req.body
        }
    }
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

exports.deleteSauce = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    Sauce.findOneAndDelete({_id: req.params.id})
    .then(sauce => {
        if (sauce.userId != userId) {
            return res.status(401).json("requête non autorisée !");
        }
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(__dirname + "/../images/" + filename, (err) => {
            if (err) {
               return res.status(500).json({error: error});
            }
            return res.status(200).json({message: "Objet supprimé !"})
        });   
    })
    .catch(error => res.status(500).json({error: error}));
};

exports.AddUserLike = (req, res, next) => {
    console.log(req.body);
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        switch(req.body.like) {

            case 1:
                // User has already liked = error
                if(sauce.usersLiked.includes(req.body.userId)) {
                    res.status(400).json({error: "Vous avez deja liké cette sauce"}); 
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    res.status(400).json({error: "Vous ne pouvez pas liké une sauce que vous avez deja disliké !"});
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
            
            case 0: 
                if(sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({_id: req.params.id},
                        {$pull : {usersLiked: req.body.userId},
                        $inc: {likes: -1}})
                    .then(() => {
                        res.status(200).json({message: "vous avez retiré votre like"});
                    })
                    .catch(error => res.status(400).json({ error }));
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
                } else if (sauce.usersLiked.includes(req.body.userId)){
                    res.status(400).json({error: "Vous ne pouvez pas disliké une sauce que vous avez deja liké !"});
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