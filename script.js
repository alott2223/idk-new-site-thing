// Window Management
let windows = [];
let zIndexCounter = 100;
let draggedWindow = null;
let dragOffset = { x: 0, y: 0 };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeStartMenu();
    initializeClock();
    initializeDesktopIcons();
    
    // Close start menu when clicking outside
    document.addEventListener('click', (e) => {
        const startMenu = document.getElementById('start-menu');
        const startButton = document.getElementById('start-button');
        
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.classList.add('hidden');
        }
    });
});

// Start Menu
function initializeStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
    });
    
    // Start menu tiles
    const tiles = startMenu.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const appName = tile.getAttribute('data-app');
            openApplication(appName);
            startMenu.classList.add('hidden');
        });
    });
}

// Clock
function initializeClock() {
    const clockElement = document.getElementById('clock');
    
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Desktop Icons
function initializeDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const appName = icon.getAttribute('data-app');
            openApplication(appName);
        });
    });
}

// Open Application
function openApplication(appName) {
    let windowConfig;
    
    switch (appName) {
        case 'explorer':
            windowConfig = {
                title: 'File Explorer',
                content: createExplorerContent(),
                width: 700,
                height: 500
            };
            break;
        case 'notepad':
            windowConfig = {
                title: 'Notepad',
                content: createNotepadContent(),
                width: 600,
                height: 400
            };
            break;
        case 'calculator':
            windowConfig = {
                title: 'Calculator',
                content: createCalculatorContent(),
                width: 360,
                height: 500
            };
            break;
        case 'browser':
            windowConfig = {
                title: 'Browser',
                content: createBrowserContent(),
                width: 800,
                height: 600
            };
            break;
        default:
            return;
    }
    
    createWindow(windowConfig);
}

// Create Window
function createWindow(config) {
    const template = document.getElementById('window-template');
    const windowElement = template.content.cloneNode(true).querySelector('.window');
    
    // Set window properties
    windowElement.style.width = config.width + 'px';
    windowElement.style.height = config.height + 'px';
    windowElement.style.left = Math.random() * (window.innerWidth - config.width - 100) + 50 + 'px';
    windowElement.style.top = Math.random() * (window.innerHeight - config.height - 200) + 50 + 'px';
    windowElement.style.zIndex = ++zIndexCounter;
    
    // Set title
    windowElement.querySelector('.window-title').textContent = config.title;
    
    // Set content
    const contentElement = windowElement.querySelector('.window-content');
    if (typeof config.content === 'string') {
        contentElement.innerHTML = config.content;
    } else {
        contentElement.appendChild(config.content);
    }
    
    // Add to DOM
    document.getElementById('desktop').appendChild(windowElement);
    
    // Window controls
    setupWindowControls(windowElement, config.title);
    
    // Dragging
    setupWindowDragging(windowElement);
    
    // Add to taskbar
    addToTaskbar(windowElement, config.title);
    
    // Store window
    windows.push(windowElement);
    
    // Bring to front on click
    windowElement.addEventListener('mousedown', () => {
        bringToFront(windowElement);
    });
    
    // Initialize app-specific functionality
    initializeAppContent(windowElement, config.title);
}

// Window Controls
function setupWindowControls(windowElement, title) {
    const minimizeBtn = windowElement.querySelector('.window-minimize');
    const maximizeBtn = windowElement.querySelector('.window-maximize');
    const closeBtn = windowElement.querySelector('.window-close');
    
    minimizeBtn.addEventListener('click', () => {
        windowElement.classList.add('minimized');
        updateTaskbarApp(windowElement, false);
    });
    
    let isMaximized = false;
    let previousState = {};
    
    maximizeBtn.addEventListener('click', () => {
        if (isMaximized) {
            windowElement.classList.remove('maximized');
            windowElement.style.width = previousState.width;
            windowElement.style.height = previousState.height;
            windowElement.style.left = previousState.left;
            windowElement.style.top = previousState.top;
            isMaximized = false;
        } else {
            previousState = {
                width: windowElement.style.width,
                height: windowElement.style.height,
                left: windowElement.style.left,
                top: windowElement.style.top
            };
            windowElement.classList.add('maximized');
            isMaximized = true;
        }
    });
    
    closeBtn.addEventListener('click', () => {
        windowElement.remove();
        removeFromTaskbar(windowElement);
        windows = windows.filter(w => w !== windowElement);
    });
}

// Window Dragging
function setupWindowDragging(windowElement) {
    const titlebar = windowElement.querySelector('.window-titlebar');
    
    titlebar.addEventListener('mousedown', (e) => {
        if (windowElement.classList.contains('maximized')) return;
        
        draggedWindow = windowElement;
        dragOffset.x = e.clientX - windowElement.offsetLeft;
        dragOffset.y = e.clientY - windowElement.offsetTop;
        
        bringToFront(windowElement);
    });
}

document.addEventListener('mousemove', (e) => {
    if (draggedWindow) {
        draggedWindow.style.left = e.clientX - dragOffset.x + 'px';
        draggedWindow.style.top = e.clientY - dragOffset.y + 'px';
    }
});

document.addEventListener('mouseup', () => {
    draggedWindow = null;
});

// Bring window to front
function bringToFront(windowElement) {
    windowElement.style.zIndex = ++zIndexCounter;
    
    // Update taskbar active state
    document.querySelectorAll('.taskbar-app').forEach(app => {
        app.classList.remove('active');
    });
    updateTaskbarApp(windowElement, true);
}

// Taskbar Management
function addToTaskbar(windowElement, title) {
    const taskbarApps = document.getElementById('taskbar-apps');
    const appButton = document.createElement('button');
    appButton.className = 'taskbar-app active';
    appButton.textContent = title;
    appButton.dataset.windowId = windows.length;
    
    appButton.addEventListener('click', () => {
        if (windowElement.classList.contains('minimized')) {
            windowElement.classList.remove('minimized');
            bringToFront(windowElement);
        } else if (windowElement.style.zIndex == zIndexCounter) {
            windowElement.classList.add('minimized');
        } else {
            bringToFront(windowElement);
        }
    });
    
    windowElement.taskbarButton = appButton;
    taskbarApps.appendChild(appButton);
}

function updateTaskbarApp(windowElement, active) {
    if (windowElement.taskbarButton) {
        if (active) {
            windowElement.taskbarButton.classList.add('active');
        } else {
            windowElement.taskbarButton.classList.remove('active');
        }
    }
}

function removeFromTaskbar(windowElement) {
    if (windowElement.taskbarButton) {
        windowElement.taskbarButton.remove();
    }
}

// Application Content Creators

function createExplorerContent() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="explorer-toolbar">
            <button>← Back</button>
            <button>→ Forward</button>
            <button>↑ Up</button>
            <input type="text" class="explorer-address" value="C:\\Users\\User\\Documents" readonly>
        </div>
        <div class="explorer-content">
            <div class="file-item">
                <svg class="file-icon" viewBox="0 0 24 24">
                    <path fill="#FFC107" d="M20,6h-8l-2-2H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z"/>
                </svg>
                <span>Projects</span>
            </div>
            <div class="file-item">
                <svg class="file-icon" viewBox="0 0 24 24">
                    <path fill="#FFC107" d="M20,6h-8l-2-2H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z"/>
                </svg>
                <span>Pictures</span>
            </div>
            <div class="file-item">
                <svg class="file-icon" viewBox="0 0 24 24">
                    <path fill="#42A5F5" d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z"/>
                </svg>
                <span>Document.txt</span>
            </div>
            <div class="file-item">
                <svg class="file-icon" viewBox="0 0 24 24">
                    <path fill="#4CAF50" d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z"/>
                </svg>
                <span>Spreadsheet.xlsx</span>
            </div>
        </div>
    `;
    return container;
}

function createNotepadContent() {
    const container = document.createElement('div');
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.innerHTML = `
        <div class="notepad-toolbar">
            File | Edit | Format | View | Help
        </div>
        <textarea class="notepad-textarea" placeholder="Start typing..."></textarea>
    `;
    return container;
}

function createCalculatorContent() {
    const container = document.createElement('div');
    container.className = 'calculator';
    container.innerHTML = `
        <div class="calculator-display" id="calc-display">0</div>
        <div class="calculator-buttons">
            <button class="calc-button" data-value="7">7</button>
            <button class="calc-button" data-value="8">8</button>
            <button class="calc-button" data-value="9">9</button>
            <button class="calc-button operator" data-value="/">÷</button>
            <button class="calc-button" data-value="4">4</button>
            <button class="calc-button" data-value="5">5</button>
            <button class="calc-button" data-value="6">6</button>
            <button class="calc-button operator" data-value="*">×</button>
            <button class="calc-button" data-value="1">1</button>
            <button class="calc-button" data-value="2">2</button>
            <button class="calc-button" data-value="3">3</button>
            <button class="calc-button operator" data-value="-">−</button>
            <button class="calc-button" data-value="0">0</button>
            <button class="calc-button" data-value=".">.</button>
            <button class="calc-button equals" data-value="=">=</button>
            <button class="calc-button operator" data-value="+">+</button>
            <button class="calc-button operator" data-value="C" style="grid-column: span 4;">Clear</button>
        </div>
    `;
    return container;
}

function createBrowserContent() {
    const container = document.createElement('div');
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.innerHTML = `
        <div class="browser-toolbar">
            <button>←</button>
            <button>→</button>
            <button>⟳</button>
            <input type="text" class="browser-url" value="https://example.com" readonly>
        </div>
        <div class="browser-content">
            <h2>Welcome to Browser</h2>
            <p>This is a simulated web browser interface</p>
            <div class="browser-links">
                <div class="browser-link">
                    <div class="browser-link-icon"></div>
                    <span>Link 1</span>
                </div>
                <div class="browser-link">
                    <div class="browser-link-icon"></div>
                    <span>Link 2</span>
                </div>
                <div class="browser-link">
                    <div class="browser-link-icon"></div>
                    <span>Link 3</span>
                </div>
                <div class="browser-link">
                    <div class="browser-link-icon"></div>
                    <span>Link 4</span>
                </div>
            </div>
        </div>
    `;
    return container;
}

// Initialize app-specific functionality
function initializeAppContent(windowElement, appTitle) {
    if (appTitle === 'Calculator') {
        initializeCalculator(windowElement);
    }
}

// Calculator Logic
function initializeCalculator(windowElement) {
    const display = windowElement.querySelector('#calc-display');
    const buttons = windowElement.querySelectorAll('.calc-button');
    
    let currentValue = '0';
    let previousValue = '';
    let operation = '';
    let shouldResetDisplay = false;
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            
            if (value === 'C') {
                currentValue = '0';
                previousValue = '';
                operation = '';
                shouldResetDisplay = false;
                display.textContent = currentValue;
                return;
            }
            
            if (value === '=') {
                if (previousValue && operation) {
                    currentValue = calculate(previousValue, currentValue, operation).toString();
                    display.textContent = currentValue;
                    previousValue = '';
                    operation = '';
                    shouldResetDisplay = true;
                }
                return;
            }
            
            if (['+', '-', '*', '/'].includes(value)) {
                if (previousValue && operation && !shouldResetDisplay) {
                    currentValue = calculate(previousValue, currentValue, operation).toString();
                    display.textContent = currentValue;
                }
                previousValue = currentValue;
                operation = value;
                shouldResetDisplay = true;
                return;
            }
            
            // Number or decimal point
            if (shouldResetDisplay) {
                currentValue = value;
                shouldResetDisplay = false;
            } else {
                if (currentValue === '0' && value !== '.') {
                    currentValue = value;
                } else if (value === '.' && currentValue.includes('.')) {
                    return;
                } else {
                    currentValue += value;
                }
            }
            
            display.textContent = currentValue;
        });
    });
}

function calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    switch (op) {
        case '+':
            return numA + numB;
        case '-':
            return numA - numB;
        case '*':
            return numA * numB;
        case '/':
            return numB !== 0 ? numA / numB : 'Error';
        default:
            return numB;
    }
}
