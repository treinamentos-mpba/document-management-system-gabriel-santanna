const fs = require('node:fs/promises');
const documentService = require('../services/documentService');

function validateUser(req, res, next) {
  const userId = req.get('X-User-Id')?.trim();
  if (!userId || userId.length > 128 || /[\u0000-\u001f\u007f]/.test(userId)) {
    return res.status(400).json({ message: 'Informe um X-User-Id válido.' });
  }

  req.userId = userId;
  return next();
}

async function uploadDocument(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ message: 'Envie um arquivo no campo "file".' });
  }

  try {
    const document = documentService.createDocument(req.file, req.userId);
    return res.status(201).json(document);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    return next(error);
  }
}

function listDocuments(req, res) {
  return res.json(documentService.listDocuments(req.userId));
}

function downloadDocument(req, res, next) {
  const document = documentService.findDocumentForDownload(req.params.id, req.userId);
  if (!document) {
    return res.status(404).json({ message: 'Documento não encontrado.' });
  }

  return res.download(document.filePath, document.originalName, (error) => {
    if (!error) {
      return;
    }
    if (res.headersSent) {
      return next(error);
    }
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'Arquivo do documento não encontrado.' });
    }
    return res.status(500).json({ message: 'Não foi possível baixar o documento.' });
  });
}

module.exports = { validateUser, uploadDocument, listDocuments, downloadDocument };