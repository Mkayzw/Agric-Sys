<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

=======
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

>>>>>>> 1d12cc19c4d3855a6b3534a8acfc9a5c99a896ea
module.exports = router; 