import React, { useState } from 'react';
import CreatePdf from './CreatePdf';
import PdfList from './PdfList';

const DashboardUser = () => {
    const [activeSection, setActiveSection] = useState('list');

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
                    <CreatePdf onUploadSuccess={() => setActiveSection('list')} />
                </section>
            )}
            
            {activeSection === 'list' && (
                <section>
                    <h2>📚 My Scores</h2>
                    <PdfList />
                </section>
            )}
        </div>
    );
};

export default DashboardUser;