// Multiplayer System using Supabase Realtime
// Real-time sync across devices with WebSocket subscriptions

class MultiplayerManager {
    constructor() {
        this.currentRoom = null;
        this.playerId = this.generatePlayerId();
        this.playerName = '';
        this.supabase = null;
        this.subscription = null;
        
        // REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
        const SUPABASE_URL = 'https://ezgtnfhpaflpxazggthb.supabase.co'; // e.g., https://xxxxx.supabase.co
        const SUPABASE_KEY = 'sb_publishable_yIFJAPZotP6Ooionl4vdsg_--i7_NfF'; // Your anon/public key
        
        // Initialize Supabase client
        if (typeof window.supabase !== 'undefined') {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase initialized');
        } else {
            console.error('❌ Supabase library not loaded. Add the CDN script to index.html');
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
        if (!this.supabase) throw new Error('Supabase not initialized');
        
        const roomCode = this.generateRoomCode();
        this.playerName = playerName;
        
        const room = {
            code: roomCode,
            host_id: this.playerId,
            max_players: parseInt(maxPlayers),
            players: [{
                id: this.playerId,
                name: playerName,
                isHost: true,
                ready: false,
                ship: null
            }],
            game_state: null,
            status: 'lobby'
        };

        const { data, error } = await this.supabase
            .from('rooms')
            .insert([room])
            .select()
            .single();

        if (error) {
            console.error('Error creating room:', error);
            throw new Error('Failed to create room');
        }

        this.currentRoom = data;
        this.subscribeToRoom(roomCode);
        
        console.log(`✅ Room ${roomCode} created`);
        return roomCode;
    }

    async joinRoom(roomCode, playerName) {
        if (!this.supabase) throw new Error('Supabase not initialized');
        
        // Load room
        const { data: room, error } = await this.supabase
            .from('rooms')
            .select('*')
            .eq('code', roomCode)
            .single();

        if (error || !room) {
            console.error(`❌ Room ${roomCode} not found`);
            throw new Error('Room not found');
        }
        
        if (room.players.length >= room.max_players) {
            throw new Error('Room is full');
        }
        
        if (room.status !== 'lobby') {
            throw new Error('Game already started');
        }

        // Check if already in room
        const existingPlayer = room.players.find(p => p.id === this.playerId);
        if (!existingPlayer) {
            this.playerName = playerName;
            
            // Add player to room
            const updatedPlayers = [...room.players, {
                id: this.playerId,
                name: playerName,
                isHost: false,
                ready: false,
                ship: null
            }];

            const { data: updatedRoom, error: updateError } = await this.supabase
                .from('rooms')
                .update({ 
                    players: updatedPlayers,
                    last_update: new Date().toISOString()
                })
                .eq('code', roomCode)
                .select()
                .single();

            if (updateError) {
                console.error('Error joining room:', updateError);
                throw new Error('Failed to join room');
            }

            this.currentRoom = updatedRoom;
            console.log(`✅ Joined room ${roomCode} as ${playerName}`);
        } else {
            this.currentRoom = room;
        }
        
        this.subscribeToRoom(roomCode);
        return this.currentRoom;
    }

    async leaveRoom() {
        if (!this.currentRoom) return;

        const { data: room } = await this.supabase
            .from('rooms')
            .select('*')
            .eq('code', this.currentRoom.code)
            .single();

        if (!room) return;

        // Remove player
        const updatedPlayers = room.players.filter(p => p.id !== this.playerId);

        if (updatedPlayers.length === 0) {
            // Delete room if empty
            await this.deleteRoom(room.code);
        } else {
            // Reassign host if needed
            let updateData = { players: updatedPlayers };
            if (room.host_id === this.playerId) {
                updateData.host_id = updatedPlayers[0].id;
                updatedPlayers[0].isHost = true;
            }

            await this.supabase
                .from('rooms')
                .update(updateData)
                .eq('code', room.code);
        }

        this.unsubscribeFromRoom();
        this.currentRoom = null;
    }

    async updatePlayerReady(ready) {
        if (!this.currentRoom) return;

        const players = this.currentRoom.players.map(p => {
            if (p.id === this.playerId) {
                return { ...p, ready };
            }
            return p;
        });

        await this.supabase
            .from('rooms')
            .update({ players })
            .eq('code', this.currentRoom.code);
    }

    async startGame(gameState) {
        if (!this.currentRoom) return;

        await this.supabase
            .from('rooms')
            .update({ 
                status: 'playing',
                game_state: gameState,
                last_update: new Date().toISOString()
            })
            .eq('code', this.currentRoom.code);
    }

    async updateGameState(gameState) {
        if (!this.currentRoom) return;

        const { error } = await this.supabase
            .from('rooms')
            .update({ 
                game_state: gameState,
                last_update: new Date().toISOString()
            })
            .eq('code', this.currentRoom.code);

        if (error) {
            console.error('Error updating game state:', error);
        } else {
            console.log('💾 Game state saved');
        }
    }

    async getGameState() {
        if (!this.currentRoom) return null;

        const { data } = await this.supabase
            .from('rooms')
            .select('game_state')
            .eq('code', this.currentRoom.code)
            .single();

        return data?.game_state || null;
    }

    async getRoom() {
        if (!this.currentRoom) return null;

        const { data } = await this.supabase
            .from('rooms')
            .select('*')
            .eq('code', this.currentRoom.code)
            .single();

        return data;
    }

    async isHost() {
        if (!this.currentRoom) return false;
        return this.currentRoom.host_id === this.playerId;
    }

    async deleteRoom(roomCode) {
        await this.supabase
            .from('rooms')
            .delete()
            .eq('code', roomCode);
    }

    // Real-time subscription
    subscribeToRoom(roomCode) {
        if (!this.supabase) return;
        
        // Unsubscribe from previous room if any
        this.unsubscribeFromRoom();

        // Subscribe to room changes
        this.subscription = this.supabase
            .channel(`room:${roomCode}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'rooms',
                    filter: `code=eq.${roomCode}`
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        console.log('Room deleted');
                        this.currentRoom = null;
                        return;
                    }

                    const updatedRoom = payload.new;
                    this.currentRoom = updatedRoom;
                    
                    if (this.onRoomUpdate) {
                        this.onRoomUpdate(updatedRoom);
                    }
                }
            )
            .subscribe();

        console.log(`🔔 Subscribed to room ${roomCode}`);
    }

    unsubscribeFromRoom() {
        if (this.subscription) {
            this.supabase.removeChannel(this.subscription);
            this.subscription = null;
        }
    }

    onRoomUpdate(room) {
        // Override this in main.js
    }
}

// No cleanup needed - Supabase handles it with SQL function
