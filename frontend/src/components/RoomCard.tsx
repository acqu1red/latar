import React, { useState, useEffect } from 'react';
import type { RoomState } from '../lib/api';

interface RoomCardProps {
    room: RoomState;
    onUpdate: (key: string, updates: Partial<RoomState>) => void;
    submitted: boolean;
    availableRooms?: RoomState[];
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onUpdate, submitted, availableRooms = [] }) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        onUpdate(room.key, { file: files });
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

    const handleConnectionToggle = (targetRoomKey: string) => {
        const connections = room.connections || [];
        const isConnected = connections.includes(targetRoomKey);
        
        if (isConnected) {
            onUpdate(room.key, { 
                connections: connections.filter(key => key !== targetRoomKey) 
            });
        } else {
            onUpdate(room.key, { 
                connections: [...connections, targetRoomKey] 
            });
        }
    };
    
    const showError = submitted && room.enabled && (room.sqm <= 0 || room.file.length === 0);

    return (
        <div className={`room-card ${room.enabled ? 'enabled' : 'disabled'} ${showError ? 'error' : ''}`}>
            <div className="room-card-header">
                <h3>{room.name}</h3>
                {room.key !== 'hallway' && (
                    <label className="toggle-switch">
                        <span className="toggle-switch-label">Включить</span>
                        <input 
                            type="checkbox" 
                            className="toggle-switch-input"
                            checked={room.enabled} 
                            onChange={e => onUpdate(room.key, { enabled: e.target.checked })} 
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
                                onChange={e => onUpdate(room.key, { sqm: parseFloat(e.target.value) || 0 })}
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
                            {submitted && room.file.length === 0 && <p className="error-text">Загрузите фото</p>}
                        </div>
                    </div>
                    
                    {/* Room Connections */}
                    <div className="form-group">
                        <label className="form-label">
                            Соединения с другими комнатами
                            <span className="form-hint">Укажите, с какими комнатами эта комната соединена (общие стены/двери)</span>
                        </label>
                        <div className="connections-grid">
                            {availableRooms
                                .filter(r => r.key !== room.key && r.enabled)
                                .map(targetRoom => {
                                    const isConnected = (room.connections || []).includes(targetRoom.key);
                                    return (
                                        <label key={targetRoom.key} className="connection-item">
                                            <input
                                                type="checkbox"
                                                checked={isConnected}
                                                onChange={() => handleConnectionToggle(targetRoom.key)}
                                            />
                                            <span>{targetRoom.name}</span>
                                        </label>
                                    );
                                })
                            }
                        </div>
                    </div>
                    {previewUrls.length > 0 && (
                        <div className="preview-grid">
                            {previewUrls.map((url, index) => (
                                <img 
                                    key={index} 
                                    src={url} 
                                    alt={`Preview ${index + 1}`} 
                                    className="preview-image"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomCard;
