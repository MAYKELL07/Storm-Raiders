# 🎮 QUICK START GUIDE

## Testing the Game (Single Computer)

To test multiplayer on one computer:

1. **Open the game** in your browser (index.html)
2. **Create a room**:
   - Click "Create Room"
   - Enter a name (e.g., "Captain Jack")
   - Click "Create Room"
   - **Write down the 6-character room code**

3. **Open a second browser window** (or incognito/private window):
   - Go to the same index.html file
   - Click "Join Room"
   - Enter a different name (e.g., "Captain Morgan")
   - Enter the room code from step 2
   - Click "Join Room"

4. **Start the game**:
   - In the first window (host), click "Start Game"
   - Both windows will load the game screen

5. **Play the game**:
   - Each player rolls dice for priority
   - Take turns choosing actions
   - Click cards in your hand to play them
   - Attack opponents to win!

## 📚 Learning the Game

Click the "Game Wiki" button from the main menu to access:
- Complete game rules
- Ship abilities and strategies
- Card database
- Action explanations
- Strategic tips

## 🎯 Quick Rules Reminder

### Your Turn Options:
1. **🔥 Fire Cannons** - Attack an enemy (needs 1 ammo)
2. **🔧 Repair** - Heal HP (can't use twice in a row)
3. **💰 Plunder** - Draw a loot card
4. **💣 Reload** - Get 2 ammunition
5. **⛵ Maneuver** - Reduce next incoming damage

### Win by:
- ⚔️ Sinking all enemy ships
- 🗺️ Collecting 3 treasure map fragments
- 💰 Reaching 20 gold

### Important:
- Each action has consequences!
- Read the wiki for detailed mechanics
- Use crew tokens to reroll dice during attacks
- Play cards from your hand for powerful effects

## 🐛 Troubleshooting

**"Room not found"**: Make sure you typed the code correctly (6 characters)

**Game not syncing**: Refresh both browser windows and rejoin the room

**Can't see updates**: LocalStorage is used for demo - both windows need to be open on the same computer

**Want to reset**: Clear browser localStorage or use incognito mode

## 🚀 For Production Use

To make this a real online multiplayer game:
1. Set up a Node.js server with Socket.io or similar
2. Replace `multiplayer.js` with WebSocket implementation
3. Add a database for persistent rooms
4. Deploy to a hosting service (Heroku, Vercel, etc.)

## 🎨 Customization

All game data is in `gameData.js`:
- Add new ships
- Create new cards
- Modify stats and balance
- Add new captain buffs

## 💡 Tips

- **Save the room code** - you'll need it to join!
- **Try different ships** - each has unique strengths
- **Read captain buffs** - they can turn the tide of battle
- **Manage resources** - don't run out of ammo!
- **Use the wiki** - it has all the details

---

**Enjoy commanding your pirate ship! ⚓🏴‍☠️**
