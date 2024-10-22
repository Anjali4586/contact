const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

router.post('/', auth, contactController.addContact);
router.get('/', auth, contactController.getContacts);
router.put('/:id', auth, contactController.updateContact);
router.delete('/:id', auth, contactController.deleteContact);
router.post('/upload', auth, contactController.uploadContacts);

module.exports = router;
