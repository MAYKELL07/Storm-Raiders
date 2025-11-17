// Main Game Controller

let multiplayerManager;
let gameEngine;
let uiManager;
let currentPlayerId;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    multiplayerManager = new MultiplayerManager();
    currentPlayerId = multiplayerManager.playerId;
    
    console.log('Raiders on Deck initialized!');
    console.log('Player ID:', currentPlayerId);
});

// Room Management Functions
function createRoom() {
    const playerName = document.getElementById('createPlayerName').value.trim();
    const maxPlayers = document.getElementById('maxPlayers').value;

    if (!playerName) {
        alert('Please enter your captain name!');
        return;
    }

    try {
        const roomCode = multiplayerManager.createRoom(playerName, maxPlayers);
        console.log('Room created:', roomCode);
        
        showScreen('lobbyScreen');
        updateLobbyScreen();
        
        // Set up room update polling
        multiplayerManager.onRoomUpdate = (room) => {
            updateLobbyScreen();
            
            // Check if game started
            if (room.status === 'playing' && !gameEngine) {
                initializeGameFromRoom(room);
            } else if (room.status === 'playing' && gameEngine) {
                // Update game state
                syncGameState(room.gameState);
            }
        };
    } catch (error) {
        alert('Error creating room: ' + error.message);
    }
}

function joinRoom() {
    const playerName = document.getElementById('joinPlayerName').value.trim();
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();

    if (!playerName) {
        alert('Please enter your captain name!');
        return;
    }

    if (!roomCode || roomCode.length !== 6) {
        alert('Please enter a valid 6-character room code!');
        return;
    }

    try {
        multiplayerManager.joinRoom(roomCode, playerName);
        console.log('Joined room:', roomCode);
        
        showScreen('lobbyScreen');
        updateLobbyScreen();
        
        // Set up room update polling
        multiplayerManager.onRoomUpdate = (room) => {
            updateLobbyScreen();
            
            // Check if game started
            if (room.status === 'playing' && !gameEngine) {
                initializeGameFromRoom(room);
            } else if (room.status === 'playing' && gameEngine) {
                // Update game state
                syncGameState(room.gameState);
            }
        };
    } catch (error) {
        alert('Error joining room: ' + error.message);
    }
}

function leaveRoom() {
    if (confirm('Are you sure you want to leave?')) {
        multiplayerManager.leaveRoom();
        gameEngine = null;
        uiManager = null;
        showScreen('mainMenu');
    }
}

function updateLobbyScreen() {
    const room = multiplayerManager.getRoom();
    if (!room) return;

    document.getElementById('lobbyRoomCode').textContent = room.code;
    document.getElementById('lobbyPlayerCount').textContent = 
        `${room.players.length}/${room.maxPlayers}`;

    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';

    room.players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item' + (player.isHost ? ' host' : '');
        playerItem.innerHTML = `
            <span>${player.name}</span>
            ${player.isHost ? '<span class="player-badge">HOST</span>' : ''}
        `;
        playerList.appendChild(playerItem);
    });

    // Show start button only for host
    const startBtn = document.getElementById('startGameBtn');
    if (multiplayerManager.isHost() && room.players.length >= 2) {
        startBtn.style.display = 'block';
    } else {
        startBtn.style.display = 'none';
    }
}

function startGame() {
    const room = multiplayerManager.getRoom();
    if (!room || room.players.length < 2) {
        alert('Need at least 2 players to start!');
        return;
    }

    // Assign random ships to players
    const availableShips = Object.keys(SHIPS);
    const shuffledShips = shuffleArray([...availableShips]);
    
    const playerData = room.players.map((player, index) => ({
        id: player.id,
        name: player.name,
        shipId: shuffledShips[index % shuffledShips.length]
    }));

    // Initialize game engine
    gameEngine = new GameEngine();
    gameEngine.initializeGame(playerData);

    // Initialize UI manager
    uiManager = new UIManager(gameEngine, multiplayerManager);
    uiManager.currentPlayerId = currentPlayerId;
    window.uiManager = uiManager;
    window.gameEngine = gameEngine;

    // Save game state
    multiplayerManager.startGame(gameEngine.getGameState());

    // Show game screen
    showScreen('gameScreen');
    updateGameScreen();

    // Start priority roll phase
    startPriorityPhase();
}

function initializeGameFromRoom(room) {
    if (!room.gameState) return;

    // Initialize game engine with state
    gameEngine = new GameEngine();
    
    // Manually copy properties to preserve GameEngine class methods
    const gs = room.gameState;
    gameEngine.players = gs.players || [];
    gameEngine.currentRound = gs.currentRound || 1;
    gameEngine.currentPhase = gs.currentPhase || 'priority';
    gameEngine.turnOrder = gs.turnOrder || [];
    gameEngine.currentPlayerIndex = gs.currentPlayerIndex || 0;
    gameEngine.decks = gs.decks || gameEngine.decks;
    gameEngine.activeEffects = gs.activeEffects || [];
    gameEngine.currentEvent = gs.currentEvent || null;
    gameEngine.gameLog = gs.gameLog || [];

    // Initialize UI manager
    uiManager = new UIManager(gameEngine, multiplayerManager);
    uiManager.currentPlayerId = currentPlayerId;
    window.uiManager = uiManager;
    window.gameEngine = gameEngine;

    showScreen('gameScreen');
    updateGameScreen();

    // Check current phase
    if (gameEngine.currentPhase === 'priority') {
        startPriorityPhase();
    }
}

function syncGameState(gameState) {
    if (!gameEngine || !gameState) return;

    // Manually copy properties to preserve GameEngine class methods
    gameEngine.players = gameState.players || [];
    gameEngine.currentRound = gameState.currentRound || 1;
    gameEngine.currentPhase = gameState.currentPhase || 'priority';
    gameEngine.turnOrder = gameState.turnOrder || [];
    gameEngine.currentPlayerIndex = gameState.currentPlayerIndex || 0;
    gameEngine.decks = gameState.decks || gameEngine.decks;
    gameEngine.activeEffects = gameState.activeEffects || [];
    gameEngine.currentEvent = gameState.currentEvent || null;
    gameEngine.gameLog = gameState.gameLog || [];

    // Update UI
    updateGameScreen();

    // Check current phase and handle accordingly
    if (gameState.currentPhase === 'priority') {
        // Check if we need to roll
        const currentPlayerData = gameEngine.players.find(p => p.id === currentPlayerId);
        if (currentPlayerData && currentPlayerData.priorityRoll === 0) {
            // We haven't rolled yet, show the modal
            startPriorityPhase();
        }
        
        // Check if all players have rolled
        const allRolled = gameEngine.players.every(p => p.priorityRoll > 0);
        if (allRolled && gameEngine.turnOrder.length === 0) {
            // Determine turn order if not already done
            gameEngine.determineTurnOrder();
            multiplayerManager.updateGameState(gameEngine.getGameState());
            updateGameScreen();
            checkPlayerTurn();
        }
    }

    // Check for victory
    const winner = gameEngine.checkWinConditions();
    if (winner) {
        uiManager.showVictory(winner);
    }
}

// Game Flow Functions
function startPriorityPhase() {
    updateGameScreen(); // Update to show waiting status
    
    // Check if current player has already rolled
    const currentPlayerData = gameEngine.players.find(p => p.id === currentPlayerId);
    if (currentPlayerData && currentPlayerData.priorityRoll > 0) {
        // Already rolled, just wait for others
        console.log('Already rolled, waiting for other players...');
        uiManager.showNotification('⏳ Waiting for other players to roll...');
        return;
    }
    
    // Show notification that it's time to roll
    uiManager.showNotification('🎲 Your turn to roll for priority!', 2000);
    
    // Show dice roll modal for current player
    setTimeout(() => {
        uiManager.showDiceModal((result) => {
            // Save state
            multiplayerManager.updateGameState(gameEngine.getGameState());
            updateGameScreen(); // Update to show new roll count
            
            // Check if all players rolled
            const allRolled = gameEngine.players.every(p => p.priorityRoll > 0);
            
            if (allRolled) {
                uiManager.showNotification('✅ All players rolled! Starting game...', 2000);
                // Determine turn order
                setTimeout(() => {
                    gameEngine.determineTurnOrder();
                    multiplayerManager.updateGameState(gameEngine.getGameState());
                    updateGameScreen();
                    
                    // Start first player's turn
                    checkPlayerTurn();
                }, 2000);
            } else {
                uiManager.showNotification('⏳ Waiting for other players to roll...');
            }
        });
    }, 500);
}

function checkPlayerTurn() {
    const currentPlayer = gameEngine.getCurrentPlayer();
    
    if (!currentPlayer) {
        // Round ended
        const result = gameEngine.endRound();
        multiplayerManager.updateGameState(gameEngine.getGameState());
        
        if (result.gameOver) {
            uiManager.showVictory(result.winner);
        } else {
            // Start new round
            uiManager.showNotification('🌊 New Round Starting! Roll for priority...', 2000);
            setTimeout(() => {
                startPriorityPhase();
            }, 2000);
        }
        return;
    }

    updateGameScreen();

    // Auto-prompt if it's this player's turn
    if (currentPlayer.id === currentPlayerId) {
        uiManager.showNotification('⚓ YOUR TURN! Choose your action.', 3000);
    } else {
        const playerIndex = gameEngine.turnOrder.indexOf(currentPlayerId);
        const currentIndex = gameEngine.turnOrder.indexOf(currentPlayer.id);
        const turnsUntilYours = (playerIndex - currentIndex + gameEngine.turnOrder.length) % gameEngine.turnOrder.length;
        
        if (turnsUntilYours === 1) {
            uiManager.showNotification(`⏭️ You're next! ${currentPlayer.name} is taking their turn...`, 3000);
        }
    }
}

function selectAction(action) {
    const currentPlayer = gameEngine.getCurrentPlayer();
    
    if (!currentPlayer || currentPlayer.id !== currentPlayerId) {
        alert('Not your turn!');
        return;
    }

    if (action === 'fire') {
        // Need to select target
        uiManager.showTargetSelection((targetId) => {
            performPlayerAction(action, targetId);
        });
    } else {
        performPlayerAction(action);
    }
}

function performPlayerAction(action, target = null) {
    const result = gameEngine.performAction(currentPlayerId, action, target);

    if (!result.success) {
        alert(result.message);
        return;
    }

    // Animate effects
    if (action === 'fire' && target) {
        uiManager.animateDamage(target);
    } else if (action === 'repair') {
        uiManager.animateHeal(currentPlayerId);
    }

    // Update state
    multiplayerManager.updateGameState(gameEngine.getGameState());
    updateGameScreen();

    // Next turn
    setTimeout(() => {
        gameEngine.nextTurn();
        multiplayerManager.updateGameState(gameEngine.getGameState());
        checkPlayerTurn();
    }, 1000);
}

function playSelectedCard() {
    if (!window.selectedCard) return;

    const card = window.selectedCard;
    const currentPlayer = gameEngine.getCurrentPlayer();

    // Check if card requires target
    const requiresTarget = ['skipTurn', 'discardRandom'].includes(card.effect.type);

    if (requiresTarget) {
        uiManager.closeModal();
        uiManager.showTargetSelection((targetId) => {
            const result = gameEngine.playCard(currentPlayerId, card.id, targetId);
            
            if (result.success) {
                multiplayerManager.updateGameState(gameEngine.getGameState());
                updateGameScreen();
            } else {
                alert(result.message);
            }
        });
    } else {
        const result = gameEngine.playCard(currentPlayerId, card.id);
        
        if (result.success) {
            uiManager.closeModal();
            multiplayerManager.updateGameState(gameEngine.getGameState());
            updateGameScreen();
            
            // Animate heal if applicable
            if (card.effect.type === 'heal' || card.effect.type === 'healAndCleanse') {
                uiManager.animateHeal(currentPlayerId);
            }
        } else {
            alert(result.message);
        }
    }

    window.selectedCard = null;
}

function updateGameScreen() {
    if (!uiManager || !gameEngine) return;
    
    const gameState = gameEngine.getGameState();
    uiManager.updateGameScreen(gameState);
}

function returnToMainMenu() {
    if (multiplayerManager.currentRoom) {
        multiplayerManager.leaveRoom();
    }
    
    gameEngine = null;
    uiManager = null;
    showScreen('mainMenu');
}

// Utility function exposed globally
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
