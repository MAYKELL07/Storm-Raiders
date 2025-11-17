# ⚓ Action Availability Guide

## Why Are My Actions Disabled?

### 🔥 **Fire Cannons** (Disabled)

**Reason:** You have no ammunition!

**Solution:**
- Use the **Reload** action to gain 2 ammunition
- Play **Ammunition Crate** card (gives 4 ammo)
- Start with 3 ammo at game start

**Tip:** Always keep at least 1 ammo in reserve for emergency attacks.

---

### 🔧 **Repair** (Disabled)

**Reasons:**

1. **Already at Full HP**
   - You cannot repair when HP = Max HP
   - Solution: Only repair when damaged

2. **Repaired Last Turn Without Taking Damage**
   - You cannot repair on consecutive turns UNLESS you took damage
   - This prevents infinite healing loops
   
**When Repair IS Available:**
- ✅ HP < Max HP AND first time repairing
- ✅ HP < Max HP AND you took damage since last repair
- ✅ HP < Max HP AND you didn't repair last round

**Example:**
- Round 1: You repair (HP: 80 → 85)
- Round 2: You CANNOT repair (consecutive repair blocked)
- Round 3: You CAN repair again (enough time passed)

OR

- Round 1: You repair (HP: 80 → 85)
- Round 2: Enemy attacks you (HP: 85 → 75)
- Round 2: You CAN repair (took damage, so consecutive restriction lifted)

---

### 💰 **Plunder** (Always Available on Your Turn)

Plunder is never disabled! Use it to draw loot cards.

**Note:** Golden Harpoon's captain buff lets you draw 2 and keep 1.

---

### 💣 **Reload** (Always Available on Your Turn)

Reload is never disabled! Use it to gain 2 ammunition.

**Important Consequence:**
- ⚠️ After reloading, you CANNOT Maneuver on your next turn
- Your crew is exhausted from loading cannons

---

### ⛵ **Maneuver** (Disabled)

**Reason:** Cannot maneuver after reloading

**Explanation:**
- If you chose **Reload** on your previous turn, you cannot Maneuver on your current turn
- This represents crew exhaustion from loading heavy ammunition

**When Maneuver IS Available:**
- ✅ You didn't reload on your previous turn
- ✅ It's your turn to act

---

## General Reasons Actions Are Disabled

### 🚫 **Not Your Turn**
All actions are disabled when it's not your turn.

**How to know it's your turn:**
- Top bar shows "Your Name's Turn"
- Your ship card has a golden glow
- Action buttons become clickable

### 🎲 **Priority Roll Phase**
At the start of each round, you must roll dice for priority before actions are available.

---

## Quick Reference Table

| Action | Can Be Disabled? | Reasons | Solutions |
|--------|------------------|---------|-----------|
| 🔥 Fire | Yes | No ammunition | Reload or play Ammo cards |
| 🔧 Repair | Yes | Full HP or consecutive repair | Wait or take damage |
| 💰 Plunder | No | Always available | - |
| 💣 Reload | No | Always available | - |
| ⛵ Maneuver | Yes | Reloaded last turn | Don't reload before maneuvering |

---

## Tips to Avoid Disabled Actions

1. **Manage Ammunition:** Don't spam attacks without reloading
2. **Plan Repairs:** Don't repair at full HP or twice in a row
3. **Reload Timing:** Reload when you're safe, not when you need to dodge
4. **Check Turn Order:** Know when your turn is coming up

---

## Visual Feedback

**Hover over disabled buttons** to see a tooltip explaining why they're disabled!

**Button States:**
- ✅ **Bright & Clickable** - Action available
- 🚫 **Dim & Grayed Out** - Action disabled (hover for reason)
- 💡 **Hover Tooltip** - Shows specific reason for being disabled

---

## Common Scenarios

### Scenario 1: "Why can't I repair?"
- Check your HP bar
- If HP = Max HP → You're already at full health!
- If HP < Max HP → Did you repair last turn? If yes, you need to wait or take damage

### Scenario 2: "Why can't I fire?"
- Check your ammunition counter (💣 icon on ship card)
- If Ammo = 0 → Use Reload action or play Ammunition Crate card

### Scenario 3: "Why can't I maneuver?"
- Did you Reload on your previous turn?
- If yes → You must wait one turn before maneuvering again

### Scenario 4: "All my actions are disabled!"
- It's probably not your turn yet
- Wait for your turn in the turn order
- Check the top bar for current player

---

## Game Balance Reasoning

These restrictions exist to:
1. **Prevent Spam:** Can't fire forever without ammo
2. **Force Choices:** Can't repair forever to become invincible
3. **Add Strategy:** Must plan ahead (reload vs maneuver timing)
4. **Balance Ships:** Ships with more crew capacity have better rerolls, offsetting attack bonuses

---

## Need Help?

Check the **Game Wiki** (accessible from main menu or in-game) for:
- Complete game rules
- Ship abilities
- Card effects
- Advanced strategies

**Remember:** Every action has consequences! Plan ahead and manage your resources wisely. ⚓
