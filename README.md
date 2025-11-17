# ⚓ Raiders on Deck - Web Game

A fully functional web-based multiplayer pirate battle game based on the tabletop game concept.

## 🎮 Features

### ✅ Complete Game Implementation
- **All 6 Ships** with unique Captain Buffs
- **All Game Mechanics**: Fire, Repair, Plunder, Reload, Maneuver
- **Full Card System**: 15 Action/Item cards, 5 Loot cards, 5 Event cards, 15 Starter cards
- **Accurate Damage Calculation**: Includes Attack Bonus, Defense, Maneuver, and card effects
- **Crew System**: Active/Inactive crew management with reroll mechanics
- **Win Conditions**: Last Ship Standing, Map Fragments, Gold Victory

### 🌐 Multiplayer Support
- **Room-Based System**: Create or join rooms with 6-character codes
- **2-6 Players**: Support for multiple players per game
- **Real-time Sync**: LocalStorage-based synchronization (demo mode)
- **Host Controls**: Room creator can start the game

### 📚 Comprehensive Wiki
- **Game Rules**: Complete rulebook with turn structure and mechanics
- **Ship Guide**: Detailed stats and strategies for all ships
- **Actions Guide**: In-depth explanation of each action and consequences
- **Card Database**: Full catalog of all cards with effects
- **Crew Mechanics**: How crew tokens work
- **Strategy Tips**: Early/mid/late game tactics, combos, and advanced strategies

### 🎨 Pirate-Themed Design
- **Ocean Background**: Gradient blue ocean atmosphere
- **Wooden UI Elements**: Brown/gold themed panels and cards
- **Smooth Animations**: Damage shake, heal glow, dice rolling
- **Responsive Design**: Works on desktop and tablet (mobile-friendly)
- **Visual Feedback**: Active turn indicators, HP colors, effect highlighting

## 🚀 How to Play

### Starting the Game
1. Open `index.html` in a web browser
2. Choose "Create Room" or "Join Room"
3. **Create Room**: Enter your name, select max players, get a room code
4. **Join Room**: Enter your name and the 6-character room code
5. Wait for other players to join (minimum 2 players)
6. Host clicks "Start Game"

### Gameplay
1. **Priority Roll**: All players roll dice to determine turn order
2. **Your Turn**: Choose one action when it's your turn:
   - 🔥 **Fire Cannons**: Attack an opponent (costs 1 ammo)
   - 🔧 **Repair**: Heal HP (reduces crew temporarily)
   - 💰 **Plunder**: Draw a loot card
   - 💣 **Reload**: Gain 2 ammunition
   - ⛵ **Maneuver**: Reduce incoming damage
3. **Play Cards**: Click cards in your hand to use them
4. **Win**: Be the last ship standing, collect 3 map fragments, or reach 20 gold

## 📁 File Structure

```
index.html          - Main HTML structure
styles.css          - All styling and animations
gameData.js         - Ship definitions, card data, constants
multiplayer.js      - Room management and state sync
gameEngine.js       - Core game logic and mechanics
ui.js               - UI updates and interactions
wiki.js             - Game guide and card database
main.js             - Game controller and flow
```

## 🎯 Game Mechanics Implemented

### Actions with Consequences
- **Fire**: Costs ammunition, some cards add recoil
- **Repair**: Can't use consecutively, reduces active crew
- **Plunder**: Vulnerable while plundering
- **Reload**: Can't maneuver next turn
- **Maneuver**: Next attack loses attack bonus

### Damage Calculation
```
Base Damage = Dice Roll + Attack Bonus + Card Bonuses
Defense Reduction = Base Damage × (1 - Defense%)
Final Damage = Defense Reduction × (1 - Maneuver%)
```

### Crew System
- Each ship has a crew capacity
- Active crew can reroll dice during attacks
- Excess crew become inactive but can be activated later
- Some actions temporarily reduce active crew

### Card Effects
- Damage boosters (Enhanced Cannonballs, Explosive Shell, Powder Keg)
- Debuffs (Chain Shot, Fire Shot, Trap Net, Sabotage)
- Defense (Hull Plating, Smoke Bomb, Evasive Helmsman)
- Healing (Surgeon, Barrels of Rum)
- Resources (Gold, Ammunition, Extra Crew)
- Special (Treasure Map Fragments)

### Captain Buffs
Each ship has a unique ability:
- **Black Serpent**: Free reroll per attack
- **Stormrider**: 40% maneuver reduction (vs 20%)
- **Golden Harpoon**: Draw 2 loot cards, keep 1
- **Crimson Kraken**: Retaliate 3 damage when hit
- **Azure Wave**: Repair 8 HP instead of 5
- **Silent Corsair**: Ignore one Event card per game

## 🔧 Technical Details

### Multiplayer Implementation
Uses localStorage for demo purposes. In production, replace `multiplayer.js` with:
- WebSocket server for real-time communication
- Backend database for persistent rooms
- Player authentication

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Edge, Safari)
- ES6+ JavaScript features
- CSS Grid and Flexbox layouts
- LocalStorage API

## 🎲 Design Philosophy

### Balance
- Each ship has strengths and weaknesses
- No dominant strategy
- Action consequences prevent repetitive play
- Card effects are powerful but limited

### Accessibility
- Simple 5-action system
- Clear visual feedback
- Comprehensive wiki for learning
- Turn-based allows time to think

### Scalability
- 2-6 players supported
- No physical board needed
- Easy to add new ships/cards
- Expandable with future updates

## 🌟 Future Enhancements

Potential additions:
- Real WebSocket multiplayer
- AI opponents for single-player
- Campaign mode with story
- Additional ship sets
- Weather system (visual effects)
- Sound effects and music
- Leaderboards and statistics
- Mobile app version

## 📖 Credits

Based on the "Raiders on Deck" tabletop game concept.
Web implementation by GitHub Copilot.

## 🏴‍☠️ Enjoy the High Seas!

Set sail, command your crew, and become the ultimate pirate captain!

---

**Note**: This is a demo using localStorage for multiplayer. For production use, implement proper backend with WebSockets or similar real-time technology.
