// UI Management - Handles all UI updates and interactions

class UIManager {
    constructor(gameEngine, multiplayerManager) {
        this.gameEngine = gameEngine;
        this.multiplayerManager = multiplayerManager;
        this.currentPlayerId = null;
    }

    // Show notification toast
    showNotification(message, duration = 3000) {
        const toast = document.getElementById('notificationToast');
        const messageEl = document.getElementById('notificationMessage');
        
        messageEl.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Screen management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // Lobby UI
    updateLobby(room) {
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
        if (this.multiplayerManager.isHost() && room.players.length >= 2) {
            startBtn.style.display = 'block';
        } else {
            startBtn.style.display = 'none';
        }
    }

    // Game UI
    updateGameScreen(gameState) {
        if (!gameState) return;

        // Update round and turn info
        document.getElementById('roundNumber').textContent = gameState.currentRound;
        
        // Update turn indicator with more detailed info
        const turnIndicator = document.getElementById('turnIndicator');
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        
        if (gameState.currentPhase === 'priority') {
            // Show priority roll status
            const totalPlayers = gameState.players.filter(p => p.ship.hp > 0).length;
            const rolledPlayers = gameState.players.filter(p => p.priorityRoll > 0).length;
            
            if (rolledPlayers < totalPlayers) {
                const waitingFor = totalPlayers - rolledPlayers;
                turnIndicator.textContent = `Rolling for Priority... (${rolledPlayers}/${totalPlayers} rolled, waiting for ${waitingFor} more)`;
            } else {
                turnIndicator.textContent = 'All players rolled! Determining turn order...';
            }
        } else if (currentPlayer) {
            // Show current turn with remaining turns info
            const currentIndex = gameState.turnOrder.indexOf(currentPlayer.id);
            const remainingTurns = gameState.turnOrder.length - currentIndex - 1;
            
            if (currentPlayer.id === this.currentPlayerId) {
                turnIndicator.textContent = `YOUR TURN! (${remainingTurns} player${remainingTurns !== 1 ? 's' : ''} after you)`;
            } else {
                turnIndicator.textContent = `${currentPlayer.name}'s Turn (${remainingTurns + 1} turn${remainingTurns + 1 !== 1 ? 's' : ''} until yours)`;
            }
        } else {
            turnIndicator.textContent = 'Waiting...';
        }

        // Update opponent ships
        this.updateOpponentShips(gameState);

        // Update player's own ship
        this.updatePlayerShip(gameState);

        // Update player hand
        this.updatePlayerHand(gameState);

        // Update action panel
        this.updateActionPanel(gameState);

        // Update game log
        this.updateGameLog(gameState);
    }

    updateOpponentShips(gameState) {
        const opponentShips = document.getElementById('opponentShips');
        opponentShips.innerHTML = '';

        const currentPlayer = this.gameEngine.getCurrentPlayer();

        gameState.players.forEach(player => {
            if (player.id === this.currentPlayerId) return;

            const isCurrentTurn = currentPlayer && currentPlayer.id === player.id;
            const isDefeated = player.ship.hp <= 0;

            const shipCard = document.createElement('div');
            shipCard.className = 'opponent-card' + 
                (isCurrentTurn ? ' active-turn' : '') +
                (isDefeated ? ' defeated' : '');
            shipCard.dataset.playerId = player.id;

            shipCard.innerHTML = `
                <div class="ship-header">
                    <div class="ship-name">${player.name}</div>
                    <div class="ship-hp ${player.ship.hp > player.ship.maxHp * 0.5 ? 'healthy' : ''}">
                        ❤️ ${player.ship.hp}/${player.ship.maxHp}
                    </div>
                </div>
                <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 10px;">
                    ${player.ship.name}
                </div>
                <div class="ship-stats">
                    <div class="stat-item">⚔️ Attack: +${player.ship.attackBonus}</div>
                    <div class="stat-item">🛡️ Defense: ${player.ship.defense}%</div>
                    <div class="stat-item">💣 Ammo: ${player.ammunition}</div>
                    <div class="stat-item">💰 Gold: ${player.gold}</div>
                </div>
                <div class="ship-resources">
                    <div class="resource-item">🃏 Cards: ${player.hand.length}</div>
                    <div class="resource-item">👥 Crew: ${player.crew.filter(c => c.active).length}/${player.ship.crewCapacity}</div>
                    ${player.mapFragments > 0 ? `<div class="resource-item">🗺️ Fragments: ${player.mapFragments}</div>` : ''}
                </div>
                ${player.effects.length > 0 ? `
                    <div style="margin-top: 10px; font-size: 0.8rem; color: #FFD700;">
                        Active Effects: ${player.effects.map(e => e.type).join(', ')}
                    </div>
                ` : ''}
            `;

            opponentShips.appendChild(shipCard);
        });
    }

    updatePlayerShip(gameState) {
        const player = gameState.players.find(p => p.id === this.currentPlayerId);
        if (!player) return;

        const playerShip = document.getElementById('playerShip');
        
        const activeCrew = player.crew.filter(c => c.active).length;
        const inactiveCrew = player.crew.length - activeCrew;

        playerShip.innerHTML = `
            <div class="ship-header">
                <div class="ship-name">${player.ship.name}</div>
                <div class="ship-hp ${player.ship.hp > player.ship.maxHp * 0.5 ? 'healthy' : ''}">
                    ❤️ ${player.ship.hp}/${player.ship.maxHp}
                </div>
            </div>
            <div class="ship-stats">
                <div class="stat-item">⚔️ Attack: +${player.ship.attackBonus}</div>
                <div class="stat-item">🛡️ Defense: ${player.ship.defense}%</div>
                <div class="stat-item">💣 Ammunition: ${player.ammunition}</div>
                <div class="stat-item">💰 Gold: ${player.gold}</div>
            </div>
            <div class="captain-buff">
                <div class="buff-name">⚓ ${player.ship.captainBuff.name}</div>
                <div>${player.ship.captainBuff.description}</div>
            </div>
            <div class="crew-tokens">
                ${player.crew.map((crew, i) => 
                    `<div class="crew-token ${crew.active ? '' : 'inactive'}">👤</div>`
                ).join('')}
            </div>
            ${player.mapFragments > 0 ? `
                <div style="margin-top: 10px; padding: 10px; background: rgba(255, 215, 0, 0.2); border-radius: 5px;">
                    🗺️ Map Fragments: ${player.mapFragments}/${GAME_CONSTANTS.MAP_FRAGMENTS_TO_WIN}
                </div>
            ` : ''}
        `;
    }

    updatePlayerHand(gameState) {
        const player = gameState.players.find(p => p.id === this.currentPlayerId);
        if (!player) return;

        const handCards = document.getElementById('handCards');
        handCards.innerHTML = '';

        player.hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.type}</div>
                <div class="card-description">${card.description}</div>
            `;
            cardElement.onclick = () => this.onCardClick(card);
            handCards.appendChild(cardElement);
        });
    }

    updateActionPanel(gameState) {
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        const player = gameState.players.find(p => p.id === this.currentPlayerId);
        
        if (!player) return;

        const isMyTurn = currentPlayer && currentPlayer.id === this.currentPlayerId;
        const actionButtons = document.querySelectorAll('.btn-action');

        actionButtons.forEach(btn => {
            const action = btn.dataset.action;
            let disabled = !isMyTurn;
            let reason = '';

            // Check specific action availability
            if (isMyTurn) {
                switch (action) {
                    case 'fire':
                        disabled = player.ammunition <= 0;
                        if (disabled) reason = 'No ammunition';
                        break;
                    case 'repair':
                        // Can repair if: (HP < maxHP) AND (took damage OR didn't repair last round)
                        const atFullHP = player.ship.hp >= player.ship.maxHp;
                        const repairedLastRound = player.lastRepairRound === gameState.currentRound - 1;
                        const tookDamage = player.lastDamageTaken > 0;
                        disabled = atFullHP || (repairedLastRound && !tookDamage);
                        if (disabled) {
                            if (atFullHP) reason = 'Already at full HP';
                            else reason = 'Cannot repair consecutively';
                        }
                        break;
                    case 'maneuver':
                        disabled = player.cannotManeuverNext;
                        if (disabled) reason = 'Cannot maneuver after reloading';
                        break;
                }
            } else {
                reason = 'Not your turn';
            }

            btn.disabled = disabled;
            btn.title = disabled ? reason : '';
        });
    }

    updateGameLog(gameState) {
        const logContent = document.getElementById('logContent');
        logContent.innerHTML = '';

        gameState.gameLog.slice().reverse().forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            if (entry.message.includes('fire') || entry.message.includes('💥')) {
                logEntry.classList.add('attack');
            } else if (entry.message.includes('repair') || entry.message.includes('🔧')) {
                logEntry.classList.add('heal');
            } else if (entry.message.includes('🃏')) {
                logEntry.classList.add('card');
            }

            logEntry.textContent = entry.message;
            logContent.appendChild(logEntry);
        });
    }

    // Modals
    showModal(modalId) {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showDiceModal(callback) {
        const gameState = this.gameEngine.getGameState();
        const totalPlayers = gameState.players.filter(p => p.ship.hp > 0).length;
        const rolledPlayers = gameState.players.filter(p => p.priorityRoll > 0).length;
        
        this.showModal('diceModal');
        
        // Update modal header to show waiting status
        const diceModalContent = document.querySelector('#diceModal .modal-content h2');
        if (rolledPlayers > 0) {
            diceModalContent.textContent = `Roll for Priority (${rolledPlayers}/${totalPlayers} players rolled)`;
        } else {
            diceModalContent.textContent = 'Roll for Priority';
        }
        
        document.getElementById('die1').textContent = '?';
        document.getElementById('die2').textContent = '?';
        document.getElementById('diceTotal').textContent = '-';
        
        window.rollDiceCallback = callback;
    }

    rollDice() {
        const die1Element = document.getElementById('die1');
        const die2Element = document.getElementById('die2');
        
        die1Element.classList.add('rolling');
        die2Element.classList.add('rolling');

        setTimeout(() => {
            const result = this.gameEngine.rollPriority(this.currentPlayerId);
            
            die1Element.textContent = result.die1;
            die2Element.textContent = result.die2;
            document.getElementById('diceTotal').textContent = result.total;

            die1Element.classList.remove('rolling');
            die2Element.classList.remove('rolling');

            setTimeout(() => {
                this.closeModal();
                if (window.rollDiceCallback) {
                    window.rollDiceCallback(result);
                }
            }, 1500);
        }, 500);
    }

    showTargetSelection(callback) {
        const targetList = document.getElementById('targetList');
        targetList.innerHTML = '';

        const validTargets = this.gameEngine.players.filter(p => 
            p.id !== this.currentPlayerId && p.ship.hp > 0
        );

        validTargets.forEach(target => {
            const targetOption = document.createElement('div');
            targetOption.className = 'target-option';
            targetOption.innerHTML = `
                <strong>${target.name}</strong> - ${target.ship.name}<br>
                ❤️ ${target.ship.hp}/${target.ship.maxHp} HP | 
                🛡️ ${target.ship.defense}% Defense
            `;
            targetOption.onclick = () => {
                this.closeModal();
                callback(target.id);
            };
            targetList.appendChild(targetOption);
        });

        this.showModal('targetModal');
    }

    showVictory(winner) {
        const message = document.getElementById('victoryMessage');
        
        if (winner.type === 'lastStanding') {
            message.textContent = `${winner.player.name} is the last ship standing!`;
        } else if (winner.type === 'mapFragments') {
            message.textContent = `${winner.player.name} found all the treasure map fragments!`;
        } else if (winner.type === 'gold') {
            message.textContent = `${winner.player.name} has amassed enough gold to win!`;
        } else {
            message.textContent = 'The battle ends in a draw!';
        }

        this.showModal('victoryModal');
    }

    onCardClick(card) {
        const cardDisplay = document.getElementById('cardDisplay');
        cardDisplay.innerHTML = `
            <div class="card" style="min-height: auto; margin-bottom: 20px;">
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.type}</div>
                <div class="card-description">${card.description}</div>
            </div>
        `;
        
        window.selectedCard = card;
        this.showModal('cardModal');
    }

    animateDamage(playerId) {
        const element = document.querySelector(`[data-player-id="${playerId}"]`) ||
                       document.getElementById('playerShip');
        
        if (element) {
            element.classList.add('damage-animation');
            setTimeout(() => element.classList.remove('damage-animation'), 500);
        }
    }

    animateHeal(playerId) {
        const element = playerId === this.currentPlayerId ?
                       document.getElementById('playerShip') :
                       document.querySelector(`[data-player-id="${playerId}"]`);
        
        if (element) {
            element.classList.add('heal-animation');
            setTimeout(() => element.classList.remove('heal-animation'), 1000);
        }
    }
}

// Global UI helper functions for HTML onclick handlers
function showScreen(screenId) {
    if (window.uiManager) {
        window.uiManager.showScreen(screenId);
    } else {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
}

function closeModal() {
    if (window.uiManager) {
        window.uiManager.closeModal();
    } else {
        document.getElementById('modalOverlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }
}

function rollDice() {
    if (window.uiManager) {
        window.uiManager.rollDice();
    }
}
