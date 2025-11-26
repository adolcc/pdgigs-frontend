import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import MinecraftModal from './MinecraftModal';
import MinecraftAlert from './MinecraftAlert';

const PdfList = () => {
    const [scores, setScores] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingScore, setEditingScore] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', author: '', musicalStyle: '' });
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, score: null });
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    
    const { authToken, userRole, userEmail } = useContext(AuthContext);

    useEffect(() => {
        if (!authToken) {
            setLoading(false);
            return;
        }
        fetchScores();
    }, [authToken]);

    useEffect(() => {
        if (scores.length > 0 && authToken && userEmail) {
            if (userRole === 'ROLE_ADMIN') {
                setFilteredScores(scores);
            } else {
                const firstScore = scores[0];
                const backendHasUserFields = firstScore.userEmail !== undefined || firstScore.userId !== undefined;
                
                let userScores;
                
                if (backendHasUserFields) {
                    userScores = scores.filter(score => score.userEmail === userEmail);
                } else {
                    userScores = scores;
                }
                
                setFilteredScores(userScores);
            }
        } else {
            setFilteredScores([]);
        }
    }, [scores, authToken, userRole, userEmail]);

    const fetchScores = async () => {
        try {
            const response = await axiosInstance.get('/api/scores/metadata');
            setScores(response.data);
        } catch (error) {
            showAlert('Error', 'Error loading scores: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (title, message, type = 'info') => {
        setAlert({ isOpen: true, title, message, type });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, score: null });
    };

    const confirmDelete = async () => {
        const { score } = deleteModal;
        if (!score) return;

        try {
            await axiosInstance.delete(`/api/scores/${score.id}`);
            showAlert('Success', `"${score.title}" deleted successfully!`, 'success');
            closeDeleteModal();
            fetchScores();
        } catch (error) {
            showAlert('Delete Error', 'Error deleting score: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const startEdit = (score) => {
        setEditingScore(score.id);
        setEditForm({
            title: score.title || '',
            author: score.author || '',
            musicalStyle: score.musicalStyle || ''
        });
    };

    const cancelEdit = () => {
        setEditingScore(null);
        setEditForm({ title: '', author: '', musicalStyle: '' });
    };

    const updateScore = async (scoreId) => {
        try {
            await axiosInstance.put(`/api/scores/${scoreId}`, editForm);
            showAlert('Success', 'Score updated successfully!', 'success');
            setEditingScore(null);
            fetchScores();
        } catch (error) {
            showAlert('Update Error', 'Error updating score: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const openDeleteModal = (score) => {
        setDeleteModal({ isOpen: true, score });
    };

    const downloadPdf = async (scoreId, title) => {
        try {
            const response = await axiosInstance.get(`/api/scores/pdf/${scoreId}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `score-${title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (error.response?.status === 403) {
                showAlert('Access Denied', 'You do not have permission to download this PDF', 'error');
            } else {
                showAlert('Download Error', 'Error downloading PDF: ' + (error.response?.data?.message || error.message), 'error');
            }
        }
    };

    const viewPdf = async (scoreId, title) => {
        try {
            const response = await axiosInstance.get(`/api/scores/pdf/${scoreId}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (error) {
            if (error.response?.status === 403) {
                showAlert('Access Denied', 'You do not have permission to view this PDF', 'error');
            } else {
                showAlert('View Error', 'Error viewing PDF: ' + (error.response?.data?.message || error.message), 'error');
            }
        }
    };

    if (!authToken) {
        return (
            <div className="minecraft-loading">
                <p>🔐 Please log in to view scores</p>
            </div>
        );
    }

    if (loading) return (
        <div className="minecraft-loading">
            <p>⛏️ Loading scores...</p>
        </div>
    );

    return (
        <div className="minecraft-container">
            <h2>📜 My Scores</h2>
            
            {filteredScores.length === 0 ? (
                <div className="minecraft-empty">
                    <p>No scores in the chest!</p>
                    {scores.length === 0 && (
                        <p style={{ fontSize: '0.6em', marginTop: '10px' }}>
                            Go to "Upload Score" to add the first one
                        </p>
                    )}
                </div>
            ) : (
                <div className="minecraft-grid">
                    {filteredScores.map(score => (
                        <div key={score.id} className="minecraft-item">
                            <div className="item-header">
                                {editingScore === score.id ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                            placeholder="Title"
                                            className="minecraft-input"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.author}
                                            onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                                            placeholder="Author"
                                            className="minecraft-input"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.musicalStyle}
                                            onChange={(e) => setEditForm({...editForm, musicalStyle: e.target.value})}
                                            placeholder="Musical Style"
                                            className="minecraft-input"
                                        />
                                    </div>
                                ) : (
                                    <h3>🎵 {score.title || 'No Title'}</h3>
                                )}
                            </div>
                            
                            <div className="item-details">
                                {editingScore === score.id ? (
                                    <div className="edit-actions">
                                        <button 
                                            onClick={() => updateScore(score.id)}
                                            className="minecraft-button save-btn"
                                        >
                                            💾 Save
                                        </button>
                                        <button 
                                            onClick={cancelEdit}
                                            className="minecraft-button cancel-btn"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p>✍️ <strong>Author:</strong> {score.author || 'Unknown'}</p>
                                        <p>🎼 <strong>Style:</strong> {score.musicalStyle || 'Not specified'}</p>
                                        <p>📦 <strong>Size:</strong> {score.fileSize ? `${(score.fileSize / 1024).toFixed(0)} KB` : 'Unknown'}</p>
                                    </>
                                )}
                            </div>
                            
                            <div className="item-actions">
                                {editingScore !== score.id && (
                                    <>
                                        <button 
                                            onClick={() => viewPdf(score.id, score.title)}
                                            className="minecraft-button view-btn"
                                        >
                                            👀 View
                                        </button>
                                        <button 
                                            onClick={() => downloadPdf(score.id, score.title)}
                                            className="minecraft-button download-btn"
                                        >
                                            ⬇️ Download
                                        </button>
                                        <button 
                                            onClick={() => startEdit(score)}
                                            className="minecraft-button edit-btn"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            onClick={() => openDeleteModal(score)}
                                            className="minecraft-button delete-btn"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="reload-section">
                <button 
                    onClick={fetchScores}
                    className="minecraft-button reload-btn"
                >
                    🔄 Refresh List
                </button>
            </div>

            <MinecraftModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="🗑️ Delete Score"
                message={`Are you sure you want to delete "${deleteModal.score?.title}"? This action cannot be undone.`}
                type="danger"
            />

            <MinecraftAlert
                isOpen={alert.isOpen}
                onClose={() => setAlert({ ...alert, isOpen: false })}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
};

export default PdfList;