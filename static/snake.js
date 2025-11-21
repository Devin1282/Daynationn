// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreDisplay = document.getElementById('current-score');
const highScoreDisplay = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Mobile controls
const upBtn = document.querySelector('.up-btn');
const downBtn = document.querySelector('.down-btn');
const leftBtn = document.querySelector('.left-btn');
const rightBtn = document.querySelector('.right-btn');

// Game settings
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = parseInt(highScoreDisplay.textContent) || 0;
let gameSpeed = 120;
let gameRunning = false;
let gameLoop;

// Initialize game
function initGame() {
    // Initialize snake
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];

    // Generate first food
    generateFood();

    // Reset game state
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    currentScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'none';
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };

    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#111';
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Draw head with different color
            ctx.fillStyle = '#4CAF50';
        } else {
            // Draw body
            ctx.fillStyle = '#8BC34A';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);

        // Add border to segments
        ctx.strokeStyle = '#0a0a0a';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Draw food
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Update game state
function update() {
    // Update direction
    direction = nextDirection;

    // Calculate new head position
    const head = {x: snake[0].x, y: snake[0].y};

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }

    // Check collision with self
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        currentScoreDisplay.textContent = score;

        // Generate new food
        generateFood();

        // Increase speed slightly
        if (gameSpeed > 60) {
            gameSpeed -= 2;
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Game loop
function runGame() {
    if (!gameRunning) return;

    update();
    draw();

    gameLoop = setTimeout(runGame, gameSpeed);
}

// Start game
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    startBtn.textContent = "Restart Game";
    runGame();
}

// Pause game
function pauseGame() {
    gameRunning = !gameRunning;
    pauseBtn.textContent = gameRunning ? "Pause" : "Resume";

    if (gameRunning) {
        runGame();
    } else {
        clearTimeout(gameLoop);
    }
}

// Reset game
function resetGame() {
    clearTimeout(gameLoop);
    gameRunning = false;
    pauseBtn.textContent = "Pause";
    initGame();
    draw();
    startBtn.textContent = "Start Game";
}

// Game over
function gameOver() {
    clearTimeout(gameLoop);
    gameRunning = false;

    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
    }

    // Save score to database
    fetch('/save_snake_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({score: score})
    });

    // Show game over screen
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

// Handle keyboard input
function handleKeydown(e) {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            if (gameRunning) {
                pauseGame();
            } else {
                startGame();
            }
            break;
    }
}

// Mobile controls
upBtn.addEventListener('click', () => { if (direction !== 'down') nextDirection = 'up'; });
downBtn.addEventListener('click', () => { if (direction !== 'up') nextDirection = 'down'; });
leftBtn.addEventListener('click', () => { if (direction !== 'right') nextDirection = 'left'; });
rightBtn.addEventListener('click', () => { if (direction !== 'left') nextDirection = 'right'; });

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeydown);

// Initialize and draw
initGame();
draw();