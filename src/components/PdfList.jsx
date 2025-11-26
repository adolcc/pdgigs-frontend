import React, { useState, useEffect } from 'react';

const PdfList = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Obtener lista de scores
    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            const response = await fetch('/api/scores');
            const scoresData = await response.json();
            setScores(scoresData);
        } catch (error) {
            console.error('Error fetching scores:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = (scoreId, title) => {
        window.open(`/api/scores/${scoreId}/pdf`);
    };

    const viewPdf = (scoreId, title) => {
        window.open(`/api/scores/${scoreId}/view`);
    };

    if (loading) return (
        <div className="minecraft-loading">
            <p>⛏️ Cargando partituras...</p>
        </div>
    );

    return (
        <div className="minecraft-container">
            <h2>📜 Partituras Disponibles</h2>
            
            {scores.length === 0 ? (
                <div className="minecraft-empty">
                    <p>¡No hay partituras en el cofre!</p>
                </div>
            ) : (
                <div className="minecraft-grid">
                    {scores.map(score => (
                        <div key={score.id} className="minecraft-item">
                            <div className="item-header">
                                <h3>🎵 {score.title}</h3>
                            </div>
                            <div className="item-details">
                                <p>✍️ <strong>Autor:</strong> {score.author}</p>
                                <p>🎼 <strong>Estilo:</strong> {score.musicalStyle}</p>
                                <p>📦 <strong>Tamaño:</strong> {(score.fileSize / 1024).toFixed(0)} KB</p>
                            </div>
                            
                            <div className="item-actions">
                                <button 
                                    onClick={() => viewPdf(score.id, score.title)}
                                    className="minecraft-button view-btn"
                                >
                                    👀 Ver
                                </button>
                                <button 
                                    onClick={() => downloadPdf(score.id, score.title)}
                                    className="minecraft-button download-btn"
                                >
                                    ⬇️ Descargar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón para recargar */}
            <div className="reload-section">
                <button 
                    onClick={fetchScores}
                    className="minecraft-button reload-btn"
                >
                    🔄 Actualizar Lista
                </button>
            </div>
        </div>
    );
};

export default PdfList;