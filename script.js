/**
 * Cyber Snake v3.8 | Ultimate Visual Edition
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const eatSound = document.getElementById("eatSound");

// --- AYARLAR VE DURUM ---
let gridSize = 20, score = 0, gameSpeed = 70;
let snake = [{x: 160, y: 160}, {x: 140, y: 160}, {x: 120, y: 160}];
let food = {x: 0, y: 0, type: '🍎', points: 7};
let dx = gridSize, dy = 0, gameRunning = false, wallPass = false;
let primaryColor = "#00f3ff", highScore = localStorage.getItem("best") || 0;

document.getElementById("highScoreValue").innerText = highScore.toString().padStart(3, '0');

// Renkler
const themes = [
    {n:'CYBER', c:'#00f3ff'}, {n:'NEON', c:'#ff00ff'}, {n:'GOLD', c:'#ffd700'},
    {n:'MATRIX', c:'#00ff41'}, {n:'LAVA', c:'#ff4500'}, {n:'WHITE', c:'#ffffff'}
];

// --- MENÜ SİSTEMİ (60 FPS) ---
window.openSettings = () => { openPage('settings-page'); };
window.openThemes = () => {
    const grid = document.getElementById("themeGrid");
    grid.innerHTML = "";
    themes.forEach(t => {
        const b = document.createElement("button");
        b.innerText = t.n; b.style.borderColor = t.c;
        b.onclick = () => { primaryColor = t.c; canvas.style.borderColor = t.c; window.closePage('theme-page'); };
        grid.appendChild(b);
    });
    openPage('theme-page');
};

function openPage(id) {
    const p = document.getElementById(id);
    p.style.display = 'flex';
    setTimeout(() => p.style.opacity = '1', 10);
}

window.closePage = (id) => {
    const p = document.getElementById(id);
    p.style.opacity = '0';
    setTimeout(() => p.style.display = 'none', 400);
};

window.setWallPass = (v) => wallPass = v;
window.setSpeed = (v) => gameSpeed = parseInt(v);

// --- OYUN MOTORU ---
function resize() {
    const s = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
    canvas.width = Math.floor(s/20)*20; canvas.height = canvas.width;
}
window.addEventListener('resize', resize); resize();

function createFood() {
    food.x = Math.floor(Math.random()*(canvas.width/gridSize))*gridSize;
    food.y = Math.floor(Math.random()*(canvas.height/gridSize))*gridSize;
}

function draw() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.3)"; // Hafif iz bırakma efekti
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yemek
    ctx.font = "18px serif";
    ctx.fillText(food.type, food.x + 2, food.y + 16);

    // Yılan Çizimi
    snake.forEach((part, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? primaryColor : `rgba(${hexToRgb(primaryColor)}, ${1 - i/snake.length})`;
        ctx.shadowBlur = isHead ? 15 : 0;
        ctx.shadowColor = primaryColor;
        
        // Yuvarlatılmış Kare
        drawRoundedRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, 5);

        if(isHead) { // Gözler
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.arc(part.x+14, part.y+6, 2, 0, 7); ctx.fill();
            ctx.beginPath(); ctx.arc(part.x+14, part.y+14, 2, 0, 7); ctx.fill();
        }
    });

    move();
    setTimeout(() => requestAnimationFrame(draw), 1000 / (gameSpeed/5 + 5));
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else if(head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) {
        location.reload(); return;
    }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += food.points; eatSound.play();
        document.getElementById("scoreValue").innerText = score.toString().padStart(3, '0');
        if(score > highScore) { highScore = score; localStorage.setItem("best", score); }
        createFood();
    } else snake.pop();
}

function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r); ctx.closePath(); ctx.fill();
}

function hexToRgb(hex) {
    let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return `${r}, ${g}, ${b}`;
}

window.startGame = () => {
    document.getElementById("menu").style.transform = "scale(0)";
    setTimeout(() => {
        document.getElementById("menu").style.display = "none";
        document.getElementById("gameStats").style.display = "flex";
        canvas.style.display = "block";
        gameRunning = true; createFood(); draw();
    }, 400);
};

// Kontroller (Swipe & Ok Tuşları)
document.addEventListener("keydown", e => {
    if(e.key === "ArrowUp" && dy === 0) {dx=0; dy=-gridSize;}
    if(e.key === "ArrowDown" && dy === 0) {dx=0; dy=gridSize;}
    if(e.key === "ArrowLeft" && dx === 0) {dx=-gridSize; dy=0;}
    if(e.key === "ArrowRight" && dx === 0) {dx=gridSize; dy=0;}
});
