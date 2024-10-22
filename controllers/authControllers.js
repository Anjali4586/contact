const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendVerificationEmail } = require('../utils/email');

// Register
exports.register = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hashedPassword]);
        
        sendVerificationEmail(email, result.insertId);
        res.status(201).json({ message: 'User registered, please verify your email.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.verifyEmail = async (req, res) => {
    const { id } = req.params;
    await db.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [id]);
    res.json({ message: 'Email verified successfully!' });
};


exports.passwordResetRequest = async (req, res) => {
    const { email } = req.body;
    
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        // Store OTP in the database
        await db.query('INSERT INTO password_resets (user_id, otp) VALUES (?, ?)', [user.id, otp]);

        // Send OTP email
        sendPasswordResetEmail(email, otp);
        res.json({ message: 'OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Password Reset
exports.passwordReset = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Verify OTP
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const [otpRecords] = await db.query('SELECT * FROM password_resets WHERE user_id = ? AND otp = ?', [user.id, otp]);
        const otpRecord = otpRecords[0];

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        // Optionally, delete the OTP record
        await db.query('DELETE FROM password_resets WHERE user_id = ?', [user.id]);

        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
