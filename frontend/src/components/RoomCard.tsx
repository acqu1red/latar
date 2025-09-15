import React, { useState, useEffect } from 'react';
import type { RoomState } from '../lib/api';

interface RoomCardProps {
  room: RoomState;
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
  submitted: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onUpdate, submitted }) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) as File[] : [];
        onUpdate(room.key, { file: files });
    };

    const handleRemoveFile = (indexToRemove: number) => {
        if (!room.file) return;
        const nextFiles = room.file.filter((_, idx) => idx !== indexToRemove);
        onUpdate(room.key, { file: nextFiles });
    };

    const handleClearFiles = () => {
        onUpdate(room.key, { file: [] });
    };


    useEffect(() => {
        if (room.file && room.file.length > 0) {
            const filePromises = room.file.map(f => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(f);
                });
            });

            Promise.all(filePromises).then(urls => {
                setPreviewUrls(urls);
            });
            
        } else {
            setPreviewUrls([]);
        }
    }, [room.file]);

    
    const showError = submitted && room.enabled && (room.sqm <= 0 || room.file.length === 0);

    return (
        <div className={`room-card ${room.enabled ? 'enabled' : 'disabled'} ${showError ? 'error' : ''}`}>
            <div className="room-card-header">
                <div>
                    <h3>{room.name}</h3>
                    {room.description && <p className="room-description">{room.description}</p>}
                </div>
                {room.key !== 'hallway' && (
                    <label className="toggle-switch">
                        <span className="toggle-switch-label">Включить</span>
                        <input 
                            type="checkbox" 
                            className="toggle-switch-input"
                            checked={room.enabled} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(room.key, { enabled: e.target.checked })} 
                        />
                        <span className="toggle-switch-slider"></span>
                    </label>
                )}
            </div>
            
            {room.enabled && (
                <div className="room-content">
                    <div className="room-content-grid">
                        <div className="form-group">
                            <label className="form-label">
                                Площадь (м²)
                            </label>
                            <input 
                                type="number"
                                step="0.1"
                                min="0"
                                value={room.sqm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(room.key, { sqm: parseFloat(e.target.value) || 0 })}
                                className={`form-input ${submitted && room.sqm <= 0 ? 'error' : ''}`}
                            />
                            {submitted && room.sqm <= 0 && <p className="error-text">Укажите площадь</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Фотографии комнаты (можно несколько)
                            </label>
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="file-input"
                                    id={`file-${room.key}`}
                                />
                                <label htmlFor={`file-${room.key}`} className="file-input-button">
                                    📸 Выбрать фото
                                </label>
                            </div>
                            {room.file && room.file.length > 0 && (
                                <button type="button" className="clear-files-btn" onClick={handleClearFiles}>
                                    Очистить все
                                </button>
                            )}
                            {submitted && room.file.length === 0 && <p className="error-text">Загрузите фото</p>}
                        </div>
                        
                    </div>
                    
                    {previewUrls.length > 0 && (
                        <div className="preview-grid">
                            {previewUrls.map((url: string, index: number) => (
                                <div key={index} className="preview-item">
                                    <img 
                                        src={url} 
                                        alt={`Preview ${index + 1}`} 
                                        className="preview-image"
                                    />
                                    <button
                                        type="button"
                                        className="preview-remove"
                                        onClick={() => handleRemoveFile(index)}
                                        aria-label="Удалить фото"
                                        title="Удалить фото"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomCard;
