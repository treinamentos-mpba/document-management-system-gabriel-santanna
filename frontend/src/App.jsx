import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import {
  downloadDocument,
  listDocuments,
  uploadDocument,
} from './services/documentService.js';
import './App.css';

const DEFAULT_USER_ID = 'usuario-demo';

export default function App() {
  const [userInput, setUserInput] = useState(DEFAULT_USER_ID);
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [documents, setDocuments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError('');

    listDocuments(userId)
      .then((items) => {
        if (isCurrent) setDocuments(items);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setDocuments([]);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [userId, refreshKey]);

  async function handleUpload(file) {
    setUploading(true);
    setError('');
    setNotice('');
    try {
      await uploadDocument(file, userId);
      setNotice('Documento enviado.');
      setRefreshKey((key) => key + 1);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setError('');
    try {
      await downloadDocument(document, userId);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloadingId(null);
    }
  }

  function handleUserSubmit(event) {
    event.preventDefault();
    const nextUserId = userInput.trim();
    if (!nextUserId) {
      setError('Informe uma identidade válida.');
      return;
    }
    setError('');
    setNotice('');
    setUserId(nextUserId);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DMS</span>
        </a>
        <form className="identity-form" onSubmit={handleUserSubmit}>
          <label htmlFor="user-id">Identidade</label>
          <input
            id="user-id"
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            maxLength={128}
            required
          />
          <button type="submit" className="quiet-button">Aplicar</button>
        </form>
      </header>

      <main className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">BIBLIOTECA PESSOAL</p>
            <h1>Documentos</h1>
          </div>
          <span className="document-count" aria-live="polite">
            {documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
        </div>

        <section className="upload-section" aria-labelledby="upload-heading">
          <div className="section-heading">
            <span className="section-index">01</span>
            <h2 id="upload-heading">Adicionar documento</h2>
          </div>
          <UploadComponent onUpload={handleUpload} uploading={uploading} />
        </section>

        {(error || notice) && (
          <div className={`feedback ${error ? 'feedback-error' : 'feedback-success'}`} role="status">
            {error || notice}
          </div>
        )}

        <section className="documents-section" aria-labelledby="documents-heading">
          <div className="section-heading documents-heading">
            <div className="section-title">
              <span className="section-index">02</span>
              <h2 id="documents-heading">Seus arquivos</h2>
            </div>
            <button
              className="quiet-button"
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loading}
            >
              Atualizar
            </button>
          </div>
          <DocumentList
            documents={documents}
            loading={loading}
            downloadingId={downloadingId}
            onDownload={handleDownload}
          />
        </section>
      </main>
      <footer className="page-footer">
        <span>Document Management System</span>
        <span>Armazenamento local</span>
      </footer>
    </div>
  );
}
