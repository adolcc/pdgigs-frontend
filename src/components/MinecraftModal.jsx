import React from 'react';

const MinecraftModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    const getButtonColors = () => {
        switch (type) {
            case 'danger':
                return { confirm: 'delete-btn', cancel: 'cancel-btn' };
            case 'warning':
                return { confirm: 'demote-btn', cancel: 'cancel-btn' };
            default:
                return { confirm: 'save-btn', cancel: 'cancel-btn' };
        }
    };

    const buttonColors = getButtonColors();

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
                    {onConfirm && (
                        <button 
                            onClick={onConfirm}
                            className={`minecraft-button ${buttonColors.confirm}`}
                        >
                            ✅ Confirm
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className={`minecraft-button ${buttonColors.cancel}`}
                    >
                        ❌ Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MinecraftModal;