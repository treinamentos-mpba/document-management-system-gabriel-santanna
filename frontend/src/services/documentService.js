const API_BASE = '/api';

async function throwResponseError(response, fallbackMessage) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  throw new Error(payload?.message || fallbackMessage);
}

export async function listDocuments(userId) {
  const response = await fetch(`${API_BASE}/documents`, {
    headers: { 'X-User-Id': userId },
  });
  if (!response.ok) {
    await throwResponseError(response, 'Não foi possível carregar os documentos.');
  }
  return response.json();
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.set('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });
  if (!response.ok) {
    await throwResponseError(response, 'Não foi possível enviar o documento.');
  }
  return response.json();
}

export async function downloadDocument(document, userId) {
  const response = await fetch(
    `${API_BASE}/documents/${encodeURIComponent(document.id)}/download`,
    { headers: { 'X-User-Id': userId } }
  );
  if (!response.ok) {
    await throwResponseError(response, 'Não foi possível baixar o documento.');
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = document.originalName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}