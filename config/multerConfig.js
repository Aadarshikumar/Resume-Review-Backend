const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer to store uploaded files in the 'uploads' folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter to allow only PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;