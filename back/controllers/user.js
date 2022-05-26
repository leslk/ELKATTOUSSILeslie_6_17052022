const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pwValidator = require("../services/pw-validator");
const cryptoJS = require("crypto-js");

exports.signup = (req, res, next) => {
    const cryptedEmail = cryptoJS.HmacSHA256(req.body.email, "CRYPTO_JS_KEY").toString();
    const pwErrors = pwValidator.validate(req.body.password, {details: true});
    console.log(pwErrors);
    if (pwErrors.length === 0) {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: cryptedEmail,
                password: hash
            });
            user.save()
            .then(() => res.status(201).json({message: "Utilisateur crée !"}))
            .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
    } else {
        return res.status(400).json({error: pwErrors[0].message});
    }
};

exports.login = (req, res, next) => {
    const cryptedEmail = cryptoJS.HmacSHA256(req.body.email, "CRYPTO_JS_KEY").toString();
    User.findOne({email: cryptedEmail})
    .then(user => {
        if(!user){
            return res.status(401).json({ error: "Utilisateur non trouvé !"});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid) {
                return res.status(401).json({ error: "Mot de passe incorrect !"});
            }
            return res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    {userId: user._id},
                    process.env.TOKEN_SECRET,
                    {expiresIn: "24h"}
                    )
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));

};