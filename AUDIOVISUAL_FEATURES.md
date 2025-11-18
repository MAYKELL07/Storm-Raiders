# Raiders on Deck - Audiovisual Features Guide

## 🎵 Sound Effects

The game now includes immersive sound effects for all major actions:

### Action Sounds
- **🎯 Cannon Fire**: Explosive cannon blast when attacking
- **🔧 Repair**: Hammer and wood creaking sounds during repairs
- **⚓ Reload**: Metal clanking of ammunition being loaded
- **🌊 Maneuver**: Wind and sail sounds when maneuvering
- **💰 Plunder**: Coin jingles and card shuffling
- **🎲 Dice Roll**: Dice rolling sound during priority phase
- **💥 Damage Impact**: Wood splintering and impact sounds
- **🔥 Fire/Burn**: Crackling fire for burning effects
- **💣 Explosion**: Large explosion for special attacks
- **🎺 Victory**: Fanfare and ship bell for game victory

### Sound Control
- Click the 🔊 button in the top-right corner to toggle sound on/off
- Sounds automatically adjust volume for different effects
- All sounds are loaded from free public domain sources

## ✨ Visual Effects (VFX)

### Particle Systems

**Cannon Blast**
- Smoke particles emanating from firing ship
- Screen shake effect for impact
- Flash of light at point of fire

**Damage Impact**
- Wood splinters flying from damaged ship
- Red flash on hit ship
- Floating damage numbers showing exact damage dealt
- Screen shake proportional to damage

**Healing/Repair**
- Green sparkle particles rising from ship
- Floating green "+HP" numbers
- Gentle glow effect

**Coin/Gold Effects**
- Golden coins flying upward when plundering
- Multiple particle bursts for larger amounts
- Shimmering gold glow

**Water Splash**
- Blue water droplets when maneuvering
- Particle splash from ship sides
- Ocean spray effects

**Fire/Burn**
- Orange and yellow flame particles
- Continuous fire effect while burning
- Rising smoke particles

**Victory Confetti**
- Multi-colored celebration particles
- Continuous confetti rain effect
- Screen-wide particle explosion

### Floating Damage/Heal Numbers
- Red numbers with minus sign for damage: **-15**
- Green numbers with plus sign for healing: **+8**
- Numbers float upward and fade out
- Size indicates importance

### Screen Effects
- **Screen Shake**: Intensity varies by action (heavy for explosions, light for hits)
- **Flash Effects**: Brief colored flashes for major events
- **Glow Effects**: Particles with glowing auras for special effects

## 🎨 Enhanced Animations

### CSS Animations

**Title Animation**
- 3D rotating title entrance
- Scale and fade-in effect
- Preserve-3D perspective

**Button Animations**
- Pulse glow on hover for primary buttons
- Floating effect on ship cards
- Ready pulse for active action buttons
- Bounce-in for notifications

**HP Bar Animations**
- Smooth width transition when health changes
- Color transitions (green → yellow → red)
- Pulsing animation when HP is low

**Card Animations**
- Card draw animation with 3D rotation
- Slide-in effect for hand cards
- Hover float effect

**Dice Animations**
- Spinning dice during roll
- Bounce effect on landing
- Smooth number reveal

**Background Animation**
- Animated wave motion gradient
- Subtle color shifts
- Ocean atmosphere effect

### Interactive Animations

**Damage Flash**
- Brief brightness increase on damaged ship
- Red hue rotation
- Quick feedback for hits

**Gold Shine**
- Continuous shimmer on gold counter
- Pulsing glow effect
- Treasure emphasis

**Victory Sparkle**
- Rotating and scaling victory text
- Multi-layer glow shadows
- Continuous celebration effect

## 🎮 Integration with Gameplay

### Action-Triggered Effects

When you perform an action, you'll see and hear:

1. **Fire Cannons**
   - Cannon sound plays
   - Smoke particles from your ship
   - Screen shake
   - Projectile impact on target
   - Damage numbers float up
   - Target ship flashes red

2. **Repair**
   - Hammer/wood sounds
   - Green healing sparkles
   - "+HP" numbers
   - Gentle glow around ship

3. **Plunder**
   - Card shuffle sound
   - Coin jingle
   - Gold particles flying
   - Number indicates value

4. **Reload**
   - Metal clanking
   - Ammunition counter updates
   - Brief flash

5. **Maneuver**
   - Wind/sail sounds
   - Water splash particles
   - Ship position indicator

### Priority Roll Phase
- Dice rolling sound when you click "Roll Dice"
- Spinning dice animation
- Reveal with bounce effect
- All players see their rolls

### Victory
- Victory fanfare music
- Ship bell ringing
- Screen-wide confetti explosion
- Sparkling victory message
- Continuous celebration particles

## 🛠️ Technical Details

### Sound Manager (`sounds.js`)
- Preloads all sound effects on page load
- Handles volume control
- Graceful fallback if sounds fail to load
- Can play sound sequences with delays

### VFX Manager (`vfx.js`)
- Particle system with physics (gravity, velocity)
- Multiple particle shapes (circles, rectangles)
- Glow and blur effects
- Screen shake with intensity control
- Automatic cleanup of expired particles

### CSS Animations (`styles.css`)
- 20+ keyframe animations
- Smooth transitions
- Hardware-accelerated transforms
- Responsive to user actions

## 📱 Performance

- Particles are efficiently removed after their lifetime
- Sound files are preloaded but cached by browser
- CSS animations use GPU acceleration
- VFX container is pointer-events: none for no interference
- Sounds gracefully degrade if unavailable

## 🎯 Future Enhancement Ideas

- Background music option
- More particle effects for special cards
- Weather effects (storms, calm seas)
- Ship movement animations
- Crew visual representations
- Customizable sound themes

## 🔗 Sound Sources

All sounds are from free public domain sources:
- Freesound.org (Creative Commons)
- Public domain sound libraries
- Fallback to silent mode if sounds can't load

---

**New Production URL**: https://raiders-on-deck-1ujls3f0q-maykell07s-projects.vercel.app

Enjoy the enhanced pirate battle experience! ⚓🎵✨
