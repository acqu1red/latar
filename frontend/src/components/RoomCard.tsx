import React, { useState, useEffect } from 'react';
import type { RoomState } from '../lib/api';

interface RoomCardProps {
    room: RoomState;
    onUpdate: (key: string, updates: Partial<RoomState>) => void;
    submitted: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onUpdate, submitted }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onUpdate(room.key, { file });
    };

    useEffect(() => {
        if (room.file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(room.file);
        } else {
            setPreviewUrl(null);
        }
    }, [room.file]);
    
    const showError = submitted && room.enabled && (room.sqm <= 0 || !room.file);

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
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <span style={{ marginRight: '8px', color: '#4a5568' }}>Включить</span>
                    <input 
                        type="checkbox" 
                        checked={room.enabled} 
                        onChange={e => onUpdate(room.key, { enabled: e.target.checked })} 
                        style={{ height: '20px', width: '20px' }}
                    />
                </label>
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
                                Фотография комнаты
                            </label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ width: '100%' }}
                            />
                             {submitted && !room.file && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>Загрузите фото</p>}
                        </div>
                    </div>
                    {previewUrl && (
                        <div style={{ marginTop: '16px' }}>
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomCard;
