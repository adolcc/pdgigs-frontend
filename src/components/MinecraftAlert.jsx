import React from 'react';

const MinecraftAlert = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'save-btn';
            case 'error':
                return 'delete-btn';
            case 'warning':
                return 'demote-btn';
            default:
                return 'view-btn';
        }
    };

    return (
        <div className="minecraft-modal-overlay">
            <div className="minecraft-modal">
                <div className="minecraft-modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="minecraft-modal-body">
                    <p>{message}</p>
                </div>
                <div className="minecraft-modal-actions">
                    <button 
                        onClick={onClose}
                        className={`minecraft-button ${getButtonColor()}`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MinecraftAlert;