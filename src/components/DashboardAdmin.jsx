// src/components/DashboardAdmin.jsx
import React from 'react';
import CreatePdf from './CreatePdf';
import PdfList from './PdfList';

const DashboardAdmin = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>⚒️ Panel de Administración - PDGIGS</h1>
            
            {/* Sección para crear PDFs */}
            <section style={{ marginBottom: '40px' }}>
                <h2>📤 Subir Nueva Partitura</h2>
                <CreatePdf />
            </section>
            
            {/* Sección para listar PDFs existentes */}
            <section>
                <h2>📚 Partituras en el Cofre</h2>
                <PdfList />
            </section>
        </div>
    );
};

export default DashboardAdmin;