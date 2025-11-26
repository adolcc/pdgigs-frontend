import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import MinecraftModal from './MinecraftModal';
import MinecraftAlert from './MinecraftAlert';

const AdminPdfList = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, score: null });
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            console.log('📡 Fetching ALL scores from admin endpoint...');
            const response = await axiosInstance.get('/admin/scores');
            console.log('✅ All scores loaded:', response.data);
            setScores(response.data);
        } catch (error) {
            console.error('❌ Error fetching all scores:', error);
            console.error('❌ Error details:', error.response?.data);
            showAlert('Error', 'Error loading scores: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (title, message, type = 'info') => {
        setAlert({ isOpen: true, title, message, type });
    };

    const downloadPdf = async (scoreId, title) => {
        try {
            console.log('⬇️ Starting download for score:', scoreId);
            const response = await axiosInstance.get(`/api/scores/${scoreId}/download`, {
                responseType: 'blob'
            });

            console.log('✅ Download response received');
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `score-${title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            console.log('✅ PDF download completed');
            
        } catch (error) {
            console.error('❌ Error downloading PDF:', error);
            showAlert('Download Error', 'Error downloading PDF: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const viewPdf = async (scoreId, title) => {
        try {
            console.log('👀 Starting view for score:', scoreId);
            const response = await axiosInstance.get(`/api/scores/pdf/${scoreId}`, {
                responseType: 'blob'
            });

            console.log('✅ View response received');
            
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
            
            console.log('✅ PDF opened in new tab');
            
        } catch (error) {
            console.error('❌ Error viewing PDF:', error);
            showAlert('View Error', 'Error viewing PDF: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const openDeleteModal = (score) => {
        setDeleteModal({ isOpen: true, score });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, score: null });
    };

    const confirmDelete = async () => {
        const { score } = deleteModal;
        if (!score) return;

        try {
            console.log('🗑️ Deleting score as admin:', score.id);
            await axiosInstance.delete(`/admin/scores/${score.id}`);
            
            console.log('✅ Score deleted by admin');
            showAlert('Success', `"${score.title}" deleted successfully!`, 'success');
            
            closeDeleteModal();
            fetchScores();
            
        } catch (error) {
            console.error('❌ Error deleting score:', error);
            showAlert('Delete Error', 'Error deleting score: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    if (loading) return (
        <div className="minecraft-loading">
            <p>⛏️ Loading all scores from all users...</p>
        </div>
    );

    return (
        <div className="minecraft-container">
            <h2>📜 All System Scores (Admin View)</h2>
            <p style={{ fontSize: '0.7em', marginBottom: '20px' }}>
                Administrative view - You can delete any score in the system
            </p>
            
            {scores.length === 0 ? (
                <div className="minecraft-empty">
                    <p>No scores in the entire system!</p>
                </div>
            ) : (
                <div className="minecraft-grid">
                    {scores.map(score => (
                        <div key={score.id} className="minecraft-item">
                            <div className="item-header">
                                <h3>🎵 {score.title || 'No Title'}</h3>
                            </div>
                            <div className="item-details">
                                <p>✍️ <strong>Author:</strong> {score.author || 'Unknown'}</p>
                                <p>🎼 <strong>Style:</strong> {score.musicalStyle || 'Not specified'}</p>
                                <p>📦 <strong>Size:</strong> {score.fileSize ? `${(score.fileSize / 1024).toFixed(0)} KB` : 'Unknown'}</p>
                                <p>👤 <strong>Uploaded by:</strong> {score.userEmail || score.userId || 'Unknown user'}</p>
                            </div>
                            
                            <div className="item-actions">
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
                                    onClick={() => openDeleteModal(score)}
                                    className="minecraft-button delete-btn"
                                >
                                    🗑️ Delete
                                </button>
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

            {/* Modal de confirmación para eliminar */}
            <MinecraftModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="🗑️ Delete Score (Admin)"
                message={`Are you sure you want to delete "${deleteModal.score?.title}"? This action cannot be undone and will affect all users.`}
                type="danger"
            />

            {/* Alertas personalizadas */}
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

export default AdminPdfList;