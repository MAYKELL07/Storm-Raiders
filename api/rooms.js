// Vercel Serverless Function for Room Management
// This acts as a simple in-memory database for multiplayer rooms

// In-memory storage (note: resets when function cold-starts)
// For production, use a real database like Vercel KV, Redis, or MongoDB
let rooms = {};

// Clean up old rooms (older than 24 hours)
function cleanupOldRooms() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    Object.keys(rooms).forEach(code => {
        if (now - rooms[code].createdAt > maxAge) {
            delete rooms[code];
        }
    });
}

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    cleanupOldRooms();

    const { method } = req;
    const { action, roomCode, roomData } = req.body || {};
    const queryCode = req.query.code;

    try {
        switch (method) {
            case 'GET':
                // Get room by code
                if (queryCode) {
                    const room = rooms[queryCode];
                    if (room) {
                        return res.status(200).json({ success: true, room });
                    } else {
                        return res.status(404).json({ success: false, error: 'Room not found' });
                    }
                }
                // List all active rooms
                return res.status(200).json({ success: true, rooms: Object.keys(rooms) });

            case 'POST':
                if (action === 'create') {
                    // Create new room
                    rooms[roomData.code] = roomData;
                    return res.status(201).json({ success: true, room: roomData });
                } else if (action === 'update') {
                    // Update existing room
                    if (rooms[roomCode]) {
                        rooms[roomCode] = { ...rooms[roomCode], ...roomData };
                        return res.status(200).json({ success: true, room: rooms[roomCode] });
                    } else {
                        return res.status(404).json({ success: false, error: 'Room not found' });
                    }
                } else if (action === 'join') {
                    // Join existing room
                    if (rooms[roomCode]) {
                        return res.status(200).json({ success: true, room: rooms[roomCode] });
                    } else {
                        return res.status(404).json({ success: false, error: 'Room not found' });
                    }
                }
                break;

            case 'DELETE':
                // Delete room
                if (roomCode && rooms[roomCode]) {
                    delete rooms[roomCode];
                    return res.status(200).json({ success: true });
                }
                return res.status(404).json({ success: false, error: 'Room not found' });

            default:
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
