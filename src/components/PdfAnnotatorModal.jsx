import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import PdfAnnotator from "./PdfAnnotator";
import { saveAnnotations, loadAnnotations } from "../services/annotationsService";

const PdfAnnotatorModal = ({ scoreId, onClose }) => {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scoreId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/scores/${scoreId}/pdf`, { responseType: "arraybuffer", headers: { Accept: "application/pdf" } });
        if (cancelled) return;
        setPdfData(res.data);
      } catch (err) {
        console.error("Failed to fetch PDF for annotate", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [scoreId]);

  async function handleSaveAnnotations(json, pageNumber) {
    try {
      await saveAnnotations(scoreId, pageNumber, json);
    } catch (e) {
      console.error("Failed saving annotations", e);
    }
  }

  async function handleLoadAnnotations(pageNumber) {
    try {
      const resp = await loadAnnotations(scoreId, pageNumber);
      return resp;
    } catch (e) {
      console.error("Failed loading annotations", e);
      return null;
    }
  }

  if (loading) return <div className="modal">Loading PDF...</div>;
  if (!pdfData) return null;

  return (
    <div className="pdf-annotator-modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 1400, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "min(1100px, 96%)", height: "min(90vh, 1000px)", background: "white", borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 8, background: "transparent", display: "flex", justifyContent: "flex-end" }}>
          <button className="minecraft-button" onClick={onClose}>Close</button>
        </div>

        <div style={{ flex: 1 }}>
          <PdfAnnotator pdfUrl={pdfData} />
        </div>
      </div>
    </div>
  );
};

export default PdfAnnotatorModal;