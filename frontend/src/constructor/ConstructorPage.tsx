import React, { useCallback, useReducer, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';
import './ConstructorPage.css';
import Toolbar from './components/Toolbar';
import RoomModal from './components/RoomModal';
import GridCanvas from './components/GridCanvas';
import { constructorReducer, initialState, createRoom } from './state';
import { ConstructorState, RoomPhoto, Tool, Wall } from './types';
import { generateId } from './utils';

const DEFAULT_ROOM_POSITION = { x: 4, y: 4 };

const buildPayload = (state: ConstructorState) => {
  const wallsById = state.walls.reduce<Record<string, { id: string; nodes: Wall['nodes'] }>>(
    (acc, wall) => {
      acc[wall.id] = { id: wall.id, nodes: wall.nodes };
      return acc;
    },
    {},
  );

  return {
    rooms: state.rooms.map((room) => {
      const roomWalls = state.walls.filter((wall) => wall.roomId === room.id);
      const relatedWindows = state.windows.filter((item) => item.roomId === room.id);
      const relatedDoors = state.doors.filter((item) => item.roomId === room.id);

      return {
        id: room.id,
        label: room.label,
        area: room.area,
        length: room.length,
        width: room.width,
        position: room.position,
        vectors: roomWalls.map((wall) => ({
          id: wall.id,
          nodes: wall.nodes,
        })),
        windows: relatedWindows
          .filter((window) => window.wallId && window.segmentIndex !== null)
          .map((window) => ({
            id: window.id,
            wallId: window.wallId,
            segmentIndex: window.segmentIndex,
            offset: window.offset,
            length: window.length,
            rotation: window.rotation,
          })),
        doors: relatedDoors
          .filter((door) => door.wallId && door.segmentIndex !== null)
          .map((door) => ({
            id: door.id,
            wallId: door.wallId,
            segmentIndex: door.segmentIndex,
            offset: door.offset,
            rotation: door.rotation,
          })),
        photos: room.photos.map((photo) => photo.url),
      };
    }),
    detachedWalls: state.walls
      .filter((wall) => !wall.roomId)
      .map((wall) => ({ id: wall.id, nodes: wall.nodes })),
    windows: state.windows
      .filter((window) => window.wallId && window.segmentIndex !== null)
      .map((window) => ({
        id: window.id,
        wallId: window.wallId,
        roomId: window.roomId,
        segmentIndex: window.segmentIndex,
        offset: window.offset,
        length: window.length,
        rotation: window.rotation,
      })),
    doors: state.doors
      .filter((door) => door.wallId && door.segmentIndex !== null)
      .map((door) => ({
        id: door.id,
        wallId: door.wallId,
        roomId: door.roomId,
        segmentIndex: door.segmentIndex,
        offset: door.offset,
        rotation: door.rotation,
      })),
    floatingWindows: state.floatingWindows,
    floatingDoors: state.floatingDoors,
    wallsById,
  };
};

const ConstructorPage: React.FC = () => {
  const [state, dispatch] = useReducer(constructorReducer, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingPhotoRoomId, setPendingPhotoRoomId] = useState<string | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 2400);
  }, []);

  const handleSelectTool = useCallback((tool: Tool) => {
    dispatch({ type: 'SET_TOOL', tool });
  }, []);

  const closeRoomModal = useCallback(() => {
    setIsModalOpen(false);
    dispatch({ type: 'SET_TOOL', tool: 'select' });
  }, [dispatch]);

  const handleAddRoom = useCallback(() => {
    dispatch({ type: 'SET_TOOL', tool: 'room' });
    setIsModalOpen(true);
  }, [dispatch]);

  const handleCreateRoom = useCallback(
    (area: number) => {
      closeRoomModal();
      const room = createRoom(area, DEFAULT_ROOM_POSITION);
      dispatch({ type: 'ADD_ROOM', room });
    },
    [closeRoomModal, dispatch],
  );

  const handleSaveLayout = useCallback(async () => {
    const payload = buildPayload(state);
    try {
      const response = await fetch(`${API_BASE_URL}/save-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutId: generateId(), payload }),
      });
      if (!response.ok) {
        throw new Error('Не удалось сохранить макет');
      }
      showNotification('Макет сохранен', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Ошибка при сохранении', 'error');
    }
  }, [state, showNotification]);

  const handleGeneratePlan = useCallback(async () => {
    const payload = buildPayload(state);
    dispatch({ type: 'SET_IS_GENERATING', value: true });
    try {
      const response = await fetch(`${API_BASE_URL}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Не удалось сгенерировать план');
      }
      const data = await response.json();
      dispatch({ type: 'SET_PLAN_IMAGE', url: data.imageUrl });
      showNotification('План готов', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Ошибка генерации', 'error');
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', value: false });
    }
  }, [state, showNotification]);

  const handleResetPlan = useCallback(() => {
    dispatch({ type: 'SET_PLAN_IMAGE', url: null });
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!state.planImageUrl) {
      return;
    }
    try {
      const [{ PDFDocument }, response] = await Promise.all([
        import('pdf-lib'),
        fetch(state.planImageUrl),
      ]);
      if (!response.ok) {
        throw new Error('Не удалось загрузить изображение');
      }
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const image = blob.type === 'image/png' ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plan.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showNotification('Не удалось создать PDF', 'error');
    }
  }, [showNotification, state.planImageUrl]);

  const handleUploadPhoto = useCallback(
    async (roomId: string, file: File) => {
      const formData = new FormData();
      formData.append('roomId', roomId);
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE_URL}/upload-photo`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Ошибка загрузки фото');
        }
        const data = (await response.json()) as RoomPhoto;
        dispatch({ type: 'UPSERT_PHOTO', roomId, photo: data });
        showNotification('Фото добавлено', 'success');
      } catch (error) {
        console.error(error);
        showNotification('Не удалось загрузить фото', 'error');
      }
    },
    [dispatch, showNotification],
  );

  const handleRequestPhoto = useCallback((roomId: string) => {
    setPendingPhotoRoomId(roomId);
    fileInputRef.current?.click();
  }, []);

  const handlePhotoInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && pendingPhotoRoomId) {
        handleUploadPhoto(pendingPhotoRoomId, file);
      }
      setPendingPhotoRoomId(null);
      if (event.target.value) {
        event.target.value = '';
      }
    },
    [handleUploadPhoto, pendingPhotoRoomId],
  );

  return (
    <div className="constructor-page">
      <Toolbar
        activeTool={state.activeTool}
        onSelectTool={handleSelectTool}
        onAddRoom={handleAddRoom}
        onSaveLayout={handleSaveLayout}
        onGeneratePlan={handleGeneratePlan}
        onResetPlan={handleResetPlan}
        isGenerating={state.isGenerating}
        hasPlan={Boolean(state.planImageUrl)}
        onShowNotification={showNotification}
      />

      <main className="constructor-content">
        <GridCanvas state={state} dispatch={dispatch} onRequestPhoto={handleRequestPhoto} onShowNotification={showNotification} />
        <aside className="constructor-preview">
          {state.planImageUrl ? (
            <div className="plan-preview">
              <img src={state.planImageUrl} alt="Готовый план" />
              <div className="plan-actions">
                <a href={state.planImageUrl} download="plan.png" className="toolbar-button primary">
                  Скачать PNG
                </a>
                <button type="button" className="toolbar-button ghost" onClick={handleDownloadPdf}>
                  Скачать PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="plan-placeholder">
              <span className="placeholder-icon">🧠</span>
              <p>Сгенерированный план появится здесь</p>
            </div>
          )}
        </aside>
      </main>

      <RoomModal isOpen={isModalOpen} onClose={closeRoomModal} onSubmit={handleCreateRoom} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden-input"
        onChange={handlePhotoInputChange}
      />

      {notification && (
        <div className={`toast ${notification.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ConstructorPage;
