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
        const files = e.target.files ? Array.from(e.target.files) : [];
        onUpdate(room.key, { file: files });
    };

    useEffect(() => {
        if (room.file && room.file.length > 0) {
            const newUrls: string[] = [];
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
        <div style={{ 
            border: `2px solid ${showError ? '#e53e3e' : '#e2e8f0'}`,
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '16px',
            backgroundColor: room.enabled ? '#fff' : '#f7fafc',
            transition: 'all 0.2s'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>{room.name}</h3>
                {room.key !== 'hallway' && (
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <span style={{ marginRight: '8px', color: '#4a5568' }}>Включить</span>
                        <input 
                            type="checkbox" 
                            checked={room.enabled} 
                            onChange={e => onUpdate(room.key, { enabled: e.target.checked })} 
                            style={{ height: '20px', width: '20px' }}
                        />
                    </label>
                )}
            </div>
            
            {room.enabled && (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568' }}>
                                Площадь (м²)
                            </label>
                            <input 
                                type="number"
                                step="0.1"
                                min="0"
                                value={room.sqm}
                                onChange={e => onUpdate(room.key, { sqm: parseFloat(e.target.value) || 0 })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${submitted && room.sqm <= 0 ? '#e53e3e' : '#cbd5e0'}` }}
                            />
                             {submitted && room.sqm <= 0 && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>Укажите площадь</p>}
                        </div>
                        <div style={{ flex: 2 }}>
                             <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568' }}>
                                Фотографии комнаты (можно несколько)
                            </label>
                            <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                style={{ width: '100%' }}
                            />
                             {submitted && room.file.length === 0 && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>Загрузите фото</p>}
                        </div>
                    </div>
                    {previewUrls.length > 0 && (
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {previewUrls.map((url, index) => (
                                <img key={index} src={url} alt={`Preview ${index + 1}`} style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '4px', objectFit: 'cover' }} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomCard;
