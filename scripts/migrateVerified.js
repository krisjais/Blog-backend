require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await mongoose.connection.collection('users').updateMany(
    {},
    { $set: { isEmailVerified: true } }
  );
  console.log(`✓ Marked ${result.modifiedCount} existing users as email-verified`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
