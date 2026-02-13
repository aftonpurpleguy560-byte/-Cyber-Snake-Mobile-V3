/**
 * Cyber Snake v4.6.1 - Final Recovery & System Master
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SİSTEM PARAMETRELERİ ---
let score = 0;
let gridSize = 20; 
let bestScore = localStorage.getItem('best') || 0;
let primaryColor = localStorage.getItem('theme') || "#00f3ff";
let wallPassSetting = (localStorage.getItem('wallPass') === 'true');

// ZORLUK VE HEDEF SİSTEMİ
let difficulty = localStorage.getItem('difficulty') || 'normal'; 
let winScore = difficulty === 'kolay' ? 500 : (difficulty === 'zor' ? 2000 : 1000);
let gameSpeed = difficulty === 'kolay' ? 8 : (difficulty === 'zor' ? 15 : 10);

let dx = 20, dy = 0;
let snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
let gameRunning = false, godMode = false;

// --- SPRITE MOTORU (Cerrahi Netlik) ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png';
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; };

// --- UPWA+ / SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('UPWA+ Sistem Hazır');
        });
    });
}

// --- MENÜ VE SAYFA YÖNETİMİ ---
window.openPage = function(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; el.style.animation = 'fadeIn 0.3s ease'; }
};

window.closePage = function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
};

window.startGame = () => {
    const s = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = canvas.height = Math.floor(s / gridSize) * gridSize;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('stats').style.display = 'flex';
    canvas.style.display = 'block';
    gameRunning = true; score = 0; dx = gridSize; dy = 0;
    snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
    createFood(); main(); updateUI();
};

// --- 🎨 SİBER YILAN ÇİZİM MOTORU (Fix Build) ---
function drawSnake() {
    const unit = 64; // Resim 256px ise 4 parça = 64px
    snake.forEach((p, i) => {
        if (!assetsLoaded) {
            ctx.fillStyle = primaryColor; ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
            return;
        }

        let sx = 0, sy = 0;
        const next = snake[i + 1], prev = snake[i - 1];

        if (i === 0) { // KAFA (Sağa, Sola, Yukarı, Aşağı)
            if (dx > 0) { sx = 3 * unit; sy = 0; }
            else if (dx < 0) { sx = 2 * unit; sy = unit; }
            else if (dy < 0) { sx = 2 * unit; sy = 0; }
            else { sx = 3 * unit; sy = unit; }
        } else if (i === snake.length - 1) { // KUYRUK
            if (prev.x < p.x) { sx = 0; sy = 128; }
            else if (prev.x > p.x) { sx = 64; sy = 192; }
            else if (prev.y < p.y) { sx = 0; sy = 192; }
            else { sx = 64; sy = 128; }
        } else { // GÖVDE
            if (prev.x !== next.x && prev.y !== next.y) { sx = 0; sy = 0; }
            else if (prev.x !== next.x) { sx = 64; sy = 0; }
            else { sx = 64; sy = 64; }
        }
        ctx.drawImage(snakeSprites, sx, sy, 64, 64, p.x, p.y, gridSize, gridSize);
    });
}

// --- HAREKET VE OYUN MANTIĞI ---
function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallPassSetting) {
        if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
        if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;
    } else if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();

    if (!godMode) {
        for (let i = 1; i < snake.length; i++) if (head.x === snake[i].x && head.y === snake[i].y) return gameOver();
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10; updateUI(); 
        if (score >= winScore) return gameWin();
        createFood();
    } else { snake.pop(); }
}

function main() {
    if (!gameRunning) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Yemeği siber nokta olarak çiz
    ctx.fillStyle = "#ff003c";
    ctx.fillRect(food.x+2, food.y+2, gridSize-4, gridSize-4);
    
    move(); drawSnake();
    setTimeout(() => { requestAnimationFrame(main); }, 1000 / gameSpeed);
}

function createFood() {
    food = { 
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, 
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize 
    };
}

function updateUI() {
    document.getElementById('scoreVal').innerText = score;
    document.getElementById('bestScore').innerText = bestScore;
}

// --- OYUN SONU EKRANLARI ---
function gameOver() {
    gameRunning = false;
    if (score > bestScore) localStorage.setItem('best', score);
    alert("BAĞLANTI KESİLDİ! Skorun: " + score);
    location.reload(); 
}

function gameWin() {
    gameRunning = false;
    alert("SİSTEM ELE GEÇİRİLDİ! Tebrikler Efe, " + difficulty.toUpperCase() + " modu bitirdin!");
    location.reload();
}

// --- MOBİL SWIPE ---
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX)>30 && dx===0) {dx=dX>0?gridSize:-gridSize; dy=0;} }
    else { if (Math.abs(dY)>30 && dy===0) {dx=0; dy=dY>0?gridSize:-gridSize;} }
}, {passive:false});

// --- GOD MODE VE AYARLAR ---
document.addEventListener('click', e => {
    if (e.target.innerText && e.target.innerText.includes('Purpleguy')) {
        let now = Date.now();
        if (now - (window.lastC || 0) < 500) window.cC = (window.cC || 0) + 1; else window.cC = 1;
        window.lastC = now;
        if (window.cC === 3) { 
            godMode = !godMode; 
            alert(godMode ? "SİBER ÖLÜMSÜZLÜK: AKTİF ✅" : "SİBER ÖLÜMSÜZLÜK: DEAKTİF ❌");
            updateUI();
        }
    }
});

window.setDifficulty = (v) => { localStorage.setItem('difficulty', v); location.reload(); };
window.setTheme = (c) => { localStorage.setItem('theme', c); document.documentElement.style.setProperty('--p-color', c); };
window.setWallPass = (v) => { localStorage.setItem('wallPass', v); location.reload(); };
window.setLang = (l) => { alert("Dil: " + l.toUpperCase()); };
