const express = require('express');
const documentController = require('../controllers/documentController');
const upload = require('./uploadMiddleware');

const router = express.Router();

router.post(
  '/upload',
  documentController.validateUser,
  upload.single('file'),
  documentController.uploadDocument
);
router.get('/documents', documentController.validateUser, documentController.listDocuments);
router.get(
  '/documents/:id/download',
  documentController.validateUser,
  documentController.downloadDocument
);

module.exports = router;