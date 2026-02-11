/**
 * Cyber Snake V3.8 beta | PWA & Mobil Uyumlu
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas"); // ID düzeltildi
const ctx = canvas.getContext("2d");
const GRID_SIZE = 40; 
const CANVAS_SIZE = 600;

let snake = [], food = {}, dx = GRID_SIZE, dy = 0, score = 0, gameActive = false;
let wallMode = "die", snakeColor = "#38bdf8", lastTime = 0, moveTimer = 0, moveInterval = 130; 
let godMode = false;

const fruits = ["🍎","🍉","🍇","🍍","🍓","🍒","🥝","🫐","🍊","🍋"];

// --- GOD MODE MANTIĞI ---
let godClicks = 0;
let lastGodClick = 0;

function toggleGodMode() {
    const now = Date.now();
    if (now - lastGodClick > 500) godClicks = 0;
    godClicks++;
    lastGodClick = now;

    if (godClicks === 3) {
        godMode = !godMode;
        document.getElementById("godStatus").style.visibility = godMode ? "visible" : "hidden";
        godClicks = 0;
    }
}

// HTML'deki ilgili alanlara tık dinleyici ekle
document.getElementById("godStatus").onclick = toggleGodMode;

function spawnNewFood() {
    let newX, newY, overlap = true;
    while (overlap) {
        newX = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        newY = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        overlap = snake.some(part => part.x === newX && part.y === newY);
    }
    food = { x: newX, y: newY, icon: fruits[Math.floor(Math.random() * fruits.length)] };
}

function draw() {
    ctx.fillStyle = "#010409"; 
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Izgara çizgileri
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for(let i=0; i<=CANVAS_SIZE; i+=GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_SIZE,i); ctx.stroke();
    }

    if(gameActive) {
        // Yemeği çiz
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(food.icon, food.x + GRID_SIZE / 2, food.y + GRID_SIZE / 2);

        // Yılanı çiz
        snake.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? snakeColor : "rgba(56, 189, 248, 0.5)";
            ctx.shadowBlur = 15;
            ctx.shadowColor = snakeColor;
            ctx.fillRect(part.x + 2, part.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            ctx.shadowBlur = 0;
        });
    }
}

function update() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallMode === "pass") {
        if(head.x < 0) head.x = CANVAS_SIZE - GRID_SIZE; else if(head.x >= CANVAS_SIZE) head.x = 0;
        if(head.y < 0) head.y = CANVAS_SIZE - GRID_SIZE; else if(head.y >= CANVAS_SIZE) head.y = 0;
    } else {
        if(head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) return endGame();
    }

    if(!godMode && snake.some((s, idx) => idx > 0 && s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        spawnNewFood();
    } else { snake.pop(); }
}

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    if (gameActive) {
        moveTimer += currentTime - lastTime;
        if (moveTimer >= moveInterval) { update(); moveTimer = 0; }
    }
    lastTime = currentTime;
    draw(); 
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    let hi = localStorage.getItem("best_v3") || 0;
    if(score > hi) localStorage.setItem("best_v3", score);
    document.getElementById("highScore").innerText = Math.max(score, hi).toString().padStart(3, '0');
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Buton Kontrolleri (HTML ID'lerine göre düzeltildi)
document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}, {x: 160, y: 240}];
    dx = GRID_SIZE; dy = 0; score = 0;
    document.getElementById("score").innerText = "000";
    gameActive = true; 
    spawnNewFood();
};

document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("backBtn").onclick = () => {
    moveInterval = parseInt(document.getElementById("difficulty").value);
    wallMode = document.getElementById("wallMode").value;
    document.getElementById("settingsMenu").classList.add("hidden");
};

document.getElementById("restartBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("startBtn").click();
};

// Dokunmatik Kontroller
let tX, tY;
canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; }, {passive: false});
canvas.addEventListener('touchmove', e => {
    if(!gameActive) return;
    let dX = e.touches[0].clientX - tX, dY = e.touches[0].clientY - tY;
    if(Math.abs(dX) > 30 || Math.abs(dY) > 30) {
        if(Math.abs(dX) > Math.abs(dY)) { if(dx === 0) { dx = dX > 0 ? GRID_SIZE : -GRID_SIZE; dy = 0; } }
        else { if(dy === 0) { dy = dY > 0 ? GRID_SIZE : -GRID_SIZE; dx = 0; } }
        tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    }
    e.preventDefault();
}, {passive: false});

window.onload = () => {
    canvas.width = CANVAS_SIZE; 
    canvas.height = CANVAS_SIZE;
    requestAnimationFrame(gameLoop);
};
