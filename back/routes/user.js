// Requires
const express = require('express');
const router = express.Router();

// User controller import
const userCtrl = require('../controllers/user');

// Create routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;