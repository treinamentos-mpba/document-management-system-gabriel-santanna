const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage')
);
const configuredLimit = Number(process.env.MAX_FILE_SIZE);
const fileSizeLimit = Number.isFinite(configuredLimit) && configuredLimit > 0
  ? configuredLimit
  : 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename: (req, file, callback) => {
    callback(null, randomUUID());
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: fileSizeLimit, files: 1 },
});