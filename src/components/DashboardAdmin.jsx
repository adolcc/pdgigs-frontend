import React, { useState } from 'react';
import AdminPdfList from './AdminPdfList';
import UserManagement from './UserManagement';
import LogoutButton from './LogoutButton';

const DashboardAdmin = () => {
    const [activeSection, setActiveSection] = useState('scores');

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h1 style={{ margin: 0 }}>⚒️ Administration Panel</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <LogoutButton />
                </div>
            </div>

            <div className="minecraft-nav" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button 
                    className={`minecraft-button ${activeSection === 'scores' ? 'active' : ''}`}
                    onClick={() => setActiveSection('scores')}
                    style={{ marginRight: '10px' }}
                >
                    📚 Manage Scores
                </button>
                <button 
                    className={`minecraft-button ${activeSection === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveSection('users')}
                >
                    👥 Manage Users
                </button>
            </div>
            
            {activeSection === 'scores' && (
                <section>
                    <h2>📚 All System Scores</h2>
                    <AdminPdfList />
                </section>
            )}
            
            {activeSection === 'users' && (
                <section>
                    <h2>👥 User Management</h2>
                    <UserManagement />
                </section>
            )}
        </div>
    );
};

export default DashboardAdmin;