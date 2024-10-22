const db = require('../config/db');
const Joi = require('joi');

// Add Contact
exports.addContact = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
        address: Joi.string(),
        timezone: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, phone, address, timezone } = req.body;
    const userId = req.user.id;

    try {
        const [result] = await db.query('INSERT INTO contacts (user_id, name, email, phone, address, timezone) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, name, email, phone, address, timezone]);
        res.status(201).json({ id: result.insertId, message: 'Contact added.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Contacts
exports.getContacts = async (req, res) => {
    const userId = req.user.id;
    const { name, email, timezone } = req.query;

    let query = 'SELECT * FROM contacts WHERE user_id = ? AND is_active = TRUE';
    const params = [userId];

    if (name) {
        query += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }
    if (email) {
        query += ' AND email = ?';
        params.push(email);
    }
    if (timezone) {
        query += ' AND timezone = ?';
        params.push(timezone);
    }

    try {
        const [contacts] = await db.query(query, params);
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Contact
exports.updateContact = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, timezone } = req.body;

    try {
        await db.query('UPDATE contacts SET name = ?, email = ?, phone = ?, address = ?, timezone = ? WHERE id = ?',
            [name, email, phone, address, timezone, id]);
        res.json({ message: 'Contact updated.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Soft Delete Contact
exports.deleteContact = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('UPDATE contacts SET is_active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'Contact deleted.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

