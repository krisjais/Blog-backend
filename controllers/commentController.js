const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// @desc  Get comments for a blog
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId, parentComment: null })
      .populate('author', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc  Add comment
exports.addComment = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog || blog.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    const comment = await Comment.create({
      blog: req.params.blogId,
      author: req.user._id,
      content: req.body.content,
      parentComment: req.body.parentComment || null,
    });
    await comment.populate('author', 'name avatar');
    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Like comment
exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const idx = comment.likes.indexOf(req.user._id);
    if (idx === -1) comment.likes.push(req.user._id);
    else comment.likes.splice(idx, 1);
    await comment.save({ validateBeforeSave: false });
    res.json({ success: true, likes: comment.likes.length });
  } catch (error) {
    next(error);
  }
};
