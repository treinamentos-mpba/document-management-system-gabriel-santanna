import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, loading, downloadingId, onDownload }) {
  if (loading) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="list-message">Nenhum documento encontrado.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <span className="file-type-mark" aria-hidden="true">DOC</span>
          <div className="document-details">
            <span className="document-name">{document.originalName}</span>
            <span className="document-meta">
              {formatFileSize(document.size)} <span aria-hidden="true">/</span> {formatUploadDate(document.uploadedAt)}
            </span>
          </div>
          <DownloadButton
            document={document}
            disabled={downloadingId === document.id}
            onDownload={onDownload}
          />
        </li>
      ))}
    </ul>
  );
}