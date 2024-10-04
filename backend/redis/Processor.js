const { notificationQueue } = require('./Queue');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASS,
  }
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

notificationQueue.process(async (job) => {
  const { message, user, email } = job.data;

  try {
    await sendEmail(email, 'Meeting Reminder', message);
    console.log(`Notification sent to ${user} (${email}): ${message}`);
  } catch (error) {
    console.error(`Error sending notification to ${user} (${email}):`, error);
    throw error;
  }
});

module.exports = { processNotifications: () => console.log('Notification processor started') };
