import { API_BASE_URL } from '../config';

export interface RoomState {
    key: string;
    name: string;
    sqm: number;
    enabled: boolean;
    file: File | null;
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

export async function generatePlan(rooms: RoomState[]): Promise<ApiResponse> {
    const formData = new FormData();

    const enabledRooms = rooms.filter(r => r.enabled && r.sqm > 0 && r.file);
    
    const roomsJson = enabledRooms.map(({ file, ...rest }) => rest);
    formData.append('roomsJson', JSON.stringify(roomsJson));

    enabledRooms.forEach(room => {
        if (room.file) {
            formData.append(`photo_${room.key}`, room.file);
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
