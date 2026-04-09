const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/register', upload.single('profile_picture'), authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.patch('/profile', authenticateToken, upload.single('profile_picture'), authController.updateProfile);

module.exports = router;
