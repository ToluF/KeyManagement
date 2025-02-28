const express = require('express');
const router = express.Router();
const login = require('../controllers/loginController');

router.post('/login', login.login);
router.post('/signup', login.signup);
router.get('/verify', login.verifyToken);
// router.post('/create-admin', login.createAdmin);

module.exports = router;