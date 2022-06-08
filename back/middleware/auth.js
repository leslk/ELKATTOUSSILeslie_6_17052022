// Reuqires
const jwt = require("jsonwebtoken");

// Verify authentication
module.exports = (req, res, next) => {
    try{
        // Decode token
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        // Check if request body userId exist 
        // if it doesn't match with userId == throw error
        if (req.body.userId && req.body.userId !== userId) {
            throw "requête non authentifiée !";
        } else {
            next();
        }

    } catch (error) {
        res.status(401).json({ error: error});
    }
}