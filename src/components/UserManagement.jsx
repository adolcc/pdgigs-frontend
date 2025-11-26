import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import MinecraftModal from './MinecraftModal';
import MinecraftAlert from './MinecraftAlert';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState({ 
        isOpen: false, 
        type: '', 
        user: null 
    });
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            console.log('📡 Fetching users from admin endpoint...');
            const response = await axiosInstance.get('/admin/users');
            console.log('✅ Users loaded:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            console.error('❌ Error details:', error.response?.data);
            showAlert('Error', 'Error loading users: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (title, message, type = 'info') => {
        setAlert({ isOpen: true, title, message, type });
    };

    const openActionModal = (user, type) => {
        setActionModal({ isOpen: true, type, user });
    };

    const closeActionModal = () => {
        setActionModal({ isOpen: false, type: '', user: null });
    };

    const promoteUser = async (userId) => {
        try {
            console.log('⬆️ Promoting user to admin:', userId);
            const response = await axiosInstance.put(`/admin/users/${userId}/role`, {
                role: 'ROLE_ADMIN' 
            });
            
            console.log('✅ User promoted:', response.data);
            showAlert('Success', 'User promoted to admin successfully!', 'success');
            fetchUsers();
            
        } catch (error) {
            console.error('❌ Error promoting user:', error);
            showAlert('Promotion Error', 'Error promoting user: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const demoteUser = async (userId) => {
        try {
            console.log('⬇️ Demoting admin to user:', userId);
            const response = await axiosInstance.put(`/admin/users/${userId}/role`, {
                role: 'ROLE_USER'  
            });
            
            console.log('✅ User demoted:', response.data);
            showAlert('Success', 'Admin demoted to user successfully!', 'success');
            fetchUsers();
            
        } catch (error) {
            console.error('❌ Error demoting user:', error);
            showAlert('Demotion Error', 'Error demoting user: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const deleteUser = async (userId) => {
        try {
            console.log('🗑️ Deleting user:', userId);
            await axiosInstance.delete(`/admin/users/${userId}`);
            
            console.log('✅ User deleted');
            showAlert('Success', 'User deleted successfully!', 'success');
            fetchUsers();
            
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            showAlert('Delete Error', 'Error deleting user: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const confirmAction = () => {
        const { user, type } = actionModal;
        if (!user) return;

        switch (type) {
            case 'promote':
                promoteUser(user.id);
                break;
            case 'demote':
                demoteUser(user.id);
                break;
            case 'delete':
                deleteUser(user.id);
                break;
            default:
                break;
        }
        closeActionModal();
    };

    const getModalConfig = () => {
        const { user, type } = actionModal;
        if (!user) return { title: '', message: '' };

        switch (type) {
            case 'promote':
                return {
                    title: '⬆️ Promote to Admin',
                    message: `Are you sure you want to promote "${user.name || user.email}" to Administrator? They will have full access to the admin panel.`,
                    buttonText: '✅ Promote'
                };
            case 'demote':
                return {
                    title: '⬇️ Demote to User',
                    message: `Are you sure you want to demote "${user.name || user.email}" from Administrator to regular User? They will lose admin privileges.`,
                    buttonText: '⬇️ Demote'
                };
            case 'delete':
                return {
                    title: '🗑️ Delete User',
                    message: `Are you sure you want to permanently delete user "${user.name || user.email}"? This action cannot be undone and will delete all their scores.`,
                    buttonText: '🗑️ Delete'
                };
            default:
                return { title: '', message: '' };
        }
    };

    const getAdminCount = () => {
        return users.filter(user => user.role === 'ROLE_ADMIN').length;  
    };

    const canModifyAdmin = (user) => {
        if (user.role === 'ROLE_ADMIN' && getAdminCount() <= 1) {  
            return false;
        }
        return true;
    };

    if (loading) return (
        <div className="minecraft-loading">
            <p>⛏️ Loading users...</p>
        </div>
    );

    const modalConfig = getModalConfig();

    return (
        <div className="minecraft-container">
            <h2>👥 User Management</h2>
            <p style={{ fontSize: '0.7em', marginBottom: '20px' }}>
                Manage user roles and accounts in the system
            </p>
            
            {users.length === 0 ? (
                <div className="minecraft-empty">
                    <p>No users in the system!</p>
                </div>
            ) : (
                <div className="minecraft-table">
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-dirt)' }}>
                                <th style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.8em', width: '20%', textAlign: 'center' }}>Username</th>
                                <th style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.8em', width: '30%', textAlign: 'center' }}>Email</th>
                                <th style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.8em', width: '15%', textAlign: 'center' }}>Role</th>
                                <th style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.8em', width: '35%', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ backgroundColor: 'var(--color-stone)' }}>
                                    <td style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.7em', textAlign: 'center' }}>
                                        {user.name || user.username || 'No name'}
                                    </td>
                                    <td style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.7em', textAlign: 'center' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.7em', textAlign: 'center' }}>
                                        <span className={`role-badge ${user.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                                            {user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                                        </span>
                                    </td>
                                    <td style={{ border: '2px solid var(--color-text-dark)', padding: '10px', fontSize: '0.7em', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            {/* Botón promover - solo para usuarios normales */}
                                            {user.role === 'ROLE_USER' && (  
                                                <button
                                                    onClick={() => openActionModal(user, 'promote')}
                                                    className="minecraft-button promote-btn"
                                                    style={{ fontSize: '0.6em', padding: '5px 8px' }}
                                                >
                                                    ⬆️ Admin
                                                </button>
                                            )}
                                            
                                            {/* Botón degradar - solo para admins y no el último admin */}
                                            {user.role === 'ROLE_ADMIN' && (  
                                                <button
                                                    onClick={() => openActionModal(user, 'demote')}
                                                    className="minecraft-button demote-btn"
                                                    style={{ fontSize: '0.6em', padding: '5px 8px' }}
                                                    disabled={!canModifyAdmin(user)}
                                                >
                                                    ⬇️ User
                                                </button>
                                            )}
                                            
                                            {/* Botón eliminar - no permitir eliminar el último admin */}
                                            <button
                                                onClick={() => openActionModal(user, 'delete')}
                                                className="minecraft-button delete-btn"
                                                style={{ fontSize: '0.6em', padding: '5px 8px' }}
                                                disabled={!canModifyAdmin(user)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Estadísticas */}
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'var(--color-dirt)', border: '2px solid var(--color-text-dark)' }}>
                <p style={{ fontSize: '0.7em', margin: 0 }}>
                    📊 <strong>Statistics:</strong> {getAdminCount()} Admin(s) • {users.filter(u => u.role === 'ROLE_USER').length} User(s) • Total: {users.length}
                </p>
            </div>

            <div className="reload-section">
                <button 
                    onClick={fetchUsers}
                    className="minecraft-button reload-btn"
                >
                    🔄 Refresh List
                </button>
            </div>

            {/* Modal de confirmación para acciones */}
            <MinecraftModal
                isOpen={actionModal.isOpen}
                onClose={closeActionModal}
                onConfirm={confirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                type={actionModal.type === 'delete' ? 'danger' : 'warning'}
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

export default UserManagement;