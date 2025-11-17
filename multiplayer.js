// Multiplayer System using LocalStorage for demo purposes
// In production, this would use WebSockets or a backend service

class MultiplayerManager {
    constructor() {
        this.currentRoom = null;
        this.playerId = this.generatePlayerId();
        this.playerName = '';
        this.updateInterval = null;
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

    joinRoom(roomCode, playerName) {
        const room = this.loadRoom(roomCode);
        
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
            
            this.saveRoom(room);
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

    // Storage methods
    saveRoom(room) {
        localStorage.setItem(`room_${room.code}`, JSON.stringify(room));
    }

    loadRoom(roomCode) {
        const data = localStorage.getItem(`room_${roomCode}`);
        return data ? JSON.parse(data) : null;
    }

    deleteRoom(roomCode) {
        localStorage.removeItem(`room_${roomCode}`);
    }

    // Polling for updates (simulates real-time)
    startPolling() {
        this.stopPolling();
        this.updateInterval = setInterval(() => {
            if (this.currentRoom) {
                const room = this.loadRoom(this.currentRoom.code);
                if (room) {
                    this.currentRoom = room;
                    this.onRoomUpdate(room);
                }
            }
        }, 1000); // Check every second
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
