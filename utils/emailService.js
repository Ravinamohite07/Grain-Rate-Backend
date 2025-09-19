import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/userModel.js'; // Ensure the correct user model is imported

dotenv.config(); // Load environment variables from .env

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email notifications
export const sendEmailNotification = async (userId, subject, message) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.error(`No email found for user ${userId}`);
      return;
    }

    const mailOptions = {
      from: `"Order System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"GrainRate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
