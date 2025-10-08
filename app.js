class EmulatorApp {
    constructor() {
        this.chip8 = new Chip8();
        this.canvas = document.getElementById('display');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.currentROM = null;
        this.cyclesPerFrame = 10;
        
        this.initUI();
        this.initKeyboard();
        this.render();
    }
    
    initUI() {
        const romInput = document.getElementById('romInput');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        romInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const rom = new Uint8Array(event.target.result);
                    this.loadROM(rom);
                };
                reader.readAsArrayBuffer(file);
            }
        });
        
        startBtn.addEventListener('click', () => {
            this.start();
        });
        
        pauseBtn.addEventListener('click', () => {
            this.pause();
        });
        
        resetBtn.addEventListener('click', () => {
            this.reset();
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.cyclesPerFrame = parseInt(e.target.value);
            speedValue.textContent = e.target.value;
        });
        
        // Sample ROM buttons
        const sampleRomButtons = document.querySelectorAll('.sample-rom');
        sampleRomButtons.forEach(button => {
            button.addEventListener('click', () => {
                const romName = button.dataset.rom;
                this.loadSampleROM(romName);
            });
        });
    }
    
    initKeyboard() {
        // Map keyboard to Chip-8 keys
        const keyMap = {
            '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
            'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
            'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
            'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
        };
        
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (keyMap[key] !== undefined) {
                this.chip8.keys[keyMap[key]] = 1;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (keyMap[key] !== undefined) {
                this.chip8.keys[keyMap[key]] = 0;
            }
        });
    }
    
    loadROM(rom) {
        this.currentROM = rom;
        this.chip8.reset();
        this.chip8.loadROM(rom);
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('resetBtn').disabled = false;
        
        console.log(`ROM loaded: ${rom.length} bytes`);
    }
    
    async loadSampleROM(romName) {
        // These are sample ROMs - in a real implementation, you would fetch actual ROM files
        // For demonstration, we'll create simple test programs
        
        let rom;
        
        if (romName === 'pong') {
            // Simple test pattern (not actual Pong, just a demo)
            rom = this.createTestROM();
        } else if (romName === 'tetris') {
            rom = this.createTestROM();
        } else if (romName === 'spaceinvaders') {
            rom = this.createTestROM();
        }
        
        if (rom) {
            this.loadROM(rom);
            alert(`Sample ROM "${romName}" loaded! This is a demo - load your own .ch8 ROM files for actual games.`);
        }
    }
    
    createTestROM() {
        // Create a simple test program that displays a pattern
        const rom = new Uint8Array([
            0x00, 0xE0, // Clear screen
            0x61, 0x10, // Set V1 to 16 (x position)
            0x62, 0x08, // Set V2 to 8 (y position)
            0xA2, 0x0A, // Set I to address of sprite data (0x20A)
            0xD1, 0x25, // Draw 5-byte sprite at (V1, V2)
            0x71, 0x05, // Add 5 to V1
            0xD1, 0x25, // Draw sprite again
            0x71, 0x05, // Add 5 to V1
            0xD1, 0x25, // Draw sprite again
            0x12, 0x08, // Jump to 0x208 (loop)
            // Sprite data (5 bytes for digit 0)
            0xF0, 0x90, 0x90, 0x90, 0xF0
        ]);
        return rom;
    }
    
    start() {
        if (!this.running && this.currentROM) {
            this.running = true;
            document.getElementById('startBtn').textContent = '▶️ Running...';
            this.run();
        }
    }
    
    pause() {
        this.running = false;
        document.getElementById('startBtn').textContent = '▶️ Start';
    }
    
    reset() {
        this.pause();
        if (this.currentROM) {
            this.chip8.reset();
            this.chip8.loadROM(this.currentROM);
            this.render();
        }
    }
    
    run() {
        if (!this.running) return;
        
        // Execute multiple cycles per frame for better performance
        for (let i = 0; i < this.cyclesPerFrame; i++) {
            this.chip8.emulateCycle();
        }
        
        // Update timers at 60Hz
        this.chip8.updateTimers();
        
        // Render if draw flag is set
        if (this.chip8.drawFlag) {
            this.render();
            this.chip8.drawFlag = false;
        }
        
        // Run at approximately 60 FPS
        setTimeout(() => this.run(), 1000 / 60);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pixels
        this.ctx.fillStyle = '#00FF00';
        const scale = this.canvas.width / 64;
        
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 64; x++) {
                if (this.chip8.display[y * 64 + x]) {
                    this.ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
    }
}

// Initialize the emulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new EmulatorApp();
    console.log('Chip-8 Emulator initialized!');
});
