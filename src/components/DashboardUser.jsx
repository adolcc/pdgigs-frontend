import React, { useState } from 'react';
import UploadPdf from './UploadPdf';
import PdfList from './PdfList';

const DashboardUser = () => {
    const [activeSection, setActiveSection] = useState('list');
    
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = (uploadedData) => {
        
        setActiveSection('list');
      
        setRefreshKey(k => k + 1);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🎵 My Sheet Music Library</h1>
            
            <div className="minecraft-nav" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button 
                    className={`minecraft-button ${activeSection === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveSection('list')}
                    style={{ marginRight: '10px' }}
                >
                    📚 My Scores
                </button>
                <button 
                    className={`minecraft-button ${activeSection === 'upload' ? 'active' : ''}`}
                    onClick={() => setActiveSection('upload')}
                >
                    📤 Upload New
                </button>
            </div>
            
            {activeSection === 'upload' && (
                <section>
                    <h2>📤 Upload New Score</h2>
                    <UploadPdf onUploadSuccess={handleUploadSuccess} />
                </section>
            )}
            
            {activeSection === 'list' && (
                <section>
                    <h2>📚 My Scores</h2>
                    <PdfList refreshKey={refreshKey} />
                </section>
            )}
        </div>
    );
};

export default DashboardUser;