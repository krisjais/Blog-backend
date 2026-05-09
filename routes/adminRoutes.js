const express = require('express');
const router = express.Router();
const {
  getAllBlogs, approveBlog, rejectBlog, getAnalytics, getAllUsers, deleteUser, toggleUserStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/blogs', getAllBlogs);
router.put('/blogs/:id/approve', approveBlog);
router.put('/blogs/:id/reject', rejectBlog);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
