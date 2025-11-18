// Multiplayer System using Vercel Serverless API for cross-device sync
// Falls back to localStorage for local testing

class MultiplayerManager {
    constructor() {
        this.currentRoom = null;
        this.playerId = this.generatePlayerId();
        this.playerName = '';
        this.updateInterval = null;
        this.lastKnownState = null;
        this.apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000/api/rooms'  // Local testing
            : '/api/rooms';  // Production on Vercel
        this.useLocalStorage = false; // Set to true for offline testing
        
        // Listen for storage events from other tabs/windows (localStorage fallback)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('room_') && this.currentRoom) {
                const roomKey = 'room_' + this.currentRoom.code;
                if (e.key === roomKey) {
                    // Room data changed in another tab
                    const room = this.loadRoomLocal(this.currentRoom.code);
                    if (room) {
                        this.currentRoom = room;
                        this.onRoomUpdate(room);
                    }
                }
            }
        });
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    createRoom(playerName, maxPlayers) {
        const roomCode = this.generateRoomCode();
        this.playerName = playerName;
        
        const room = {
            code: roomCode,
            hostId: this.playerId,
            maxPlayers: parseInt(maxPlayers),
            players: [{
                id: this.playerId,
                name: playerName,
                isHost: true,
                ready: false,
                ship: null
            }],
            gameState: null,
            status: 'lobby', // lobby, playing, finished
            createdAt: Date.now()
        };

        this.saveRoom(room);
        this.currentRoom = room;
        this.startPolling();
        
        return roomCode;
    }

    async joinRoom(roomCode, playerName) {
        const room = await this.loadRoom(roomCode);
        
        if (!room) {
            throw new Error('Room not found');
        }
        
        if (room.players.length >= room.maxPlayers) {
            throw new Error('Room is full');
        }
        
        if (room.status !== 'lobby') {
            throw new Error('Game already started');
        }

        // Check if player already in room
        const existingPlayer = room.players.find(p => p.id === this.playerId);
        if (!existingPlayer) {
            this.playerName = playerName;
            room.players.push({
                id: this.playerId,
                name: playerName,
                isHost: false,
                ready: false,
                ship: null
            });
            
            await this.saveRoom(room);
        }
        
        this.currentRoom = room;
        this.startPolling();
        
        return room;
    }

    leaveRoom() {
        if (!this.currentRoom) return;

        const room = this.loadRoom(this.currentRoom.code);
        if (!room) return;

        // Remove player from room
        room.players = room.players.filter(p => p.id !== this.playerId);

        // If host left, assign new host or delete room
        if (room.players.length === 0) {
            this.deleteRoom(room.code);
        } else if (room.hostId === this.playerId) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
            this.saveRoom(room);
        } else {
            this.saveRoom(room);
        }

        this.stopPolling();
        this.currentRoom = null;
    }

    updatePlayerReady(ready) {
        if (!this.currentRoom) return;

        const room = this.loadRoom(this.currentRoom.code);
        if (!room) return;

        const player = room.players.find(p => p.id === this.playerId);
        if (player) {
            player.ready = ready;
            this.saveRoom(room);
        }
    }

    startGame(gameState) {
        if (!this.currentRoom) return;

        const room = this.loadRoom(this.currentRoom.code);
        if (!room) return;

        room.status = 'playing';
        room.gameState = gameState;
        this.saveRoom(room);
    }

    updateGameState(gameState) {
        if (!this.currentRoom) return;

        const room = this.loadRoom(this.currentRoom.code);
        if (!room) return;

        room.gameState = gameState;
        room.lastUpdate = Date.now();
        this.saveRoom(room);
    }

    getGameState() {
        if (!this.currentRoom) return null;

        const room = this.loadRoom(this.currentRoom.code);
        return room ? room.gameState : null;
    }

    getRoom() {
        if (!this.currentRoom) return null;
        return this.loadRoom(this.currentRoom.code);
    }

    isHost() {
        if (!this.currentRoom) return false;
        const room = this.loadRoom(this.currentRoom.code);
        return room && room.hostId === this.playerId;
    }

    // Storage methods - API first, localStorage fallback
    async saveRoom(room) {
        if (this.useLocalStorage) {
            return this.saveRoomLocal(room);
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: room.players.find(p => p.id === this.playerId) ? 'update' : 'create',
                    roomCode: room.code,
                    roomData: room
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save room');
            }

            const data = await response.json();
            
            // Force immediate update check for better sync
            setTimeout(() => {
                if (this.currentRoom && this.currentRoom.code === room.code) {
                    this.loadRoom(room.code).then(freshRoom => {
                        if (freshRoom) {
                            const newStateStr = JSON.stringify(freshRoom.gameState);
                            if (newStateStr !== this.lastKnownState) {
                                this.lastKnownState = newStateStr;
                                this.currentRoom = freshRoom;
                                this.onRoomUpdate(freshRoom);
                            }
                        }
                    });
                }
            }, 50);

            return data.room;
        } catch (error) {
            console.error('API save failed, falling back to localStorage:', error);
            this.useLocalStorage = true;
            return this.saveRoomLocal(room);
        }
    }

    async loadRoom(roomCode) {
        if (this.useLocalStorage) {
            return this.loadRoomLocal(roomCode);
        }

        try {
            const response = await fetch(`${this.apiUrl}?code=${roomCode}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error('Failed to load room');
            }

            const data = await response.json();
            return data.room;
        } catch (error) {
            console.error('API load failed, falling back to localStorage:', error);
            this.useLocalStorage = true;
            return this.loadRoomLocal(roomCode);
        }
    }

    async deleteRoom(roomCode) {
        if (this.useLocalStorage) {
            return this.deleteRoomLocal(roomCode);
        }

        try {
            await fetch(this.apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomCode })
            });
        } catch (error) {
            console.error('API delete failed:', error);
            this.deleteRoomLocal(roomCode);
        }
    }

    // LocalStorage fallback methods
    saveRoomLocal(room) {
        localStorage.setItem(`room_${room.code}`, JSON.stringify(room));
        
        // Force immediate update check for better same-browser sync
        setTimeout(() => {
            if (this.currentRoom && this.currentRoom.code === room.code) {
                const freshRoom = this.loadRoomLocal(room.code);
                if (freshRoom) {
                    const newStateStr = JSON.stringify(freshRoom.gameState);
                    if (newStateStr !== this.lastKnownState) {
                        this.lastKnownState = newStateStr;
                        this.currentRoom = freshRoom;
                        this.onRoomUpdate(freshRoom);
                    }
                }
            }
        }, 50);
        return room;
    }

    loadRoomLocal(roomCode) {
        const data = localStorage.getItem(`room_${roomCode}`);
        return data ? JSON.parse(data) : null;
    }

    deleteRoomLocal(roomCode) {
        localStorage.removeItem(`room_${roomCode}`);
    }

    // Polling for updates (simulates real-time)
    startPolling() {
        this.stopPolling();
        this.updateInterval = setInterval(async () => {
            if (this.currentRoom) {
                const room = await this.loadRoom(this.currentRoom.code);
                if (room) {
                    // Check if state actually changed
                    const newStateStr = JSON.stringify(room.gameState);
                    const oldStateStr = this.lastKnownState;
                    
                    if (newStateStr !== oldStateStr) {
                        this.lastKnownState = newStateStr;
                        this.currentRoom = room;
                        this.onRoomUpdate(room);
                    }
                }
            }
        }, 500); // Check every 500ms for faster updates
    }

    stopPolling() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onRoomUpdate(room) {
        // Override this in main.js
    }

    // Cleanup old rooms (called on page load)
    static cleanupOldRooms() {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        keys.forEach(key => {
            if (key.startsWith('room_')) {
                try {
                    const room = JSON.parse(localStorage.getItem(key));
                    if (room && (now - room.createdAt > maxAge)) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }
        });
    }
}

// Initialize cleanup on load
if (typeof window !== 'undefined') {
    MultiplayerManager.cleanupOldRooms();
}
