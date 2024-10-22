const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

exports.sendVerificationEmail = (email, userId) => {
    const verificationLink = `http://localhost:3000/api/auth/verify-email/${userId}`;
    
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking the following link: ${verificationLink}`,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};
