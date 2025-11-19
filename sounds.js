// Sound Effects Manager
// Using free sounds from freesound.org and other public domain sources

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = {};
        this.initSounds();
    }

    initSounds() {
        // Using Howler.js for better audio management (will load via CDN)
        // Fallback to basic Audio API if Howler not available
        
        // Sound URLs from free sources (using base64 or remote URLs)
        this.soundUrls = {
            // Using freesound.org API or public domain sounds
            cannon: 'https://freesound.org/data/previews/456/456966_8462944-lq.mp3', // Cannon fire
            splash: 'https://freesound.org/data/previews/415/415508_5121236-lq.mp3', // Water splash
            coins: 'https://freesound.org/data/previews/341/341695_5858296-lq.mp3', // Coins
            repair: 'https://freesound.org/data/previews/187/187044_3430473-lq.mp3', // Wood creaking/hammer
            reload: 'https://freesound.org/data/previews/162/162464_2703579-lq.mp3', // Metal clanking
            dice: 'https://freesound.org/data/previews/608/608318_11861866-lq.mp3', // Dice roll
            victory: 'https://freesound.org/data/previews/270/270404_5123851-lq.mp3', // Victory fanfare
            damage: 'https://freesound.org/data/previews/436/436898_8588756-lq.mp3', // Impact/damage
            card: 'https://freesound.org/data/previews/191/191591_2437358-lq.mp3', // Card shuffle
            maneuver: 'https://freesound.org/data/previews/411/411089_5081456-lq.mp3', // Wind/sail
            fire: 'https://freesound.org/data/previews/235/235968_3428725-lq.mp3', // Fire crackling
            explosion: 'https://freesound.org/data/previews/442/442127_5123851-lq.mp3', // Explosion
            bell: 'https://freesound.org/data/previews/411/411458_5121236-lq.mp3', // Ship bell
            ambient: 'https://freesound.org/data/previews/416/416329_7255534-lq.mp3' // Ocean waves
        };
    }

    loadSound(name, url) {
        const audio = new Audio();
        audio.src = url;
        audio.volume = this.volume;
        audio.preload = 'auto';
        this.sounds[name] = audio;
        
        // Handle errors gracefully
        audio.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${name}`);
        });
    }

    play(soundName, volumeMultiplier = 1) {
        if (!this.enabled) return;
        
        try {
            const sound = this.sounds[soundName];
            if (sound) {
                sound.volume = this.volume * volumeMultiplier;
                sound.currentTime = 0;
                sound.play().catch(e => {
                    // Silently fail - sounds are not critical
                });
            }
        } catch (e) {
            // Silently fail - sounds are not critical
        }
    }

    playSequence(soundNames, delay = 100) {
        soundNames.forEach((name, index) => {
            setTimeout(() => this.play(name), index * delay);
        });
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Preload all sounds
    preloadAll() {
        Object.entries(this.soundUrls).forEach(([name, url]) => {
            this.loadSound(name, url);
        });
    }
}

// Initialize sound manager
const soundManager = new SoundManager();

// Preload sounds when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        soundManager.preloadAll();
    });
}
