const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @desc  Get all blogs (admin)
exports.getAllBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');

    res.json({ success: true, blogs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc  Approve blog
exports.approveBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: '' },
      { new: true }
    ).populate('author', 'name email');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc  Reject blog
exports.rejectBlog = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || 'Does not meet our guidelines' },
      { new: true }
    ).populate('author', 'name email');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc  Get dashboard analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalBlogs, pendingBlogs, approvedBlogs, rejectedBlogs, totalUsers, totalComments] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'pending' }),
      Blog.countDocuments({ status: 'approved' }),
      Blog.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'user' }),
      Comment.countDocuments(),
    ]);

    const topBlogs = await Blog.find({ status: 'approved' })
      .sort('-views')
      .limit(5)
      .select('title views likes slug')
      .populate('author', 'name');

    const recentBlogs = await Blog.find({ status: 'pending' })
      .sort('-createdAt')
      .limit(5)
      .select('title author createdAt')
      .populate('author', 'name');

    res.json({
      success: true,
      analytics: { totalBlogs, pendingBlogs, approvedBlogs, rejectedBlogs, totalUsers, totalComments },
      topBlogs,
      recentBlogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await User.countDocuments();
    const users = await User.find()
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');
    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete user (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    await Blog.deleteMany({ author: req.params.id });
    await user.deleteOne();
    res.json({ success: true, message: 'User and their blogs deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle user active status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};
