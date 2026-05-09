const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, bio }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    const { uploadToCloudinary } = require('../utils/uploadToCloudinary');
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
