const express = require('express');
const router = express.Router();
const {
  getBlogs, getBlogBySlug, getTrendingBlogs, createBlog, updateBlog,
  deleteBlog, getMyBlogs, toggleLike, toggleBookmark, getBookmarks, getAuthorBlogs,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/my', protect, getMyBlogs);
router.get('/bookmarks', protect, getBookmarks);
router.get('/author/:authorId', getAuthorBlogs);
router.get('/:slug', getBlogBySlug);

router.post('/', protect, upload.single('thumbnail'), createBlog);
router.put('/:id', protect, upload.single('thumbnail'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
