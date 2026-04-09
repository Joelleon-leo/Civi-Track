const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', authenticateToken, upload.array('images', 5), complaintsController.createComplaint);
router.get('/', authenticateToken, complaintsController.getComplaints);
router.get('/:id', authenticateToken, complaintsController.getComplaintById);
router.patch('/:id/status', authenticateToken, authorizeRole('authority'), complaintsController.updateStatus);
router.patch('/:id/resolved-picture', authenticateToken, authorizeRole('authority'), upload.single('resolved_picture'), complaintsController.uploadResolvedPicture);

module.exports = router;
