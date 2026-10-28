export default function UploadComponent({ onUpload, uploading }) {
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.namedItem('file').files[0];
    if (file && await onUpload(file)) {
      form.reset();
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-picker" htmlFor="document-file">
        <span className="file-picker-mark" aria-hidden="true">+</span>
        <span>Selecionar arquivo</span>
        <input id="document-file" name="file" type="file" required />
      </label>
      <button className="primary-button" type="submit" disabled={uploading}>
        {uploading ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}