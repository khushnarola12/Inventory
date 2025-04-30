const multer = require("multer");
const path = require("path");

// Define file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ✅ Local folder in your project
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

// Specify the file format that can be saved
function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
  }
}

// File size formatter
function fileSizeFormatter(bytes, decimalPlaces = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimalPlaces < 0 ? 0 : decimalPlaces;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${size} ${sizes[i]}`;
}

const upload = multer({ storage, fileFilter });

module.exports = {
  upload,
  fileSizeFormatter,
};
