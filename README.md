# Chip-8 Emulator 🎮

A fully functional JavaScript-based Chip-8 emulator that runs directly in your web browser. This emulator provides complete emulation of the Chip-8 instruction set with a modern, user-friendly interface.

## Features

✨ **Full Chip-8 Emulation**
- Complete implementation of all 35 Chip-8 opcodes
- 64x32 pixel monochrome display
- 16 input keys mapped to keyboard
- Sound support with beep generation
- Delay and sound timers

🎮 **User-Friendly Interface**
- Clean, modern UI with gradient styling
- Drag-and-drop ROM loading
- Real-time speed control
- Start, pause, and reset controls
- Visual keyboard mapping guide

⚡ **Performance**
- Adjustable CPU speed (1-30 cycles per frame)
- 60Hz display refresh rate
- Smooth rendering with HTML5 Canvas

## How to Use

### Getting Started

1. **Open the Emulator**
   - Simply open `index.html` in your web browser
   - No build process or dependencies required!

2. **Load a ROM**
   - Click the file input to select a `.ch8` or `.bin` ROM file
   - Or try the sample ROMs (demo patterns included)

3. **Controls**
   - Click "▶️ Start" to begin emulation
   - Click "⏸️ Pause" to pause
   - Click "🔄 Reset" to restart the current ROM
   - Adjust the speed slider to control emulation speed

### Keyboard Mapping

The Chip-8 uses a 16-key hexadecimal keypad (0-F). These are mapped to your keyboard as follows:

```
Chip-8 Keypad:          Your Keyboard:
+---+---+---+---+       +---+---+---+---+
| 1 | 2 | 3 | C |       | 1 | 2 | 3 | 4 |
+---+---+---+---+       +---+---+---+---+
| 4 | 5 | 6 | D |       | Q | W | E | R |
+---+---+---+---+       +---+---+---+---+
| 7 | 8 | 9 | E |       | A | S | D | F |
+---+---+---+---+       +---+---+---+---+
| A | 0 | B | F |       | Z | X | C | V |
+---+---+---+---+       +---+---+---+---+
```

## Finding ROMs

You can find public domain Chip-8 ROMs at:
- [Chip-8 Games Pack](https://www.zophar.net/pdroms/chip8.html)
- [Chip-8 Archive](https://johnearnest.github.io/chip8Archive/)
- Various homebrew developers' websites

**Note:** Make sure you have the rights to use any ROMs you download.

## Technical Details

### Architecture

- **Memory:** 4KB (4096 bytes)
- **Registers:** 16 8-bit registers (V0-VF)
- **Index Register:** 16-bit register (I)
- **Program Counter:** 16-bit
- **Stack:** 16 levels
- **Display:** 64x32 pixels, monochrome
- **Timers:** Delay timer and sound timer (both count down at 60Hz)

### Files

- `index.html` - Main HTML structure
- `style.css` - Modern, responsive styling
- `chip8.js` - Core Chip-8 emulator implementation
- `app.js` - Application logic and UI controls

## Browser Compatibility

This emulator works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript features
- Web Audio API (for sound)

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

The emulator is built with vanilla JavaScript - no frameworks or build tools required.

To modify:
1. Edit the source files
2. Refresh your browser
3. No compilation needed!

## About Chip-8

Chip-8 is an interpreted programming language developed in the 1970s by Joseph Weisbecker. It was initially used on 8-bit microcomputers like the COSMAC VIP and Telmac 1800. The simplicity of Chip-8 makes it an excellent first emulator project for learning about emulation.

## License

This project is open source. Feel free to use, modify, and distribute as you see fit.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

Made with ❤️ | Happy Emulating!
