// Block Blast Game Logic

const gridSize = 8;
const cellSize = 50;
const grid = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const piecePreviews = [
    document.getElementById('piece0'),
    document.getElementById('piece1'),
    document.getElementById('piece2')
];

let score = 0;
let gameBoard = [];
let currentPiece = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Tetris-like pieces (shapes)
const pieces = [
    // Single block
    [[0, 0]],
    // Two horizontal
    [[0, 0], [1, 0]],
    // Two vertical
    [[0, 0], [0, 1]],
    // Three horizontal
    [[0, 0], [1, 0], [2, 0]],
    // Three vertical
    [[0, 0], [0, 1], [0, 2]],
    // Square
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    // L shape
    [[0, 0], [0, 1], [0, 2], [1, 0]],
    // J shape
    [[0, 0], [0, 1], [0, 2], [-1, 2]],
    // T shape
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    // S shape
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    // Z shape
    [[0, 0], [1, 0], [0, 1], [-1, 1]],
    // Long L
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    // Long line horizontal
    [[0, 0], [1, 0], [2, 0], [3, 0]]
];

// Colors for pieces
const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#d35400', '#8e44ad', '#27ae60', '#c0392b',
    '#16a085', '#2980b9'
];

// Initialize game
function initGame() {
    // Create empty game board
    gameBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Reset score
    score = 0;
    scoreElement.textContent = score;
    
    // Clear message
    messageElement.classList.add('hidden');
    messageElement.textContent = '';
    
    // Hide restart button
    restartBtn.classList.add('hidden');
    
    // Create grid cells
    createGrid();
    
    // Generate initial pieces
    generatePieces();
    
    // Set up event listeners
    setupEventListeners();
}

// Create the grid visually
function createGrid() {
    grid.innerHTML = '';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            grid.appendChild(cell);
        }
    }
}

// Generate three random pieces
function generatePieces() {
    piecePreviews.forEach((preview, index) => {
        preview.innerHTML = '';
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Calculate piece dimensions
        const width = Math.max(...randomPiece.map(p => p[0])) - Math.min(...randomPiece.map(p => p[0])) + 1;
        const height = Math.max(...randomPiece.map(p => p[1])) - Math.min(...randomPiece.map(p => p[1])) + 1;
        
        // Set preview size based on piece size
        preview.style.width = `${width * 25 + 20}px`;
        preview.style.height = `${height * 25 + 20}px`;
        
        // Draw the piece in preview
        randomPiece.forEach(([x, y]) => {
            const block = document.createElement('div');
            block.className = 'preview-block';
            block.style.backgroundColor = randomColor;
            block.style.left = `${(x - Math.min(...randomPiece.map(p => p[0]))) * 25 + 10}px`;
            block.style.top = `${(y - Math.min(...randomPiece.map(p => p[1]))) * 25 + 10}px`;
            preview.appendChild(block);
        });
        
        // Store piece data
        preview.dataset.piece = JSON.stringify(randomPiece);
        preview.dataset.color = randomColor;
    });
}

// Set up event listeners
function setupEventListeners() {
    piecePreviews.forEach(preview => {
        preview.addEventListener('mousedown', startDrag);
        preview.addEventListener('touchstart', startDrag, { passive: false });
    });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    restartBtn.addEventListener('click', () => {
        initGame();
    });
}

// Start dragging a piece
function startDrag(e) {
    if (e.type === 'touchstart') {
        e.preventDefault();
    }
    
    const preview = e.target.closest('.piece-preview');
    if (!preview) return;
    
    isDragging = true;
    currentPiece = {
        element: preview,
        shape: JSON.parse(preview.dataset.piece),
        color: preview.dataset.color
    };
    
    // Add dragging class
    preview.classList.add('dragging');
    
    // Calculate offset
    const rect = preview.getBoundingClientRect();
    if (e.type === 'touchstart') {
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
    } else {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    }
    
    // Create drag element
    const dragElement = document.createElement('div');
    dragElement.className = 'drag-piece';
    dragElement.style.position = 'fixed';
    dragElement.style.zIndex = '1000';
    dragElement.style.pointerEvents = 'none';
    
    // Draw piece in drag element
    currentPiece.shape.forEach(([x, y]) => {
        const block = document.createElement('div');
        block.className = 'drag-block';
        block.style.backgroundColor = currentPiece.color;
        block.style.left = `${x * 25}px`;
        block.style.top = `${y * 25}px`;
        dragElement.appendChild(block);
    });
    
    // Calculate size
    const width = Math.max(...currentPiece.shape.map(p => p[0])) - Math.min(...currentPiece.shape.map(p => p[0])) + 1;
    const height = Math.max(...currentPiece.shape.map(p => p[1])) - Math.min(...currentPiece.shape.map(p => p[1])) + 1;
    dragElement.style.width = `${width * 25}px`;
    dragElement.style.height = `${height * 25}px`;
    
    document.body.appendChild(dragElement);
    currentPiece.dragElement = dragElement;
}

// Handle dragging
function drag(e) {
    if (!isDragging || !currentPiece) return;
    
    e.preventDefault();
    
    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    // Update drag element position
    currentPiece.dragElement.style.left = `${clientX - offsetX}px`;
    currentPiece.dragElement.style.top = `${clientY - offsetY}px`;
    
    // Check if over grid
    const gridRect = grid.getBoundingClientRect();
    const gridX = clientX - gridRect.left;
    const gridY = clientY - gridRect.top;
    
    // Remove previous highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('valid', 'invalid');
    });
    
    // Check if position is valid
    if (gridX >= 0 && gridX < gridRect.width && gridY >= 0 && gridY < gridRect.height) {
        const col = Math.floor(gridX / cellSize);
        const row = Math.floor(gridY / cellSize);
        
        if (canPlacePiece(row, col, currentPiece.shape)) {
            highlightCells(row, col, currentPiece.shape, true);
            currentPiece.dragElement.classList.add('valid');
        } else {
            highlightCells(row, col, currentPiece.shape, false);
            currentPiece.dragElement.classList.remove('valid');
        }
    } else {
        currentPiece.dragElement.classList.remove('valid');
    }
}

// End dragging
function endDrag(e) {
    if (!isDragging || !currentPiece) return;
    
    isDragging = false;
    
    // Remove drag element
    if (currentPiece.dragElement) {
        currentPiece.dragElement.remove();
        currentPiece.dragElement = null;
    }
    
    // Remove dragging class
    if (currentPiece.element) {
        currentPiece.element.classList.remove('dragging');
    }
    
    // Remove highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('valid', 'invalid');
    });
    
    // Check if we can place the piece
    const gridRect = grid.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.type === 'touchend') {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const gridX = clientX - gridRect.left;
    const gridY = clientY - gridRect.top;
    
    if (gridX >= 0 && gridX < gridRect.width && gridY >= 0 && gridY < gridRect.height) {
        const col = Math.floor(gridX / cellSize);
        const row = Math.floor(gridY / cellSize);
        
        if (canPlacePiece(row, col, currentPiece.shape)) {
            placePiece(row, col, currentPiece.shape, currentPiece.color);
            
            // Remove used piece
            currentPiece.element.innerHTML = '';
            currentPiece.element.dataset.piece = '';
            currentPiece.element.dataset.color = '';
            
            // Check if we need to generate new pieces
            const emptyPreviews = Array.from(piecePreviews).filter(p => !p.dataset.piece);
            if (emptyPreviews.length === 0) {
                generatePieces();
            } else {
                // Fill empty slots
                emptyPreviews.forEach(preview => {
                    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    preview.innerHTML = '';
                    randomPiece.forEach(([x, y]) => {
                        const block = document.createElement('div');
                        block.className = 'preview-block';
                        block.style.backgroundColor = randomColor;
                        block.style.left = `${(x - Math.min(...randomPiece.map(p => p[0]))) * 25 + 10}px`;
                        block.style.top = `${(y - Math.min(...randomPiece.map(p => p[1]))) * 25 + 10}px`;
                        preview.appendChild(block);
                    });
                    
                    preview.dataset.piece = JSON.stringify(randomPiece);
                    preview.dataset.color = randomColor;
                });
            }
            
            // Check for game over
            setTimeout(checkGameOver, 100);
            return;
        }
    }
    
    // If we couldn't place, do nothing (piece returns to preview)
    currentPiece = null;
}

// Check if piece can be placed at position
function canPlacePiece(row, col, shape) {
    for (const [x, y] of shape) {
        const newRow = row + y;
        const newCol = col + x;
        
        if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
            return false;
        }
        
        if (gameBoard[newRow][newCol] !== 0) {
            return false;
        }
    }
    return true;
}

// Highlight cells where piece would be placed
function highlightCells(row, col, shape, valid) {
    for (const [x, y] of shape) {
        const newRow = row + y;
        const newCol = col + x;
        
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const cellIndex = newRow * gridSize + newCol;
            const cell = grid.children[cellIndex];
            if (cell) {
                cell.classList.add(valid ? 'valid' : 'invalid');
            }
        }
    }
}

// Place piece on the board
function placePiece(row, col, shape, color) {
    for (const [x, y] of shape) {
        const newRow = row + y;
        const newCol = col + x;
        gameBoard[newRow][newCol] = 1;
        
        const cellIndex = newRow * gridSize + newCol;
        const cell = grid.children[cellIndex];
        if (cell) {
            cell.classList.add('filled');
            cell.style.backgroundColor = color;
        }
    }
    
    // Update score
    score += shape.length;
    scoreElement.textContent = score;
    
    // Check for line clears
    clearLines();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    // Check rows
    for (let row = 0; row < gridSize; row++) {
        if (gameBoard[row].every(cell => cell !== 0)) {
            linesCleared++;
            // Clear row
            for (let col = 0; col < gridSize; col++) {
                gameBoard[row][col] = 0;
                const cellIndex = row * gridSize + col;
                const cell = grid.children[cellIndex];
                if (cell) {
                    cell.classList.remove('filled');
                    cell.style.backgroundColor = '#bdc3c7';
                }
            }
            // Move rows down
            for (let r = row; r > 0; r--) {
                for (let c = 0; c < gridSize; c++) {
                    gameBoard[r][c] = gameBoard[r-1][c];
                    const fromIndex = (r-1) * gridSize + c;
                    const toIndex = r * gridSize + c;
                    const fromCell = grid.children[fromIndex];
                    const toCell = grid.children[toIndex];
                    if (fromCell && toCell) {
                        toCell.className = fromCell.className;
                        toCell.style.backgroundColor = fromCell.style.backgroundColor;
                    }
                }
            }
            // Clear top row
            for (let c = 0; c < gridSize; c++) {
                gameBoard[0][c] = 0;
                const cellIndex = 0 * gridSize + c;
                const cell = grid.children[cellIndex];
                if (cell) {
                    cell.classList.remove('filled');
                    cell.style.backgroundColor = '#bdc3c7';
                }
            }
        }
    }
    
    // Check columns
    for (let col = 0; col < gridSize; col++) {
        let fullColumn = true;
        for (let row = 0; row < gridSize; row++) {
            if (gameBoard[row][col] === 0) {
                fullColumn = false;
                break;
            }
        }
        
        if (fullColumn) {
            linesCleared++;
            // Clear column
            for (let row = 0; row < gridSize; row++) {
                gameBoard[row][col] = 0;
                const cellIndex = row * gridSize + col;
                const cell = grid.children[cellIndex];
                if (cell) {
                    cell.classList.remove('filled');
                    cell.style.backgroundColor = '#bdc3c7';
                }
            }
            // Move columns left
            for (let c = col; c > 0; c--) {
                for (let r = 0; r < gridSize; r++) {
                    gameBoard[r][c] = gameBoard[r][c-1];
                    const fromIndex = r * gridSize + (c-1);
                    const toIndex = r * gridSize + c;
                    const fromCell = grid.children[fromIndex];
                    const toCell = grid.children[toIndex];
                    if (fromCell && toCell) {
                        toCell.className = fromCell.className;
                        toCell.style.backgroundColor = fromCell.style.backgroundColor;
                    }
                }
            }
            // Clear leftmost column
            for (let r = 0; r < gridSize; r++) {
                gameBoard[r][0] = 0;
                const cellIndex = r * gridSize + 0;
                const cell = grid.children[cellIndex];
                if (cell) {
                    cell.classList.remove('filled');
                    cell.style.backgroundColor = '#bdc3c7';
                }
            }
        }
    }
    
    // Add bonus points for cleared lines
    if (linesCleared > 0) {
        const bonus = linesCleared * 10;
        score += bonus;
        scoreElement.textContent = score;
        
        // Show clear message
        showMessage(`Cleared ${linesCleared} line${linesCleared > 1 ? 's' : ''}! +${bonus}`, 'win');
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 1500);
    }
}

// Check if game is over
function checkGameOver() {
    // Check if any piece can fit anywhere
    const emptyPreviews = Array.from(piecePreviews).filter(p => p.dataset.piece);
    
    if (emptyPreviews.length === 0) {
        generatePieces();
    }
    
    const pieces = Array.from(piecePreviews)
        .filter(p => p.dataset.piece)
        .map(p => ({
            shape: JSON.parse(p.dataset.piece),
            color: p.dataset.color
        }));
    
    let canPlaceAny = false;
    
    for (const piece of pieces) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (canPlacePiece(row, col, piece.shape)) {
                    canPlaceAny = true;
                    break;
                }
            }
            if (canPlaceAny) break;
        }
        if (canPlaceAny) break;
    }
    
    if (!canPlaceAny) {
        gameOver();
    }
}

// Game over
function gameOver() {
    messageElement.textContent = `Game Over! Final Score: ${score}`;
    messageElement.className = 'message lose';
    messageElement.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
}

// Show message
function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.classList.remove('hidden');
}

// Start game when loaded
window.addEventListener('load', initGame);