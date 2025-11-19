// Game Engine - Core game logic and mechanics

class GameEngine {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.currentPhase = 'priority'; // priority, action, resolution
        this.turnOrder = [];
        this.currentPlayerIndex = 0;
        this.priorityRolled = false; // Track if priority has been rolled
        this.decks = {
            action: createDeck(ACTION_CARDS, 3),
            loot: createDeck(LOOT_CARDS, 5),
            event: createDeck(EVENT_CARDS, 2),
            starter: createDeck(STARTER_CARDS, 1)
        };
        this.activeEffects = [];
        this.currentEvent = null;
        this.gameLog = [];
    }

    initializeGame(playerData) {
        // playerData: [{ id, name, shipId }]
        this.players = playerData.map(pd => ({
            id: pd.id,
            name: pd.name,
            ship: getShipById(pd.shipId),
            hand: [],
            ammunition: GAME_CONSTANTS.STARTING_AMMUNITION,
            gold: GAME_CONSTANTS.STARTING_GOLD,
            mapFragments: 0,
            crew: [],
            effects: [],
            lastAction: null,
            lastDamageTaken: 0,
            priorityRoll: 0,
            skipNextTurn: false,
            maneuvering: false,
            hasManeuverBonus: false,
            lastRepairRound: 0,
            cannotManeuverNext: false
        }));

        // Initialize crew
        this.players.forEach(player => {
            for (let i = 0; i < player.ship.crewCapacity; i++) {
                player.crew.push({ active: true });
            }
        });

        // Deal starter cards
        this.players.forEach(player => {
            for (let i = 0; i < GAME_CONSTANTS.STARTING_HAND_SIZE; i++) {
                this.drawCard(player, 'starter');
            }
        });

        this.log('Game initialized! All captains prepare for battle!');
    }

    // Roll dice for priority
    rollPriority(playerId) {
        const player = this.getPlayer(playerId);
        if (!player) return null;

        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        player.priorityRoll = die1 + die2;

        this.log(`${player.name} rolled ${die1} + ${die2} = ${player.priorityRoll} for priority`);
        return { die1, die2, total: player.priorityRoll };
    }

    determineTurnOrder() {
        this.turnOrder = [...this.players]
            .filter(p => p.ship.hp > 0)
            .sort((a, b) => b.priorityRoll - a.priorityRoll)
            .map(p => p.id);
        
        this.currentPlayerIndex = 0;
        this.currentPhase = 'action';
        this.priorityRolled = true; // Mark that priority has been rolled
        
        this.log(`Turn order: ${this.turnOrder.map(id => this.getPlayer(id).name).join(' → ')}`);
    }

    getCurrentPlayer() {
        if (this.turnOrder.length === 0) return null;
        return this.getPlayer(this.turnOrder[this.currentPlayerIndex]);
    }

    nextTurn() {
        this.currentPlayerIndex++;
        
        if (this.currentPlayerIndex >= this.turnOrder.length) {
            this.endRound();
        }
    }

    endRound() {
        this.log(`=== End of Round ${this.currentRound} ===`);
        
        // Process burn damage and other ongoing effects
        this.players.forEach(player => {
            if (player.ship.hp <= 0) return;

            // Burn damage
            const burnEffect = player.effects.find(e => e.type === 'burn');
            if (burnEffect) {
                const damage = burnEffect.damage;
                player.ship.hp = Math.max(0, player.ship.hp - damage);
                this.log(`${player.name} takes ${damage} burn damage! (${player.ship.hp}/${player.ship.maxHp} HP)`);
                
                burnEffect.duration--;
                if (burnEffect.duration <= 0) {
                    player.effects = player.effects.filter(e => e !== burnEffect);
                    this.log(`${player.name}'s burn effect has ended.`);
                }
            }

            // Decrease effect durations
            player.effects = player.effects.filter(e => {
                if (e.duration !== undefined) {
                    e.duration--;
                    return e.duration > 0;
                }
                return true;
            });

            // Reset round-specific states
            player.lastDamageTaken = 0;
            player.maneuvering = false;
        });

        // Check win conditions
        const winner = this.checkWinConditions();
        if (winner) {
            return { gameOver: true, winner };
        }

        // Start new round - reset to first player in turn order
        this.currentRound++;
        this.currentPlayerIndex = 0;
        this.currentPhase = 'action';
        
        // Draw event card (20% chance)
        if (Math.random() < 0.2) {
            this.drawEventCard();
        }

        return { gameOver: false };
    }

    // Actions
    performAction(playerId, action, target = null) {
        const player = this.getPlayer(playerId);
        if (!player) return { success: false, message: 'Player not found' };

        if (player.skipNextTurn) {
            player.skipNextTurn = false;
            this.log(`${player.name} is trapped and skips their turn!`);
            return { success: true, message: 'Turn skipped', skipTurn: true };
        }

        player.lastAction = action;

        switch (action) {
            case 'fire':
                return this.actionFire(player, target);
            case 'repair':
                return this.actionRepair(player);
            case 'plunder':
                return this.actionPlunder(player);
            case 'reload':
                return this.actionReload(player);
            case 'maneuver':
                return this.actionManeuver(player);
            default:
                return { success: false, message: 'Invalid action' };
        }
    }

    actionFire(player, targetId) {
        if (player.ammunition <= 0) {
            return { success: false, message: 'No ammunition!' };
        }

        const target = this.getPlayer(targetId);
        if (!target || target.ship.hp <= 0) {
            return { success: false, message: 'Invalid target' };
        }

        player.ammunition--;

        // Roll dice
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        let baseDamage = die1 + die2 + player.ship.attackBonus;

        // Apply damage modifiers from cards/effects
        let damageBonus = 0;
        let damageMultiplier = 1;

        const damageBonusEffect = player.effects.find(e => e.type === 'damageBonus');
        if (damageBonusEffect) {
            damageBonus += damageBonusEffect.value;
            player.effects = player.effects.filter(e => e !== damageBonusEffect);
        }

        const damageMultEffect = player.effects.find(e => e.type === 'damageMultiplier');
        if (damageMultEffect) {
            damageMultiplier *= damageMultEffect.value;
            player.effects = player.effects.filter(e => e !== damageMultEffect);
        }

        const damagePenalty = player.effects.find(e => e.type === 'damagePenalty');
        if (damagePenalty) {
            damageBonus -= damagePenalty.value;
            player.effects = player.effects.filter(e => e !== damagePenalty);
        }

        let totalDamage = (baseDamage + damageBonus) * damageMultiplier;

        // Apply defense
        const defenseReduction = target.ship.defense / 100;
        totalDamage = totalDamage * (1 - defenseReduction);

        // Apply maneuver
        if (target.maneuvering) {
            let maneuverReduction = GAME_CONSTANTS.BASE_MANEUVER_REDUCTION;
            
            // Stormrider buff
            if (target.ship.id === 'stormrider') {
                maneuverReduction = 0.4;
            }
            
            if (target.hasManeuverBonus) {
                maneuverReduction += 0.1;
                target.hasManeuverBonus = false;
            }

            totalDamage = totalDamage * (1 - maneuverReduction);
            this.log(`${target.name} maneuvered and reduced damage by ${Math.round(maneuverReduction * 100)}%!`);
        }

        // Apply target's damage reduction effects
        const reductionEffect = target.effects.find(e => e.type === 'damageReduction');
        if (reductionEffect) {
            totalDamage = totalDamage * (1 - reductionEffect.value);
            target.effects = target.effects.filter(e => e !== reductionEffect);
            this.log(`${target.name}'s hull plating absorbed some damage!`);
        }

        totalDamage = Math.floor(totalDamage);

        // Apply damage
        target.ship.hp = Math.max(0, target.ship.hp - totalDamage);
        target.lastDamageTaken = totalDamage;

        this.log(`💥 ${player.name} fires at ${target.name}! Rolled ${die1}+${die2}, dealt ${totalDamage} damage! (${target.ship.hp}/${target.ship.maxHp} HP remaining)`);

        // Crimson Kraken retaliation
        if (target.ship.id === 'crimsonKraken' && totalDamage > 0) {
            player.ship.hp = Math.max(0, player.ship.hp - 3);
            this.log(`⚡ Vengeful Wrath! ${player.name} takes 3 retaliation damage! (${player.ship.hp}/${player.ship.maxHp} HP)`);
        }

        // Apply burn effect if present
        const burnEffect = player.effects.find(e => e.type === 'burn');
        if (burnEffect) {
            target.effects.push({
                type: 'burn',
                damage: burnEffect.damage,
                duration: burnEffect.duration
            });
            this.log(`🔥 ${target.name} is burning! ${burnEffect.damage} damage per round for ${burnEffect.duration} rounds.`);
            player.effects = player.effects.filter(e => e !== burnEffect);
        }

        // Apply powder keg recoil
        const recoilEffect = player.effects.find(e => e.recoil);
        if (recoilEffect) {
            player.ship.hp = Math.max(0, player.ship.hp - recoilEffect.recoil);
            this.log(`💣 Powder Keg recoil! ${player.name} takes ${recoilEffect.recoil} damage! (${player.ship.hp}/${player.ship.maxHp} HP)`);
        }

        return {
            success: true,
            message: `Dealt ${totalDamage} damage!`,
            damage: totalDamage,
            dice: { die1, die2 }
        };
    }

    actionRepair(player) {
        // Check if at full HP
        if (player.ship.hp >= player.ship.maxHp) {
            return { success: false, message: 'Cannot repair: Already at full HP' };
        }
        
        // Check if repaired last round without taking new damage
        if (player.lastRepairRound === this.currentRound - 1 && player.lastDamageTaken === 0) {
            return { success: false, message: 'Cannot repair: Repaired last turn without taking new damage' };
        }

        // Roll dice for repair amount
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        let healAmount = die1 + die2;

        // Azure Wave buff - adds +2 to repair rolls
        if (player.ship.id === 'azureWave') {
            healAmount += 2;
        }

        const oldHp = player.ship.hp;
        player.ship.hp = Math.min(player.ship.maxHp, player.ship.hp + healAmount);
        const actualHeal = player.ship.hp - oldHp;

        // Reduce crew capacity temporarily
        const activeCrew = player.crew.filter(c => c.active);
        if (activeCrew.length > 0) {
            activeCrew[activeCrew.length - 1].active = false;
        }

        player.lastRepairRound = this.currentRound;

        this.log(`🔧 ${player.name} repairs! Rolled ${die1}+${die2}, healed ${actualHeal} HP! (${player.ship.hp}/${player.ship.maxHp} HP)`);

        return { success: true, message: `Repaired ${actualHeal} HP!`, healed: actualHeal, dice: { die1, die2 } };
    }

    actionPlunder(player) {
        let drawCount = 1;

        // Golden Harpoon buff
        if (player.ship.id === 'goldenHarpoon') {
            drawCount = 2;
        }

        const drawnCards = [];
        for (let i = 0; i < drawCount; i++) {
            const card = this.drawCard(player, 'loot');
            if (card) drawnCards.push(card);
        }

        if (drawnCards.length === 0) {
            return { success: false, message: 'Loot deck is empty!' };
        }

        this.log(`💰 ${player.name} plunders and draws ${drawnCards.length} loot card(s)!`);

        return { success: true, message: 'Drew loot!', cards: drawnCards };
    }

    actionReload(player) {
        player.ammunition += GAME_CONSTANTS.RELOAD_AMOUNT;
        player.cannotManeuverNext = true;

        this.log(`💣 ${player.name} reloads and gains ${GAME_CONSTANTS.RELOAD_AMOUNT} ammunition! (Total: ${player.ammunition})`);

        return { success: true, message: `Gained ${GAME_CONSTANTS.RELOAD_AMOUNT} ammunition!` };
    }

    actionManeuver(player) {
        if (player.cannotManeuverNext) {
            return { success: false, message: 'Cannot maneuver this turn after reloading!' };
        }

        // Roll dice for maneuver effectiveness
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const total = die1 + die2;

        player.maneuvering = true;

        // Critical success on 10+ gives bonus damage reduction
        if (total >= 10) {
            player.hasManeuverBonus = true;
            this.log(`⛵ ${player.name} maneuvers expertly! Rolled ${die1}+${die2}=${total} - CRITICAL! Extra damage reduction!`);
            return { success: true, message: 'Critical maneuver! Enhanced defense!', dice: { die1, die2 }, critical: true };
        } else {
            this.log(`⛵ ${player.name} maneuvers to evade! Rolled ${die1}+${die2}=${total}`);
            return { success: true, message: 'Maneuvering for defense!', dice: { die1, die2 } };
        }
    }

    // Card management
    drawCard(player, deckType) {
        if (this.decks[deckType].length === 0) {
            this.log(`${deckType} deck is empty!`);
            return null;
        }

        if (player.hand.length >= GAME_CONSTANTS.MAX_HAND_SIZE) {
            this.log(`${player.name}'s hand is full!`);
            return null;
        }

        const card = this.decks[deckType].shift();
        player.hand.push(card);
        return card;
    }

    playCard(playerId, cardId, targetId = null) {
        const player = this.getPlayer(playerId);
        if (!player) return { success: false, message: 'Player not found' };

        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            return { success: false, message: 'Card not in hand' };
        }

        const card = player.hand[cardIndex];
        player.hand.splice(cardIndex, 1);

        this.log(`🃏 ${player.name} plays ${card.name}!`);

        return this.applyCardEffect(player, card, targetId);
    }

    applyCardEffect(player, card, targetId) {
        const effect = card.effect;
        let message = '';

        switch (effect.type) {
            case 'damageBonus':
                player.effects.push({ type: 'damageBonus', value: effect.value, recoil: effect.recoil });
                message = `Next attack deals +${effect.value} damage!`;
                break;

            case 'damageMultiplier':
                player.effects.push({ type: 'damageMultiplier', value: effect.value });
                message = `Next attack deals ${Math.round((effect.value - 1) * 100)}% more damage!`;
                break;

            case 'heal':
                const die1 = Math.floor(Math.random() * 6) + 1;
                const die2 = Math.floor(Math.random() * 6) + 1;
                const healRoll = die1 + die2;
                const oldHp = player.ship.hp;
                player.ship.hp = Math.min(player.ship.maxHp, player.ship.hp + healRoll);
                message = `Healed ${player.ship.hp - oldHp} HP! (Rolled ${die1}+${die2})`;
                break;

            case 'healAndCleanse':
                const healDie1 = Math.floor(Math.random() * 6) + 1;
                const healDie2 = Math.floor(Math.random() * 6) + 1;
                const healAmount = healDie1 + healDie2;
                const healed = Math.min(healAmount, player.ship.maxHp - player.ship.hp);
                player.ship.hp += healed;
                player.effects = player.effects.filter(e => e.type !== 'burn' && e.type !== 'damagePenalty');
                message = `Healed ${healed} HP (Rolled ${healDie1}+${healDie2}) and cleansed all debuffs!`;
                break;

            case 'ammunition':
                player.ammunition += effect.value;
                message = `Gained ${effect.value} ammunition!`;
                break;

            case 'gold':
                player.gold += effect.value;
                message = `Gained ${effect.value} gold!`;
                break;

            case 'addCrew':
                player.crew.push({ active: player.crew.filter(c => c.active).length < player.ship.crewCapacity });
                message = 'Added 1 crew member!';
                break;

            case 'mapFragment':
                player.mapFragments++;
                message = `Found a map fragment! (${player.mapFragments}/${GAME_CONSTANTS.MAP_FRAGMENTS_TO_WIN})`;
                break;

            case 'damageReduction':
                player.effects.push({ type: 'damageReduction', value: effect.value, duration: effect.duration });
                message = `Next incoming damage reduced by ${Math.round(effect.value * 100)}%!`;
                break;

            case 'maxHpIncrease':
                player.ship.maxHp += effect.value;
                player.ship.hp += effect.value;
                message = `Maximum HP increased by ${effect.value}!`;
                break;

            case 'burn':
                player.effects.push({
                    type: 'burn',
                    damage: effect.damage,
                    duration: effect.duration,
                    bonusDamage: effect.bonusDamage
                });
                message = `Next attack applies burn effect!`;
                break;

            case 'skipTurn':
                const target = this.getPlayer(targetId);
                if (target) {
                    target.skipNextTurn = true;
                    message = `${target.name} will skip their next turn!`;
                }
                break;

            case 'discardRandom':
                const discardTarget = this.getPlayer(targetId);
                if (discardTarget && discardTarget.hand.length > 0) {
                    const randomIndex = Math.floor(Math.random() * discardTarget.hand.length);
                    const discarded = discardTarget.hand.splice(randomIndex, 1)[0];
                    message = `${discardTarget.name} discarded ${discarded.name}!`;
                }
                break;

            case 'damagePenalty':
                player.effects.push({ type: 'damagePenalty', value: effect.value, duration: effect.duration });
                message = `Next attack deals ${effect.value} less damage.`;
                break;

            case 'discard':
                message = 'Card discarded.';
                break;

            default:
                message = 'Card effect applied!';
        }

        return { success: true, message };
    }

    drawEventCard() {
        if (this.decks.event.length === 0) {
            this.log('Event deck is empty!');
            return;
        }

        const event = this.decks.event.shift();
        this.currentEvent = event;
        this.log(`⚡ EVENT: ${event.name} - ${event.description}`);
        
        // Some events apply immediately
        this.applyEventEffect(event);
    }

    applyEventEffect(event) {
        // Event effects are handled in the resolution phase or next turn
        // This is a placeholder for immediate effects
    }

    // Utility methods
    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }

    checkWinConditions() {
        const alivePlayers = this.players.filter(p => p.ship.hp > 0);
        
        // Last ship standing
        if (alivePlayers.length === 1) {
            return { type: 'lastStanding', player: alivePlayers[0] };
        }

        // All ships destroyed
        if (alivePlayers.length === 0) {
            return { type: 'draw', player: null };
        }

        // Map fragments
        const mapWinner = this.players.find(p => p.mapFragments >= GAME_CONSTANTS.MAP_FRAGMENTS_TO_WIN);
        if (mapWinner) {
            return { type: 'mapFragments', player: mapWinner };
        }

        // Gold threshold
        const goldWinner = this.players.find(p => p.gold >= GAME_CONSTANTS.GOLD_WIN_THRESHOLD);
        if (goldWinner) {
            return { type: 'gold', player: goldWinner };
        }

        return null;
    }

    log(message) {
        this.gameLog.push({
            round: this.currentRound,
            message,
            timestamp: Date.now()
        });
    }

    getGameState() {
        const state = {
            players: this.players,
            currentRound: this.currentRound,
            currentPhase: this.currentPhase,
            turnOrder: this.turnOrder,
            currentPlayerIndex: this.currentPlayerIndex,
            priorityRolled: this.priorityRolled,
            decks: this.decks,
            activeEffects: this.activeEffects,
            currentEvent: this.currentEvent,
            gameLog: this.gameLog.slice(-20) // Last 20 log entries
        };
        
        // Return a deep copy so callers don't mutate internal state references
        return JSON.parse(JSON.stringify(state));
    }
}
