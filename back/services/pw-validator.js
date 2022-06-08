// Requires
const passwordValidator = require("password-validator");

// Set const that contains new passwordValidator
const passwordSchema = new passwordValidator();

// Create password schema
passwordSchema
.is().min(8)
.is().max(64)
.has().symbols()
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces();

module.exports = passwordSchema;