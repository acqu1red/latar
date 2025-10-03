import React, { useEffect, useState } from 'react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (area: number) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [area, setArea] = useState('12');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setArea('12');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(area.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError('Введите корректную площадь');
      return;
    }
    onSubmit(parsed);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>Добавить комнату</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ✖
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label htmlFor="room-area" className="modal-label">
            Площадь (м²)
          </label>
          <input
            id="room-area"
            type="number"
            min="1"
            step="0.5"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className="modal-input"
          />
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="toolbar-button ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="toolbar-button primary">
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;
