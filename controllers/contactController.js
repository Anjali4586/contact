const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const xlsx = require('xlsx');

// Configure multer
const upload = multer({ dest: 'uploads/' });

// Upload and parse file
exports.uploadContacts = upload.single('file'), async (req, res) => {
    const results = [];
    
    const extension = req.file.originalname.split('.').pop();
    const filePath = `uploads/${req.file.filename}`;
    
    if (extension === 'csv') {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Validate and save contacts from results
                res.json(results);
            });
    } else if (extension === 'xlsx') {
        const workbook = xlsx.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        const contacts = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        // Validate and save contacts from contacts array
        res.json(contacts);
    }
};
