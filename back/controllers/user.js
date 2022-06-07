// Requires
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pwValidator = require("../services/pw-validator");
const cryptoJS = require("crypto-js");

// User signup
exports.signup = (req, res, next) => {
    // Check if the email and password are valid and set cryptage
    const keyutf = cryptoJS.enc.Utf8.parse(process.env.CRYPTO_JS_KEY);
    const iv = cryptoJS.enc.Base64.parse(process.env.CRYPTO_JS_KEY);
    const cryptedEmail = cryptoJS.AES.encrypt(req.body.email, keyutf, {iv: iv}).toString();
    const pwErrors = pwValidator.validate(req.body.password, {details: true});
    const emailRegex = /^([a-zA-Z0-9\.-_]+)@([a-zA-Z0-9-_]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({error: "email incorrect"}); 
    }
    // if email and password are okay create new user and save it into database
    else if (pwErrors.length === 0) {
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
        return res.status(400).json({error: pwErrors});
    }
};

// User login
exports.login = (req, res, next) => {
    // Set cryptage
    const keyutf = cryptoJS.enc.Utf8.parse(process.env.CRYPTO_JS_KEY);
    const iv = cryptoJS.enc.Base64.parse(process.env.CRYPTO_JS_KEY);
    const cryptedEmail = cryptoJS.AES.encrypt(req.body.email, keyutf, {iv: iv}).toString();

    // const decryptedEmail = cryptoJS.AES.decrypt({ciphertext : cryptoJS.enc.Base64.parse(cryptedEmail)}, keyutf, {iv : iv});
    // const dec = cryptoJS.enc.Utf8.stringify(decryptedEmail);

    // find user in database by his email
    User.findOne({email: cryptedEmail})
    .then(user => {
        // If user doesn't exist = error
        if(!user){
            return res.status(401).json({ error: "Utilisateur non trouvé !"});
        }
        // Check if request body password and user password in database are matching
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            // If it's the wrong password = error
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