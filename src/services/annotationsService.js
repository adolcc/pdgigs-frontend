import axiosInstance from "./axiosInstance";

/**
 * Guarda las anotaciones para una página de un score.
 * payload = { pageNumber, annotationsJson }
 */
export async function saveAnnotations(scoreId, pageNumber, annotationsJson) {
  const payload = { pageNumber, annotationsJson };
  try {
    const res = await axiosInstance.post(
      `/api/scores/${encodeURIComponent(scoreId)}/annotations`,
      payload
    );
    return res.data;
  } catch (err) {
    console.error("saveAnnotations failed:", err?.message ?? err);
    throw err;
  }
}

/**
 * Intenta cargar anotaciones. Si el servidor responde 404 (no hay anotaciones),
 * devolvemos null en vez de lanzar. Para otros errores volvemos a lanzar.
 */
export async function loadAnnotations(scoreId, pageNumber) {
  try {
    const res = await axiosInstance.get(
      `/api/scores/${encodeURIComponent(scoreId)}/annotations`,
      { params: { page: pageNumber } }
    );
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) {
      // No hay anotaciones guardadas para esa página: devolver null (comportamiento esperado)
      return null;
    }
    console.error("loadAnnotations failed:", err?.message ?? err);
    throw err;
  }
}