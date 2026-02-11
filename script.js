/**
 * Cyber Snake v3.8 Beta | Mega Settings & Sound
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreValue");
const highVal = document.getElementById("highScoreValue");
const eatSound = document.getElementById("eatSound");

// --- SİSTEM DEĞİŞKENLERİ ---
let gridSize = 20;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}];
let food = { x: 0, y: 0, type: '🍎', points: 7 };
let dx = gridSize, dy = 0;
let score = 0, gameSpeed = 50, gameRunning = false, godMode = false;
let currentThemeColor = "#00f3ff", currentLang = 'tr', clickCount = 0;

let highScore = localStorage.getItem("cyberHighScore") || 0;
highVal.innerText = highScore.toString().padStart(3, '0');

// 10 Renk Paleti
const colorPalette = [
    {n: 'CYBER', c: '#00f3ff'}, {n: 'NEON', c: '#ff00ff'}, {n: 'RETRO', c: '#ff8c00'},
    {n: 'MATRIX', c: '#00ff41'}, {n: 'GOLD', c: '#ffd700'}, {n: 'LAVA', c: '#ff4500'},
    {n: 'AQUA', c: '#7fffd4'}, {n: 'PURPLE', c: '#9370db'}, {n: 'CORAL', c: '#f08080'}, {n: 'WHITE', c: '#ffffff'}
];

// Meyveler
const foodItems = [
    {i:'🍈',p:1},{i:'🍉',p:2},{i:'🍊',p:3},{i:'🍋',p:4},{i:'🍍',p:5},{i:'🥭',p:6},
    {i:'🍎',p:7},{i:'🍏',p:8},{i:'🍐',p:9},{i:'🍒',p:10},{i:'🍓',p:11},{i:'🫐',p:12},
    {i:'🥝',p:13},{i:'🍅',p:14}
];

// --- AYAR FONKSİYONLARI ---
window.setSpeed = (v) => { gameSpeed = parseInt(v); };
window.setLanguage = (l) => {
    currentLang = l;
    document.querySelector('.play-btn').innerText = (l === 'tr' ? "OYUNA BAŞLA" : "START GAME");
};
window.openThemePage = () => {
    const container = document.getElementById("themeButtons");
    container.innerHTML = "";
    colorPalette.forEach(t => {
        let btn = document.createElement("button");
        btn.innerText = t.n; btn.style.borderColor = t.c;
        btn.onclick = () => { currentThemeColor = t.c; canvas.style.borderColor = t.c; window.closeSubPage('theme-page'); };
        container.appendChild(btn);
    });
    document.getElementById('theme-page').style.display = 'flex';
};
window.closeSubPage = (id) => document.getElementById(id).style.display = 'none';
window.openAdvanced = () => {
    let p = prompt("Gelişmiş Erişim:");
    if(p === "purpleguy2026") { godMode = true; alert("SİBER GÜÇ AKTİF!"); }
};

// --- OYUN MOTORU ---
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.65);
    canvas.width = Math.floor(size / 20) * 20; canvas.height = canvas.width;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createFood() {
    let f = foodItems[Math.floor(Math.random()*foodItems.length)];
    food = { x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, 
             y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, 
             type: f.i, points: f.p };
}

function draw() {
    if (!gameRunning) return;
    ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Yemek Çizimi
    ctx.font = `${gridSize-4}px serif`;
    ctx.fillText(food.type, food.x, food.y + gridSize - 4);

    // Yılan Çizimi (Gözlü ve Kuyruklu)
    snake.forEach((part, i) => {
        ctx.fillStyle = godMode ? "#ff00ff" : currentThemeColor;
        if (i === 0) {
            ctx.fillRect(part.x, part.y, gridSize, gridSize);
            ctx.fillStyle = "white"; // Gözler
            ctx.fillRect(part.x+12, part.y+4, 4, 4); ctx.fillRect(part.x+12, part.y+12, 4, 4);
        } else {
            ctx.globalAlpha = 1 - (i / (snake.length + 5));
            ctx.fillRect(part.x+2, part.y+2, gridSize-4, gridSize-4);
            ctx.globalAlpha = 1;
        }
    });

    move();
    setTimeout(() => requestAnimationFrame(draw), 1000 / (gameSpeed / 10 + 5));
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;

    if (!godMode) {
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) { location.reload(); return; }
        }
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += food.points;
        eatSound.currentTime = 0; eatSound.play(); // SES ÇAL
        scoreVal.innerText = score.toString().padStart(3, '0');
        if (score > highScore) { highScore = score; localStorage.setItem("cyberHighScore", highScore); highVal.innerText = highScore.toString().padStart(3, '0'); }
        createFood();
    } else { snake.pop(); }
}

window.startGame = () => { document.getElementById("menu").style.display = "none"; gameRunning = true; createFood(); draw(); };

// Kaydırma (Swipe) Desteği
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; });
canvas.addEventListener('touchend', e => {
    let dX=e.changedTouches[0].clientX-tX, dY=e.changedTouches[0].clientY-tY;
    if (Math.abs(dX)>Math.abs(dY)) { if (dX>30 && dx===0) {dx=gridSize; dy=0;} else if (dX<-30 && dx===0) {dx=-gridSize; dy=0;} }
    else { if (dY>30 && dy===0) {dx=0; dy=gridSize;} else if (dY<-30 && dy===0) {dx=0; dy=-gridSize;} }
});
