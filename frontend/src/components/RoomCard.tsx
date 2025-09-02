import React, { useState, useEffect } from 'react';
import type { RoomState } from '../lib/api';
import styles from './RoomCard.module.css';
import UploadIcon from './UploadIcon';

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

    const cardClasses = `${styles.card} ${room.enabled ? styles.enabled : ''} ${showError ? styles.error : ''}`;

    return (
        <div className={cardClasses}>
            <div className={styles.cardHeader}>
                <h3 className={styles.roomName}>{room.name}</h3>
                {room.key !== 'hallway' && (
                    <label className={styles.toggle}>
                        <span className={styles.toggleLabel}>Включить</span>
                        <input 
                            type="checkbox" 
                            checked={room.enabled} 
                            onChange={e => onUpdate(room.key, { enabled: e.target.checked })} 
                            className={styles.checkbox}
                        />
                    </label>
                )}
            </div>
            
            <div className={styles.cardBody}>
                <div className={styles.inputsGrid}>
                    <div className={styles.inputGroup}>
                        <label htmlFor={`sqm-${room.key}`} className={styles.label}>
                            Площадь (м²)
                        </label>
                        <input 
                            id={`sqm-${room.key}`}
                            type="number"
                            step="0.1"
                            min="0"
                            value={room.sqm}
                            onChange={e => onUpdate(room.key, { sqm: parseFloat(e.target.value) || 0 })}
                            className={`${styles.input} ${submitted && room.sqm <= 0 ? styles.inputError : ''}`}
                        />
                         {submitted && room.sqm <= 0 && <p className={styles.errorMessage}>Укажите площадь</p>}
                    </div>
                    <div className={styles.inputGroup}>
                         <label htmlFor={`file-${room.key}`} className={styles.fileInputLabel}>
                            <UploadIcon />
                            {room.file.length > 0 ? `${room.file.length} фото выбрано` : 'Выберите фотографии'}
                        </label>
                        <input 
                            id={`file-${room.key}`}
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                         {submitted && room.file.length === 0 && <p className={styles.errorMessage}>Загрузите фото</p>}
                    </div>
                </div>
                {previewUrls.length > 0 && (
                    <div className={styles.previews}>
                        {previewUrls.map((url, index) => (
                            <img key={index} src={url} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomCard;
