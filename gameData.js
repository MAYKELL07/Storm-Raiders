// Game Data - Ships, Cards, and Constants

const SHIPS = {
    blackSerpent: {
        id: 'blackSerpent',
        name: 'Black Serpent',
        hp: 100,
        maxHp: 100,
        attackBonus: 2,
        defense: 0,
        crewCapacity: 3,
        captainBuff: {
            name: 'Savvy Captain',
            description: 'Once per attack, reroll one die without spending a crew token.'
        },
        description: 'Balanced attacker with reliable rerolls.'
    },
    stormrider: {
        id: 'stormrider',
        name: 'Stormrider',
        hp: 110,
        maxHp: 110,
        attackBonus: 0,
        defense: 5,
        crewCapacity: 4,
        captainBuff: {
            name: 'Wave Master',
            description: 'When you choose Maneuver, reduce incoming damage by 40% instead of 20%.'
        },
        description: 'Durable defender, less offensive punch.'
    },
    goldenHarpoon: {
        id: 'goldenHarpoon',
        name: 'Golden Harpoon',
        hp: 90,
        maxHp: 90,
        attackBonus: 3,
        defense: 0,
        crewCapacity: 2,
        captainBuff: {
            name: 'Treasure Fiend',
            description: 'When you Plunder, draw two Loot cards and keep one.'
        },
        description: 'Fast, fragile, loot-focused.'
    },
    crimsonKraken: {
        id: 'crimsonKraken',
        name: 'Crimson Kraken',
        hp: 100,
        maxHp: 100,
        attackBonus: 1,
        defense: 10,
        crewCapacity: 3,
        captainBuff: {
            name: 'Vengeful Wrath',
            description: 'Whenever you take damage, the attacker suffers 3 damage.'
        },
        description: 'Moderate stats with reactive damage.'
    },
    azureWave: {
        id: 'azureWave',
        name: 'Azure Wave',
        hp: 95,
        maxHp: 95,
        attackBonus: 2,
        defense: 5,
        crewCapacity: 4,
        captainBuff: {
            name: 'Master Surgeon',
            description: 'When you Repair, heal 8 HP instead of 5 HP.'
        },
        description: 'Mixed offense/defense with enhanced healing.'
    },
    silentCorsair: {
        id: 'silentCorsair',
        name: 'Silent Corsair',
        hp: 85,
        maxHp: 85,
        attackBonus: 3,
        defense: 0,
        crewCapacity: 3,
        captainBuff: {
            name: 'Shadow Veil',
            description: 'Once per game, ignore the effect of an Event card.'
        },
        description: 'High risk, high reward with a one-time escape.'
    }
};

const ACTION_CARDS = [
    {
        id: 'enhancedCannonballs',
        name: 'Enhanced Cannonballs',
        type: 'Action',
        category: 'action',
        description: 'Adds +3 damage to your next attack.',
        effect: { type: 'damageBonus', value: 3 }
    },
    {
        id: 'explosiveShell',
        name: 'Explosive Shell',
        type: 'Action',
        category: 'action',
        description: 'Your next attack deals +50% damage.',
        effect: { type: 'damageMultiplier', value: 1.5 }
    },
    {
        id: 'chainShot',
        name: 'Chain Shot',
        type: 'Action',
        category: 'action',
        description: 'Target loses their Maneuver action on their next turn.',
        effect: { type: 'disableAction', action: 'maneuver', duration: 1 }
    },
    {
        id: 'fireShot',
        name: 'Fire Shot',
        type: 'Action',
        category: 'action',
        description: 'Deal +2 damage and apply Burn (2 damage for 3 rounds).',
        effect: { type: 'burn', damage: 2, duration: 3, bonusDamage: 2 }
    },
    {
        id: 'hullPlating',
        name: 'Hull Plating',
        type: 'Item',
        category: 'action',
        description: 'Reduce the next incoming damage by 50%.',
        effect: { type: 'damageReduction', value: 0.5, duration: 1 }
    },
    {
        id: 'reinforcedHull',
        name: 'Reinforced Hull',
        type: 'Item',
        category: 'action',
        description: 'Permanently increase your maximum HP by 10.',
        effect: { type: 'maxHpIncrease', value: 10 }
    },
    {
        id: 'evasiveHelmsman',
        name: 'Evasive Helmsman',
        type: 'Item',
        category: 'action',
        description: 'Your next Maneuver blocks all additional effects (Burn, Chain, Sabotage).',
        effect: { type: 'perfectManeuver', duration: 1 }
    },
    {
        id: 'surgeon',
        name: 'Surgeon',
        type: 'Item',
        category: 'action',
        description: 'Recover 15 HP.',
        effect: { type: 'heal', value: 15 }
    },
    {
        id: 'extraCrew',
        name: 'Extra Crew',
        type: 'Item',
        category: 'action',
        description: 'Gain 1 crew token (active if capacity allows, otherwise becomes inactive).',
        effect: { type: 'addCrew', value: 1 }
    },
    {
        id: 'smokeBomb',
        name: 'Smoke Bomb',
        type: 'Item',
        category: 'action',
        description: 'Cancel an incoming attack completely.',
        effect: { type: 'cancelAttack' }
    },
    {
        id: 'trapNet',
        name: 'Trap Net',
        type: 'Action',
        category: 'action',
        description: 'Target player skips their next turn.',
        effect: { type: 'skipTurn', duration: 1 }
    },
    {
        id: 'spyglass',
        name: 'Spyglass',
        type: 'Item',
        category: 'action',
        description: 'Look at the top two Loot cards, keep one.',
        effect: { type: 'peekLoot', count: 2 }
    },
    {
        id: 'sabotage',
        name: 'Sabotage',
        type: 'Action',
        category: 'action',
        description: 'Target discards one random card.',
        effect: { type: 'discardRandom' }
    },
    {
        id: 'powderKeg',
        name: 'Powder Keg',
        type: 'Item',
        category: 'action',
        description: 'Your next attack gains +10 damage but you take 5 damage in recoil.',
        effect: { type: 'damageBonus', value: 10, recoil: 5 }
    },
    {
        id: 'anchorDrop',
        name: 'Anchor Drop',
        type: 'Action',
        category: 'action',
        description: 'Prevent all Maneuver and movement-related effects next round.',
        effect: { type: 'disableManeuver', global: true, duration: 1 }
    }
];

const LOOT_CARDS = [
    {
        id: 'gold5',
        name: '5 Gold',
        type: 'Resource',
        category: 'loot',
        description: 'Gain 5 gold.',
        effect: { type: 'gold', value: 5 }
    },
    {
        id: 'barrelsOfRum',
        name: 'Barrels of Rum',
        type: 'Resource',
        category: 'loot',
        description: 'Heal 10 HP and remove all debuffs (Burn, Chain, etc.).',
        effect: { type: 'healAndCleanse', value: 10 }
    },
    {
        id: 'ammunitionCrate',
        name: 'Ammunition Crate',
        type: 'Resource',
        category: 'loot',
        description: 'Gain 4 ammunition tokens.',
        effect: { type: 'ammunition', value: 4 }
    },
    {
        id: 'reinforcedRope',
        name: 'Reinforced Rope',
        type: 'Item',
        category: 'loot',
        description: 'Negate the next Trap Net or Sabotage used on you.',
        effect: { type: 'negateDebuff', duration: 1 }
    },
    {
        id: 'treasureMapFragment',
        name: 'Treasure Map Fragment',
        type: 'Special',
        category: 'loot',
        description: 'Collect three fragments to instantly win the game.',
        effect: { type: 'mapFragment' }
    }
];

const EVENT_CARDS = [
    {
        id: 'stormFront',
        name: 'Storm Front',
        type: 'Event',
        category: 'event',
        description: 'All ships take 5 damage unless they choose Maneuver next turn.',
        effect: { type: 'conditionalDamage', damage: 5, condition: 'notManeuvering' }
    },
    {
        id: 'krakenTentacle',
        name: 'Kraken Tentacle',
        type: 'Event',
        category: 'event',
        description: 'Randomly deals 12 damage to one ship (highest roll is hit).',
        effect: { type: 'randomDamage', damage: 12 }
    },
    {
        id: 'merchantShip',
        name: 'Merchant Ship',
        type: 'Event',
        category: 'event',
        description: 'First player to Plunder twice gains 10 gold.',
        effect: { type: 'plunderReward', gold: 10, plundersNeeded: 2 }
    },
    {
        id: 'ghostShip',
        name: 'Ghost Ship',
        type: 'Event',
        category: 'event',
        description: 'All attacks deal +5 damage this round.',
        effect: { type: 'globalDamageBonus', value: 5, duration: 1 }
    },
    {
        id: 'calmWaters',
        name: 'Calm Waters',
        type: 'Event',
        category: 'event',
        description: 'All damage this round is reduced by 50%.',
        effect: { type: 'globalDamageReduction', value: 0.5, duration: 1 }
    }
];

const STARTER_CARDS = [
    // Positive cards
    {
        id: 'starterAmmoCrate',
        name: 'Ammunition Crate',
        type: 'Resource',
        category: 'starter',
        description: 'Gain 2 ammunition tokens.',
        effect: { type: 'ammunition', value: 2 }
    },
    {
        id: 'starterHullPatch',
        name: 'Hull Patch',
        type: 'Item',
        category: 'starter',
        description: 'Restore 5 HP.',
        effect: { type: 'heal', value: 5 }
    },
    {
        id: 'starterCrewMate',
        name: 'Crew Mate',
        type: 'Item',
        category: 'starter',
        description: 'Gain 1 crew token.',
        effect: { type: 'addCrew', value: 1 }
    },
    {
        id: 'starterWeakCannons',
        name: 'Weak Cannonballs',
        type: 'Action',
        category: 'starter',
        description: 'Adds +1 damage to your next attack.',
        effect: { type: 'damageBonus', value: 1 }
    },
    {
        id: 'starterSpyglass',
        name: 'Spyglass Peek',
        type: 'Item',
        category: 'starter',
        description: 'Look at the top Loot card.',
        effect: { type: 'peekLoot', count: 1 }
    },
    {
        id: 'starterArmorPlating',
        name: 'Basic Armor Plating',
        type: 'Item',
        category: 'starter',
        description: 'Reduce next incoming damage by 20%.',
        effect: { type: 'damageReduction', value: 0.2, duration: 1 }
    },
    {
        id: 'starterGrapplingHook',
        name: 'Grappling Hook',
        type: 'Action',
        category: 'starter',
        description: 'Your next attack cannot be dodged by Maneuver.',
        effect: { type: 'undodgeable', duration: 1 }
    },
    {
        id: 'starterWindGust',
        name: 'Wind Gust',
        type: 'Item',
        category: 'starter',
        description: 'Your next Maneuver is 30% more effective.',
        effect: { type: 'maneuverBonus', value: 0.1, duration: 1 }
    },
    {
        id: 'starterRumFlask',
        name: 'Rum Flask',
        type: 'Resource',
        category: 'starter',
        description: 'Restore 3 HP.',
        effect: { type: 'heal', value: 3 }
    },
    {
        id: 'starterGold2',
        name: '2 Gold',
        type: 'Resource',
        category: 'starter',
        description: 'Gain 2 gold.',
        effect: { type: 'gold', value: 2 }
    },
    
    // Negative cards
    {
        id: 'starterLeakyBarrel',
        name: 'Leaky Barrel',
        type: 'Setback',
        category: 'starter',
        description: 'Take 2 damage from spoiled supplies.',
        effect: { type: 'damage', value: 2 }
    },
    {
        id: 'starterJammedCannon',
        name: 'Jammed Cannon',
        type: 'Setback',
        category: 'starter',
        description: 'Your first attack deals -2 damage.',
        effect: { type: 'damagePenalty', value: 2, duration: 1 }
    },
    {
        id: 'starterLazyCrew',
        name: 'Lazy Crew',
        type: 'Setback',
        category: 'starter',
        description: 'Cannot use crew rerolls on your first turn.',
        effect: { type: 'disableRerolls', duration: 1 }
    },
    {
        id: 'starterWetGunpowder',
        name: 'Wet Gunpowder',
        type: 'Setback',
        category: 'starter',
        description: 'Your first attack deals -3 damage.',
        effect: { type: 'damagePenalty', value: 3, duration: 1 }
    },
    {
        id: 'starterRottenFood',
        name: 'Rotten Food',
        type: 'Setback',
        category: 'starter',
        description: 'Discard this card immediately.',
        effect: { type: 'discard' }
    }
];

// Combine all card pools
const ALL_CARDS = {
    action: [...ACTION_CARDS],
    loot: [...LOOT_CARDS],
    event: [...EVENT_CARDS],
    starter: [...STARTER_CARDS]
};

// Game Constants
const GAME_CONSTANTS = {
    STARTING_AMMUNITION: 3,
    STARTING_GOLD: 0,
    STARTING_HAND_SIZE: 3,
    BASE_REPAIR_AMOUNT: 5,
    RELOAD_AMOUNT: 2,
    BASE_MANEUVER_REDUCTION: 0.2,
    GOLD_WIN_THRESHOLD: 20,
    MAP_FRAGMENTS_TO_WIN: 3,
    MAX_HAND_SIZE: 10
};

// Utility function to create a shuffled deck
function createDeck(cardArray, copies = 1) {
    const deck = [];
    for (let i = 0; i < copies; i++) {
        deck.push(...cardArray.map(card => ({ ...card })));
    }
    return shuffleArray(deck);
}

// Fisher-Yates shuffle
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random ship
function getRandomShip() {
    const shipKeys = Object.keys(SHIPS);
    const randomKey = shipKeys[Math.floor(Math.random() * shipKeys.length)];
    return { ...SHIPS[randomKey] };
}

// Get ship by ID
function getShipById(id) {
    return SHIPS[id] ? { ...SHIPS[id] } : null;
}
