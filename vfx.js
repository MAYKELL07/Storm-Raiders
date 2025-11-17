// Visual Effects Manager
// Creates particle effects, animations, and VFX

class VFXManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create VFX container
        this.container = document.createElement('div');
        this.container.id = 'vfx-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);
    }

    // Cannon fire effect
    cannonBlast(targetElement) {
        const rect = targetElement?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        // Create smoke particles
        for (let i = 0; i < 15; i++) {
            this.createParticle({
                x, y,
                color: `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.8)`,
                size: 20 + Math.random() * 30,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1000 + Math.random() * 500,
                blur: 10
            });
        }

        // Flash effect
        this.createFlash(x, y, 'rgba(255, 150, 50, 0.6)');
    }

    // Damage impact effect
    damageImpact(targetElement, damage) {
        const rect = targetElement?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        // Wood splinters
        for (let i = 0; i < damage / 2; i++) {
            this.createParticle({
                x, y,
                color: `rgba(${139 + Math.random() * 50}, ${69 + Math.random() * 30}, 19, 1)`,
                size: 4 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 12,
                vy: -Math.random() * 10 - 2,
                gravity: 0.5,
                life: 800 + Math.random() * 400,
                shape: 'rect'
            });
        }

        // Damage number
        this.showDamageNumber(x, y, `-${damage}`, '#ff3333');
    }

    // Healing effect
    healEffect(targetElement, amount) {
        const rect = targetElement?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        // Green sparkles
        for (let i = 0; i < 20; i++) {
            this.createParticle({
                x: x + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 50,
                color: `rgba(46, ${139 + Math.random() * 50}, 87, ${0.8 + Math.random() * 0.2})`,
                size: 6 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 4 - 1,
                life: 1000 + Math.random() * 500,
                glow: true
            });
        }

        this.showDamageNumber(x, y, `+${amount}`, '#2edb57');
    }

    // Coin/gold effect
    coinEffect(targetElement, amount) {
        const rect = targetElement?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top : window.innerHeight / 2;

        for (let i = 0; i < Math.min(amount, 15); i++) {
            setTimeout(() => {
                this.createParticle({
                    x: x + (Math.random() - 0.5) * 30,
                    y: y - 20,
                    color: '#FFD700',
                    size: 10 + Math.random() * 6,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 6 - 3,
                    gravity: 0.4,
                    life: 1500,
                    glow: true,
                    shape: 'circle'
                });
            }, i * 50);
        }
    }

    // Fire/burn effect
    fireEffect(targetElement) {
        const rect = targetElement?.getBoundingClientRect();
        if (!rect) return;

        const interval = setInterval(() => {
            const x = rect.left + Math.random() * rect.width;
            const y = rect.bottom - 10;

            this.createParticle({
                x, y,
                color: `rgba(${255}, ${100 + Math.random() * 100}, ${Math.random() * 50}, 1)`,
                size: 8 + Math.random() * 12,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 2,
                life: 500 + Math.random() * 300,
                glow: true
            });
        }, 100);

        // Stop after 3 seconds
        setTimeout(() => clearInterval(interval), 3000);
    }

    // Water splash effect
    splashEffect(targetElement) {
        const rect = targetElement?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.bottom : window.innerHeight / 2;

        for (let i = 0; i < 25; i++) {
            this.createParticle({
                x, y,
                color: `rgba(26, 83, 92, ${0.6 + Math.random() * 0.4})`,
                size: 6 + Math.random() * 10,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 12 - 2,
                gravity: 0.6,
                life: 800 + Math.random() * 400
            });
        }
    }

    // Create flash effect
    createFlash(x, y, color) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: flash-expand 0.5s ease-out;
        `;
        this.container.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }

    // Show damage/heal number
    showDamageNumber(x, y, text, color) {
        const number = document.createElement('div');
        number.textContent = text;
        number.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: 2.5rem;
            font-weight: bold;
            color: ${color};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8);
            transform: translate(-50%, -50%);
            animation: damage-float 1.5s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
        `;
        this.container.appendChild(number);
        setTimeout(() => number.remove(), 1500);
    }

    // Create particle
    createParticle(options) {
        const {
            x, y, color, size, vx = 0, vy = 0, 
            gravity = 0, life = 1000, blur = 0, 
            glow = false, shape = 'circle'
        } = options;

        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shape === 'circle' ? '50%' : '0'};
            filter: blur(${blur}px);
            box-shadow: ${glow ? `0 0 ${size}px ${color}` : 'none'};
            pointer-events: none;
            opacity: 1;
        `;

        this.container.appendChild(particle);

        let posX = x, posY = y;
        let velX = vx, velY = vy;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > life) {
                particle.remove();
                return;
            }

            velY += gravity;
            posX += velX;
            posY += velY;

            const opacity = 1 - (elapsed / life);
            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    // Screen shake effect
    screenShake(intensity = 10, duration = 300) {
        const gameScreen = document.getElementById('gameScreen');
        if (!gameScreen) return;

        const startTime = Date.now();
        const originalTransform = gameScreen.style.transform || '';

        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                gameScreen.style.transform = originalTransform;
                return;
            }

            const progress = 1 - (elapsed / duration);
            const x = (Math.random() - 0.5) * intensity * progress;
            const y = (Math.random() - 0.5) * intensity * progress;
            
            gameScreen.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        };

        shake();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes flash-expand {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
    }

    @keyframes damage-float {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
        50% { transform: translate(-50%, -80px) scale(1.2); }
        100% { transform: translate(-50%, -120px) scale(1); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize VFX manager
const vfxManager = new VFXManager();
