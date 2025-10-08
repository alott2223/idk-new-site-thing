class Chip8 {
    constructor() {
        this.memory = new Uint8Array(4096);
        this.V = new Uint8Array(16); // Registers V0-VF
        this.I = 0; // Index register
        this.pc = 0x200; // Program counter
        this.stack = new Uint16Array(16);
        this.sp = 0; // Stack pointer
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.keys = new Uint8Array(16);
        
        // Display: 64x32 pixels
        this.display = new Uint8Array(64 * 32);
        this.drawFlag = false;
        
        // Load font set into memory
        this.loadFontset();
    }
    
    loadFontset() {
        const fontset = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
        
        for (let i = 0; i < fontset.length; i++) {
            this.memory[i] = fontset[i];
        }
    }
    
    loadROM(rom) {
        for (let i = 0; i < rom.length; i++) {
            this.memory[0x200 + i] = rom[i];
        }
    }
    
    reset() {
        this.memory = new Uint8Array(4096);
        this.V = new Uint8Array(16);
        this.I = 0;
        this.pc = 0x200;
        this.stack = new Uint16Array(16);
        this.sp = 0;
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.display = new Uint8Array(64 * 32);
        this.drawFlag = false;
        this.loadFontset();
    }
    
    emulateCycle() {
        // Fetch opcode
        const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        
        // Decode and execute opcode
        const x = (opcode & 0x0F00) >> 8;
        const y = (opcode & 0x00F0) >> 4;
        const n = opcode & 0x000F;
        const nn = opcode & 0x00FF;
        const nnn = opcode & 0x0FFF;
        
        this.pc += 2;
        
        switch (opcode & 0xF000) {
            case 0x0000:
                switch (opcode) {
                    case 0x00E0: // Clear screen
                        this.display.fill(0);
                        this.drawFlag = true;
                        break;
                    case 0x00EE: // Return from subroutine
                        this.sp--;
                        this.pc = this.stack[this.sp];
                        break;
                }
                break;
                
            case 0x1000: // Jump to address NNN
                this.pc = nnn;
                break;
                
            case 0x2000: // Call subroutine at NNN
                this.stack[this.sp] = this.pc;
                this.sp++;
                this.pc = nnn;
                break;
                
            case 0x3000: // Skip next instruction if VX == NN
                if (this.V[x] === nn) this.pc += 2;
                break;
                
            case 0x4000: // Skip next instruction if VX != NN
                if (this.V[x] !== nn) this.pc += 2;
                break;
                
            case 0x5000: // Skip next instruction if VX == VY
                if (this.V[x] === this.V[y]) this.pc += 2;
                break;
                
            case 0x6000: // Set VX to NN
                this.V[x] = nn;
                break;
                
            case 0x7000: // Add NN to VX
                this.V[x] = (this.V[x] + nn) & 0xFF;
                break;
                
            case 0x8000:
                switch (n) {
                    case 0x0: // Set VX to VY
                        this.V[x] = this.V[y];
                        break;
                    case 0x1: // Set VX to VX OR VY
                        this.V[x] |= this.V[y];
                        break;
                    case 0x2: // Set VX to VX AND VY
                        this.V[x] &= this.V[y];
                        break;
                    case 0x3: // Set VX to VX XOR VY
                        this.V[x] ^= this.V[y];
                        break;
                    case 0x4: // Add VY to VX, set VF to carry
                        const sum = this.V[x] + this.V[y];
                        this.V[0xF] = sum > 0xFF ? 1 : 0;
                        this.V[x] = sum & 0xFF;
                        break;
                    case 0x5: // Subtract VY from VX, set VF to NOT borrow
                        this.V[0xF] = this.V[x] >= this.V[y] ? 1 : 0;
                        this.V[x] = (this.V[x] - this.V[y]) & 0xFF;
                        break;
                    case 0x6: // Shift VX right by 1, VF = LSB
                        this.V[0xF] = this.V[x] & 0x1;
                        this.V[x] >>= 1;
                        break;
                    case 0x7: // Set VX to VY - VX, set VF to NOT borrow
                        this.V[0xF] = this.V[y] >= this.V[x] ? 1 : 0;
                        this.V[x] = (this.V[y] - this.V[x]) & 0xFF;
                        break;
                    case 0xE: // Shift VX left by 1, VF = MSB
                        this.V[0xF] = (this.V[x] & 0x80) >> 7;
                        this.V[x] = (this.V[x] << 1) & 0xFF;
                        break;
                }
                break;
                
            case 0x9000: // Skip next instruction if VX != VY
                if (this.V[x] !== this.V[y]) this.pc += 2;
                break;
                
            case 0xA000: // Set I to NNN
                this.I = nnn;
                break;
                
            case 0xB000: // Jump to address NNN + V0
                this.pc = nnn + this.V[0];
                break;
                
            case 0xC000: // Set VX to random number AND NN
                this.V[x] = Math.floor(Math.random() * 256) & nn;
                break;
                
            case 0xD000: // Draw sprite at (VX, VY) with N bytes of sprite data starting at I
                const vx = this.V[x];
                const vy = this.V[y];
                const height = n;
                this.V[0xF] = 0;
                
                for (let row = 0; row < height; row++) {
                    const sprite = this.memory[this.I + row];
                    
                    for (let col = 0; col < 8; col++) {
                        if ((sprite & (0x80 >> col)) !== 0) {
                            const px = (vx + col) % 64;
                            const py = (vy + row) % 32;
                            const index = py * 64 + px;
                            
                            if (this.display[index] === 1) {
                                this.V[0xF] = 1;
                            }
                            this.display[index] ^= 1;
                        }
                    }
                }
                this.drawFlag = true;
                break;
                
            case 0xE000:
                switch (nn) {
                    case 0x9E: // Skip next instruction if key VX is pressed
                        if (this.keys[this.V[x]]) this.pc += 2;
                        break;
                    case 0xA1: // Skip next instruction if key VX is not pressed
                        if (!this.keys[this.V[x]]) this.pc += 2;
                        break;
                }
                break;
                
            case 0xF000:
                switch (nn) {
                    case 0x07: // Set VX to delay timer value
                        this.V[x] = this.delayTimer;
                        break;
                    case 0x0A: // Wait for key press, store in VX
                        let pressed = false;
                        for (let i = 0; i < 16; i++) {
                            if (this.keys[i]) {
                                this.V[x] = i;
                                pressed = true;
                                break;
                            }
                        }
                        if (!pressed) this.pc -= 2;
                        break;
                    case 0x15: // Set delay timer to VX
                        this.delayTimer = this.V[x];
                        break;
                    case 0x18: // Set sound timer to VX
                        this.soundTimer = this.V[x];
                        break;
                    case 0x1E: // Add VX to I
                        this.I = (this.I + this.V[x]) & 0xFFFF;
                        break;
                    case 0x29: // Set I to location of sprite for digit VX
                        this.I = this.V[x] * 5;
                        break;
                    case 0x33: // Store BCD representation of VX in memory locations I, I+1, I+2
                        this.memory[this.I] = Math.floor(this.V[x] / 100);
                        this.memory[this.I + 1] = Math.floor((this.V[x] % 100) / 10);
                        this.memory[this.I + 2] = this.V[x] % 10;
                        break;
                    case 0x55: // Store V0 to VX in memory starting at address I
                        for (let i = 0; i <= x; i++) {
                            this.memory[this.I + i] = this.V[i];
                        }
                        break;
                    case 0x65: // Fill V0 to VX with values from memory starting at address I
                        for (let i = 0; i <= x; i++) {
                            this.V[i] = this.memory[this.I + i];
                        }
                        break;
                }
                break;
        }
    }
    
    updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer--;
        }
        
        if (this.soundTimer > 0) {
            if (this.soundTimer === 1) {
                // Play beep sound
                this.playBeep();
            }
            this.soundTimer--;
        }
    }
    
    playBeep() {
        // Simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 440; // A4 note
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}
