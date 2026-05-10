require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

sendEmail({
  to: process.argv[2] || 'test@example.com',
  subject: 'BlogHub — SMTP Test',
  html: '<p>SMTP is working correctly via Brevo!</p>',
}).then(() => {
  console.log('✓ Test email sent successfully');
  process.exit(0);
}).catch(err => {
  console.error('✗ Failed:', err.message);
  process.exit(1);
});
