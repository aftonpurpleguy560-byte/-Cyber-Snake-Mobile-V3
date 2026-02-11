/**
 * Cyber Snake v3.8 Beta | RPG Speed & Bug Fix
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreValue");
const highVal = document.getElementById("highScoreValue");

// --- SİSTEM AYARLARI ---
let gridSize = 20;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let food = { x: 0, y: 0, type: '🍎', points: 7, isPower: false };
let dx = gridSize, dy = 0;
let score = 0;
let gameSpeed = 50;
let gameRunning = false, godMode = false;
let currentTheme = 'cyber';
let clickCount = 0;

// En İyi Skor (Sayfa yenilense de gitmez)
let highScore = localStorage.getItem("cyberHighScore") || 0;
highVal.innerText = highScore.toString().padStart(3, '0');

// RPG Meyve ve Güçlendirici Listesi
const foodItems = [
    { icon: '🍈', p: 1 }, { icon: '🍉', p: 2 }, { icon: '🍊', p: 3 }, { icon: '🍋', p: 4 },
    { icon: '🍍', p: 5 }, { icon: '🥭', p: 6 }, { icon: '🍎', p: 7 }, { icon: '🍏', p: 8 },
    { icon: '🍐', p: 9 }, { icon: '🍒', p: 10 }, { icon: '🍓', p: 11 }, { icon: '🫐', p: 12 },
    { icon: '🥝', p: 13 }, { icon: '🍅', p: 14 }
];

const powerUps = [
    { icon: '⚡️', s: 5, p: 2 }, { icon: '⭐️', s: 10, p: 4 },
    { icon: '❄️', s: -5, p: 1 }, { icon: '💠', s: -10, p: 2 }
];

const themes = {
    cyber: { head: "#00f3ff" }, neon: { head: "#ff00ff" },
    retro: { head: "#ff8c00" }, matrix: { head: "#00ff41" }, gold: { head: "#ffd700" }
};

// --- EKRAN VE KONTROL ---
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.65);
    canvas.width = Math.floor(size / 20) * 20;
    canvas.height = canvas.width;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Swipe (Kaydırma) Desteği
let tX = 0, tY = 0;
canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; });
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX;
    let dY = e.changedTouches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) {
        if (dX > 30 && dx === 0) { dx = gridSize; dy = 0; }
        else if (dX < -30 && dx === 0) { dx = -gridSize; dy = 0; }
    } else {
        if (dY > 30 && dy === 0) { dx = 0; dy = gridSize; }
        else if (dY < -30 && dy === 0) { dx = 0; dy = -gridSize; }
    }
});

// --- OYUN MANTIGI ---
function createFood() {
    let item = Math.random() > 0.15 ? foodItems[Math.floor(Math.random()*foodItems.length)] : null;
    if (item) {
        food = { x: 0, y: 0, type: item.icon, points: item.p, isPower: false };
    } else {
        let pwr = powerUps[Math.floor(Math.random()*powerUps.length)];
        food = { x: 0, y: 0, type: pwr.icon, points: pwr.p, isPower: true, sMod: pwr.s };
    }
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function draw() {
    if (!gameRunning) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yemek Çizimi
    ctx.font = `${gridSize-4}px serif`;
    ctx.fillText(food.type, food.x, food.y + gridSize - 4);

    // Yılan Çizimi
    snake.forEach((part, i) => {
        ctx.fillStyle = godMode ? "#ff00ff" : themes[currentTheme].head;
        if (i === 0) {
            ctx.fillRect(part.x, part.y, gridSize, gridSize);
            // Gözler
            ctx.fillStyle = "white";
            let e = 4;
            if (dx > 0) { ctx.fillRect(part.x+12, part.y+4, e, e); ctx.fillRect(part.x+12, part.y+12, e, e); }
            else if (dx < 0) { ctx.fillRect(part.x+4, part.y+4, e, e); ctx.fillRect(part.x+4, part.y+12, e, e); }
            else if (dy < 0) { ctx.fillRect(part.x+4, part.y+4, e, e); ctx.fillRect(part.x+12, part.y+4, e, e); }
            else { ctx.fillRect(part.x+4, part.y+12, e, e); ctx.fillRect(part.x+12, part.y+12, e, e); }
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
        if (food.isPower) gameSpeed = Math.max(10, gameSpeed + food.sMod);
        scoreVal.innerText = score.toString().padStart(3, '0');
        if (score > highScore) { highScore = score; localStorage.setItem("cyberHighScore", highScore); highVal.innerText = highScore.toString().padStart(3, '0'); }
        createFood();
    } else { snake.pop(); }
}

// Menü Fonksiyonları
window.startGame = (mode) => {
    if (mode === 'yavas') gameSpeed = 20;
    else if (mode === 'hizli') gameSpeed = 100;
    else gameSpeed = 50;
    document.getElementById("menu").style.display = "none";
    gameRunning = true; createFood(); draw();
};

window.changeTheme = (t) => { currentTheme = t; canvas.style.borderColor = themes[t].head; };
window.openReadme = () => window.open("https://github.com/Efe/Cyber-Snake/blob/main/README.md", '_blank');

// Siber Güç (3 Tık)
document.addEventListener('click', (e) => {
    if (e.target.innerText && e.target.innerText.includes("Purpleguy")) {
        clickCount++;
        if (clickCount === 3) { godMode = !godMode; alert("SİBER GÜÇ: AKTİF"); clickCount = 0; }
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = gridSize; }
    else if (e.key === "ArrowLeft" && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === "ArrowRight" && dx === 0) { dx = gridSize; dy = 0; }
});
