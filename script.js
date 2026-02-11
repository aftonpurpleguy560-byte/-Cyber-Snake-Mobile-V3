const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; canvas.width = 600; canvas.height = 600;

let snake = [], food = {}, dx = GRID, dy = 0, score = 0, highScore = 0, gameActive = false;
let snakeColor = "#38bdf8", moveInterval = 130, lastTime = 0;
let wallMode = "die", usePowerUps = true;

const fruits = ["🍎","🍏","🍉","🍇","🍓","🍒","🍍","🥝","🫐"];

function spawnFood() {
    let rand = Math.random();
    let char = (usePowerUps && rand < 0.15) ? "⚡️" : (usePowerUps && rand < 0.25 ? "❄️" : fruits[Math.floor(Math.random() * fruits.length)]);
    food = { x: Math.floor(Math.random() * 15) * GRID, y: Math.floor(Math.random() * 15) * GRID, char: char };
}

function draw() {
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0,0,600,600);
    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? snakeColor : "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.roundRect(p.x+2, p.y+2, 36, 36, 10); ctx.fill();
    });
    ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(food.char, food.x + 20, food.y + 22);
}

function update() {
    let head = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (wallMode === "pass") {
        if (head.x < 0) head.x = 560; else if (head.x >= 600) head.x = 0;
        if (head.y < 0) head.y = 560; else if (head.y >= 600) head.y = 0;
    } else if (head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();

    if (snake.some(s => s.x === head.x && s.y === head.y)) return endGame();
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += (food.char === "⚡️" ? 20 : (food.char === "❄️" ? 5 : 10));
        if(food.char === "⚡️") moveInterval = Math.max(50, moveInterval - 20);
        if(food.char === "❄️") moveInterval = Math.min(200, moveInterval + 30);
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        if (score > highScore) { highScore = score; document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0'); }
        spawnFood();
    } else { snake.pop(); }
}

function gameLoop(t) {
    if (!lastTime) lastTime = t;
    if (gameActive && t - lastTime > moveInterval) { update(); lastTime = t; }
    draw(); requestAnimationFrame(gameLoop);
}

function changeColor(color, el) {
    snakeColor = color;
    document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
}

function endGame() { gameActive = false; document.getElementById("gameOverScreen").classList.remove("hidden"); }

document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}]; dx = GRID; dy = 0; score = 0; moveInterval = 130;
    document.getElementById("score").innerText = "000"; gameActive = true; spawnFood();
};

document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");

document.getElementById("saveBtn").onclick = () => {
    wallMode = document.getElementById("wallToggle").checked ? "pass" : "die";
    usePowerUps = document.getElementById("powerToggle").checked;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

document.getElementById("backMenuBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
};

document.getElementById("restartBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("startBtn").click();
};

// Joystick Kontrolü (Akıllı Tahta İçin)
let tX, tY;
canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; }, {passive: true});
canvas.addEventListener('touchmove', e => {
    if (!gameActive) return;
    let dX = e.touches[0].clientX - tX, dY = e.touches[0].clientY - tY;
    if (Math.abs(dX) > 30 || Math.abs(dY) > 30) {
        if (Math.abs(dX) > Math.abs(dY)) { if (dX > 0 && dx === 0) { dx = GRID; dy = 0; } else if (dX < 0 && dx === 0) { dx = -GRID; dy = 0; } }
        else { if (dY > 0 && dy === 0) { dy = GRID; dx = 0; } else if (dY < 0 && dy === 0) { dy = -GRID; dx = 0; } }
        tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    }
}, {passive: false});

requestAnimationFrame(gameLoop);
