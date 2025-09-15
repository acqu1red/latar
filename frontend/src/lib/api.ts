import { API_BASE_URL } from '../config';

// Defining shared types for the application
export interface RoomState {
    key: string;
    name: string;
    sqm: number;
    enabled: boolean;
    file: File[];
    description?: string; // Room description for UI
}

// Новые типы для детального анализа
export interface WallPoint {
    x: number; // относительная позиция на стене (0-1)
    y: number; // относительная позиция на стене (0-1)
}

export interface Wall {
    side: 'left' | 'right' | 'top' | 'bottom';
    startPoint: WallPoint;
    endPoint: WallPoint;
    hasWindow: boolean;
    windowPosition?: number; // позиция окна на стене (0-1)
    windowLength?: number; // длина окна относительно стены (0-1)
    hasDoor: boolean;
    doorPosition?: number; // позиция двери на стене (0-1)
    doorLength?: number; // длина двери относительно стены (0-1)
    doorType?: 'entrance' | 'interior';
    connectedRoom?: string; // ключ комнаты, к которой ведет дверь
}

export interface RoomShape {
    type: 'rectangle' | 'l_shape' | 'u_shape' | 'irregular';
    corners: WallPoint[]; // контрольные точки формы комнаты (минимум 3)
    mainDimensions: {
        width: number; // ширина в метрах
        height: number; // высота в метрах
    };
}

export interface DetailedRoomAnalysis {
    key: string;
    name: string;
    sqm: number;
    shape: RoomShape;
    walls: Wall[];
    objects: any[]; // мебель
    roomConnections: string[]; // ключи комнат, с которыми соединена данная комната
}

export type BathroomType = 'combined' | 'separate';

export interface BathroomConfig {
    type: BathroomType;
    bathroom: RoomState;
    toilet: RoomState;
}

export interface ApiResponse {
    ok: boolean;
    mode?: 'svg' | 'image';
    svgDataUrl?: string;
    pngDataUrl?: string;
    totalSqm?: number;
    rooms?: any[];
    error?: string;
}

export async function generatePlan(rooms: RoomState[], bathroomConfig?: any): Promise<ApiResponse> {
    const formData = new FormData();

    const enabledRooms = rooms.filter(r => r.enabled && r.sqm > 0 && r.file.length > 0);
    
    const roomsJson = enabledRooms.map(({ file, ...rest }) => rest);
    formData.append('roomsJson', JSON.stringify(roomsJson));
    if (bathroomConfig) {
        formData.append('bathroomConfig', JSON.stringify(bathroomConfig));
    }

    enabledRooms.forEach(room => {
        if (room.file) {
            room.file.forEach(f => {
                formData.append(`photo_${room.key}`, f);
            });
        }
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-plan`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
            return { ok: false, error: errorData.error || `Request failed with status ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return { ok: false, error: 'Failed to connect to the server. Please check your network connection.' };
    }
}
