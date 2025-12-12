export function downloadBlob(response, filename) {
  const contentType = response.headers?.['content-type'] || 'application/pdf';
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function openBlobInNewTab(response) {
  const contentType = response.headers?.['content-type'] || 'application/pdf';
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const newWin = window.open(url, '_blank');
  if (!newWin) window.location.href = url;
  setTimeout(() => {
    try { window.URL.revokeObjectURL(url); } catch (e) {}
  }, 60000);
}