require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const email = 'visheshjaiswar009@gmail.com';

  let user = await User.findOne({ email });

  if (user) {
    user.role = 'admin';
    await user.save({ validateBeforeSave: false });
    console.log(`✓ Existing user "${user.name}" updated to admin`);
  } else {
    user = await User.create({
      name: 'Admin',
      email,
      password: '123@kris',
      role: 'admin',
    });
    console.log(`✓ Admin user created: ${user.email}`);
  }

  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
