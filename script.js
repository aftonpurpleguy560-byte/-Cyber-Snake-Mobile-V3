/**
 * Cyber Snake v4.1.3 - Pro Sprite Logic & 15 Foods
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SİSTEM AYARLARI ---
let score = 0;
let gridSize = 20;
let bestScore = localStorage.getItem('best') || 0;
let currentLang = localStorage.getItem('lang') || 'tr';
let primaryColor = localStorage.getItem('theme') || "#00f3ff";
let gameSpeed = parseInt(localStorage.getItem('speed')) || 10;
let wallPassSetting = (localStorage.getItem('wallPass') === 'true');

let dx = 20, dy = 0;
let snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
let gameRunning = false, godMode = false;

// --- SPRITE YÜKLEME ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png';
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; };

// --- 15 ÇEŞİT SİBER YEMEK ---
const foods = [
    {t:'🍎',p:5}, {t:'🍌',p:8}, {t:'🍇',p:10}, {t:'🍓',p:12}, {t:'🍍',p:20}, 
    {t:'🍉',p:30}, {t:'🍄',p:50}, {t:'🍅',p:14}, {t:'🍒',p:15}, {t:'🍑',p:18},
    {t:'🍐',p:7}, {t:'🍋',p:9}, {t:'🥝',p:25}, {t:'🌽',p:11}, {t:'🥥',p:40}
];
let food = {x:0, y:0, type:'🍎', points:5};

const translations = {
    tr: {
        gameOver: "SİSTEM DURDURULDU! SKOR: ", godOn: "GOD MODE: AKTİF", godOff: "GOD MODE: KAPALI"
    },
    en: {
        gameOver: "SYSTEM HALTED! SCORE: ", godOn: "GOD MODE: ACTIVE", godOff: "GOD MODE: OFF"
    }
};

// --- GELİŞMİŞ SPRITE ÇİZİM MOTORU ---
function drawSnake() {
    snake.forEach((p, i) => {
        if (!assetsLoaded) {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
            return;
        }

        let sx = 0, sy = 0; // Sprite koordinatları
        const head = snake[0];
        const next = snake[i + 1];
        const prev = snake[i - 1];

        // 1. KAFA ÇİZİMİ (Yönlere Göre)
        if (i === 0) {
            if (dx === 0 && dy === -gridSize) { sx = 192; sy = 0; }   // Yukarı
            else if (dx === gridSize && dy === 0) { sx = 256; sy = 0; } // Sağ
            else if (dx === -gridSize && dy === 0) { sx = 192; sy = 64; } // Sol
            else if (dx === 0 && dy === gridSize) { sx = 256; sy = 64; } // Aşağı
        } 
        // 2. KUYRUK ÇİZİMİ (Yönlere Göre)
        else if (i === snake.length - 1) {
            if (prev.y < p.y) { sx = 192; sy = 128; }      // Yukarı
            else if (prev.x > p.x) { sx = 256; sy = 128; } // Sağ
            else if (prev.x < p.x) { sx = 192; sy = 192; } // Sol
            else if (prev.y > p.y) { sx = 256; sy = 192; } // Aşağı
        }
        // 3. GÖVDE VE KIVRIMLAR
        else {
            // Düz Gövde
            if (prev.x < p.x && next.x > p.x || next.x < p.x && prev.x > p.x) { sx = 64; sy = 0; } // Yatay
            else if (prev.y < p.y && next.y > p.y || next.y < p.y && prev.y > p.y) { sx = 128; sy = 64; } // Dikey
            // Kıvrımlar (L Dönüşleri)
            else if (prev.x < p.x && next.y > p.y || next.x < p.x && prev.y > p.y) { sx = 0; sy = 0; }   // Sol-Alt
            else if (prev.x < p.x && next.y < p.y || next.x < p.x && prev.y < p.y) { sx = 0; sy = 64; }  // Sol-Üst
            else if (prev.y < p.y && next.x > p.x || next.y < p.y && prev.x > p.x) { sx = 128; sy = 0; } // Üst-Sağ
            else if (prev.y > p.y && next.x > p.x || next.y > p.y && prev.x > p.x) { sx = 128; sy = 128; } // Alt-Sağ
        }

        ctx.drawImage(snakeSprites, sx, sy, 64, 64, p.x, p.y, gridSize, gridSize);
    });
}

// --- OYUN MANTIĞI ---
function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallPassSetting) {
        if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
        if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;
    } else {
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();
    }

    if (!godMode) {
        for (let i = 1; i < snake.length; i++) if (head.x === snake[i].x && head.y === snake[i].y) return gameOver();
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += food.points; updateUI(); createFood();
    } else {
        snake.pop();
    }
}

function main() {
    if (!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Yemek Çizimi
    ctx.font = "16px Arial";
    ctx.fillText(food.type, food.x + 2, food.y + 16);
    
    move();
    drawSnake();
    setTimeout(() => { requestAnimationFrame(main); }, 1000 / gameSpeed);
}

// --- SİSTEM FONKSİYONLARI ---
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

function createFood() {
    const f = foods[Math.floor(Math.random() * foods.length)];
    food = { x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize, type: f.t, points: f.p };
}

function updateUI() {
    document.getElementById('scoreVal').innerText = godMode ? score + " [GOD]" : score;
    document.getElementById('bestScore').innerText = bestScore;
}

function gameOver() {
    gameRunning = false;
    if (score > bestScore) localStorage.setItem('best', score);
    alert(translations[currentLang].gameOver + score);
    location.reload(); 
}

// --- KONTROLLER & SW ---
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }

let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX)>30 && dx===0) {dx=dX>0?gridSize:-gridSize; dy=0;} }
    else { if (Math.abs(dY)>30 && dy===0) {dx=0; dy=dY>0?gridSize:-gridSize;} }
}, {passive:false});

document.addEventListener('click', e => {
    if (e.target.classList.contains('p-signature')) {
        let now = Date.now();
        if (now - (window.lastC || 0) < 500) window.cC = (window.cC || 0) + 1; else window.cC = 1;
        window.lastC = now;
        if (window.cC === 3) {
            godMode = !godMode; score = godMode ? 9999 : 0; updateUI();
            alert(godMode ? translations[currentLang].godOn : translations[currentLang].godOff);
        }
    }
});

window.onload = () => {
    window.setTheme(primaryColor);
};

