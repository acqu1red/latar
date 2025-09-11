import { API_BASE_URL } from '../config';

// Defining shared types for the application
export interface RoomState {
    key: string;
    name: string;
    sqm: number;
    enabled: boolean;
    file: File[];
    connections?: string[]; // Keys of rooms this room connects to
    layout?: { x: number; y: number; width: number; height: number } | null; // normalized 0..1
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

export async function generatePlan(rooms: RoomState[], useImageMode: boolean = false, bathroomConfig?: any): Promise<ApiResponse> {
    const formData = new FormData();

    const enabledRooms = rooms.filter(r => r.enabled && r.sqm > 0 && r.file.length > 0);
    
    const roomsJson = enabledRooms.map(({ file, ...rest }) => rest);
    formData.append('roomsJson', JSON.stringify(roomsJson));
    formData.append('useImageMode', useImageMode.toString());
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
