export default function DownloadButton({ document, disabled, onDownload }) {
  return (
    <button
      className="download-button"
      type="button"
      onClick={() => onDownload(document)}
      disabled={disabled}
      aria-label={`Baixar ${document.originalName}`}
      title="Baixar documento"
    >
      {disabled ? 'Baixando...' : 'Baixar'}
    </button>
  );
}