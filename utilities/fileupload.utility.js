const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads/');
  },
  filename(req, file, callback) {
    callback(null, new Date().toISOString() + file.originalname);
  },
});

const upload = multer({ storage });
const file = upload.single('image');
module.exports = { file };

