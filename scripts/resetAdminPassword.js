require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash('123@kris', 12);
  const result = await mongoose.connection.collection('users').updateOne(
    { email: 'visheshjaiswar@gmail.com' },
    { $set: { password: hash, role: 'admin', isActive: true } }
  );
  console.log('Updated:', result.modifiedCount, 'document(s)');
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
