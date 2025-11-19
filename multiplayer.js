// Multiplayer System using Vercel Serverless API for cross-device sync
// Falls back to localStorage for local testing

class MultiplayerManager {
    constructor() {
        this.currentRoom = null;
        this.playerId = this.generatePlayerId();
        this.playerName = '';
        this.updateInterval = null;
        this.lastKnownState = null;
        this.instanceId = 'mp_' + Math.random().toString(36).slice(2);
        this.apiAvailable = true;
        this.apiFailureCount = 0;
        this.maxApiFailures = 2;
        this.channel = null;
        this.apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000/api/rooms'  // Local testing
            : '/api/rooms';  // Production on Vercel
        this.useLocalStorage = false; // Will flip to true automatically if API fails repeatedly
        const params = new URLSearchParams(window.location.search);
        if (params.get('offline') === '1') {
            this.useLocalStorage = true;
            this.apiAvailable = false;
            console.warn('[WARN] Multiplayer running in forced offline mode');
        }
        
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
        
        // BroadcastChannel for real-time same-browser sync (more reliable than polling storage alone)
        if (typeof BroadcastChannel !== 'undefined') {
            this.channel = new BroadcastChannel('raiders_room_bus');
            this.channel.onmessage = (event) => {
                const data = event.data || {};
                if (data.sender === this.instanceId) return; // Ignore our own updates
                
                if (data.type === 'room_update' && data.room) {
                    this.saveRoomLocal(data.room, true);
                } else if (data.type === 'room_delete' && data.code) {
                    this.deleteRoomLocal(data.code, true);
                } else if (data.type === 'sync_mode' && data.mode === 'local') {
                    this.apiAvailable = false;
                    this.useLocalStorage = true;
                    console.warn('[WARN] Remote sync disabled in another tab. Switching to local mode.');
                }
            };
        }
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

    async createRoom(playerName, maxPlayers) {
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

        await this.saveRoom(room, true); // Force create
        
        // Reload to ensure we have the server's version
        const savedRoom = await this.loadRoom(roomCode);
        this.currentRoom = savedRoom || room;
        
        this.startPolling();
        
        return roomCode;
    }

    async joinRoom(roomCode, playerName) {
        const room = await this.loadRoom(roomCode);
        
        if (!room) {
            console.error(`❌ Room ${roomCode} not found`);
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
            
            // Reload room to get the saved state
            const updatedRoom = await this.loadRoom(roomCode);
            this.currentRoom = updatedRoom || room;
            console.log(`✅ Joined room ${roomCode} as ${playerName}`);
        } else {
            this.currentRoom = room;
        }
        
        this.startPolling();
        
        return this.currentRoom;
    }

    async leaveRoom() {
        if (!this.currentRoom) return;

        const room = await this.loadRoom(this.currentRoom.code);
        if (!room) return;

        // Remove player from room
        room.players = room.players.filter(p => p.id !== this.playerId);

        // If host left, assign new host or delete room
        if (room.players.length === 0) {
            await this.deleteRoom(room.code);
        } else if (room.hostId === this.playerId) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
            await this.saveRoom(room);
        } else {
            await this.saveRoom(room);
        }

        this.stopPolling();
        this.currentRoom = null;
    }

    async updatePlayerReady(ready) {
        if (!this.currentRoom) return;

        const room = await this.loadRoom(this.currentRoom.code);
        if (!room) return;

        const player = room.players.find(p => p.id === this.playerId);
        if (player) {
            player.ready = ready;
            await this.saveRoom(room);
        }
    }

    async startGame(gameState) {
        if (!this.currentRoom) return;

        const room = await this.loadRoom(this.currentRoom.code);
        if (!room) return;

        room.status = 'playing';
        room.gameState = gameState;
        await this.saveRoom(room);
    }

    async updateGameState(gameState) {
        if (!this.currentRoom) return;

        // Load latest room state to get other players' data
        let latestRoom = await this.loadRoom(this.currentRoom.code);
        if (!latestRoom) {
            console.warn('[WARN] Could not load from API, using current room');
            latestRoom = this.currentRoom; // Fallback to current room in memory
        }

        // Merge game states - preserve data from both
        if (latestRoom.gameState && latestRoom.gameState.players && gameState.players) {
            // Merge player data - keep the highest priorityRoll for each player
            gameState.players.forEach((player, index) => {
                const latestPlayer = latestRoom.gameState.players[index];
                if (latestPlayer && latestPlayer.priorityRoll > 0 && player.priorityRoll === 0) {
                    // Latest room has a roll we don't have - use it
                    player.priorityRoll = latestPlayer.priorityRoll;
                }
            });
        }

        // Update game state and timestamp
        latestRoom.gameState = gameState;
        latestRoom.lastUpdate = Date.now();
        
        // Update local reference FIRST so polling doesn't overwrite with stale data
        this.currentRoom = latestRoom;
        this.lastKnownState = JSON.stringify(gameState);
        
        // Save to API and localStorage
        await this.saveRoom(latestRoom);
        
        console.log(`💾 Game state saved`, {
            rolls: gameState.players?.map(p => ({name: p.name, roll: p.priorityRoll}))
        });
    }

    async getGameState() {
        if (!this.currentRoom) return null;

        const room = await this.loadRoom(this.currentRoom.code);
        return room ? room.gameState : null;
    }

    async getRoom() {
        if (!this.currentRoom) return null;
        return await this.loadRoom(this.currentRoom.code);
    }

    async isHost() {
        if (!this.currentRoom) return false;
        const room = await this.loadRoom(this.currentRoom.code);
        return room && room.hostId === this.playerId;
    }

    // Storage methods - API first, localStorage fallback
    async saveRoom(room, forceCreate = false) {
        // Always save to localStorage first for reliability
        this.saveRoomLocal(room);
        
        if (!this.shouldUseRemoteSync()) {
            return room;
        }
        
        // Try to sync to API but don't fail if it's down
        try {
            // Determine action - if forceCreate or this is a new room, use 'create'
            let action = 'update';
            if (forceCreate) {
                action = 'create';
            } else {
                // Check if room exists in API
                try {
                    const checkUrl = `${this.apiUrl}?code=${room.code}`;
                    const checkResponse = await fetch(checkUrl);
                    if (checkResponse.status === 404) {
                        action = 'create';
                    }
                } catch (e) {
                    action = 'create'; // If check fails, assume it doesn't exist
                }
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: action,
                    roomCode: room.code,
                    roomData: room
                })
            });

            if (!response.ok) {
                this.handleApiFailure(`save:${response.status}`);
                return room; // Return the locally saved room
            }
            
            const data = await response.json();
            if (action === 'create') {
                console.log(`✅ Room ${room.code} created with ${room.players?.length} players`);
            }
            
            this.resetApiFailures();
            
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
            console.warn('[WARN] API not available, using localStorage only:', error.message);
            return room; // Return the locally saved room
        }
    }

    async loadRoom(roomCode) {
        // Try localStorage first
        const localRoom = this.loadRoomLocal(roomCode);

        if (!this.shouldUseRemoteSync()) {
            if (!localRoom) {
                console.warn('[WARN] Offline mode: requested room missing locally.');
            }
            return localRoom;
        }
        
        // Try to get from API for cross-device sync
        try {
            const url = `${this.apiUrl}?code=${roomCode}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                // Merge API data with local data (API is source of truth for active rooms)
                if (data.room) {
                    this.saveRoomLocal(data.room); // Update localStorage
                    return data.room;
                }
            } else if (response.status === 404 && localRoom) {
                this.handleApiFailure('room_missing');
            } else if (response.status === 404) {
                console.warn(`[WARN] API reports room ${roomCode} missing.`);
            }
        } catch (error) {
            this.handleApiFailure(error.message);
        }
        
        // Return localStorage version if API fails or room not found
        if (!localRoom) {
            console.error(`[ERROR] Room ${roomCode} not found`);
        }
        return localRoom;
    }

    async deleteRoom(roomCode) {
        this.deleteRoomLocal(roomCode);

        if (!this.shouldUseRemoteSync()) {
            return;
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomCode })
            });
            if (!response.ok) {
                this.handleApiFailure(`delete:${response.status}`);
            } else {
                this.resetApiFailures();
            }
        } catch (error) {
            this.handleApiFailure(error.message);
        }
    }

    // LocalStorage fallback methods
    saveRoomLocal(room, silent = false) {
        localStorage.setItem(`room_${room.code}`, JSON.stringify(room));
        if (!silent) {
            this.broadcastRoom(room);
        }
        
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

    deleteRoomLocal(roomCode, silent = false) {
        localStorage.removeItem(`room_${roomCode}`);
        if (!silent) {
            this.broadcastDelete(roomCode);
        }
    }

    shouldUseRemoteSync() {
        return !this.useLocalStorage && this.apiAvailable;
    }

    handleApiFailure(reason) {
        this.apiFailureCount++;
        if (this.apiAvailable && this.apiFailureCount >= this.maxApiFailures) {
            console.warn(`[WARN] Remote sync disabled (${reason}). Falling back to local-only mode.`);
            this.apiAvailable = false;
            this.useLocalStorage = true;
            if (this.channel) {
                this.channel.postMessage({
                    type: 'sync_mode',
                    mode: 'local',
                    sender: this.instanceId
                });
            }
        }
    }

    resetApiFailures() {
        this.apiFailureCount = 0;
    }

    broadcastRoom(room) {
        if (!this.channel) return;
        this.channel.postMessage({
            type: 'room_update',
            room,
            sender: this.instanceId
        });
    }

    broadcastDelete(roomCode) {
        if (!this.channel) return;
        this.channel.postMessage({
            type: 'room_delete',
            code: roomCode,
            sender: this.instanceId
        });
    }

    // Polling for updates (simulates real-time)
    startPolling() {
        this.stopPolling();
        this.updateInterval = setInterval(async () => {
            if (this.currentRoom) {
                const room = await this.loadRoom(this.currentRoom.code);
                if (room) {
                    // Check if the game state actually changed (not just timestamp)
                    const newStateStr = JSON.stringify(room.gameState);
                    const oldStateStr = this.lastKnownState;
                    
                    if (newStateStr !== oldStateStr) {
                        this.currentRoom = room;
                        this.lastKnownState = newStateStr;
                        if (this.onRoomUpdate) {
                            this.onRoomUpdate(room);
                        }
                    }
                }
            }
        }, 300); // Check every 300ms for real-time feel
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
