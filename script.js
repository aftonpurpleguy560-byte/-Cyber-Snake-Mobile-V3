/**
 * Cyber Snake v4.1.6 - Ultimate Efe Edition
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SİSTEM AYARLARI ---
let score = 0;
let gridSize = 20; // Oyun içi kare boyutu
let spriteUnit = 64; // Resimdeki bir parçanın tahmini boyutu (64 genelde standarttır)
let bestScore = localStorage.getItem('best') || 0;
let primaryColor = localStorage.getItem('theme') || "#00f3ff";
let gameSpeed = parseInt(localStorage.getItem('speed')) || 10;
let wallPassSetting = (localStorage.getItem('wallPass') === 'true');

let dx = 20, dy = 0;
let snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
let gameRunning = false, godMode = false;

// --- RESİM YÜKLEME ---
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

// --- EFE'NİN ÖZEL ÇİZİM MOTORU ---
function drawSnake() {
    snake.forEach((p, i) => {
        if (!assetsLoaded) {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
            return;
        }

        let sx = 0, sy = 0; 
        const next = snake[i + 1];
        const prev = snake[i - 1];

        // 1. KAFALAR (4 Yön)
        if (i === 0) {
            if (dx === 0 && dy < 0) { sx = 3 * spriteUnit; sy = 0; }      // Yukarı kafa
            else if (dx > 0 && dy === 0) { sx = 4 * spriteUnit; sy = 0; } // Sağ kafa
            else if (dx < 0 && dy === 0) { sx = 3 * spriteUnit; sy = 1 * spriteUnit; } // Sol kafa
            else if (dx === 0 && dy > 0) { sx = 4 * spriteUnit; sy = 1 * spriteUnit; } // Aşağı kafa
        } 
        // 2. KUYRUKLAR (4 Yön)
        else if (i === snake.length - 1) {
            if (prev.y < p.y) { sx = 3 * spriteUnit; sy = 2 * spriteUnit; }      // Yukarı kuyruk
            else if (prev.x > p.x) { sx = 4 * spriteUnit; sy = 2 * spriteUnit; } // Sağ kuyruk
            else if (prev.x < p.x) { sx = 3 * spriteUnit; sy = 3 * spriteUnit; } // Sol kuyruk
            else if (prev.y > p.y) { sx = 4 * spriteUnit; sy = 3 * spriteUnit; } // Aşağı kuyruk
        }
        // 3. GÖVDELER (2 Çeşit)
        else {
            // Yatay Gövde (Sağ-Sol)
            if (prev.x < p.x && next.x > p.x || next.x < p.x && prev.x > p.x) { 
                sx = 1 * spriteUnit; sy = 0; 
            } 
            // Dikey Gövde (Yukarı-Aşağı)
            else if (prev.y < p.y && next.y > p.y || next.y < p.y && prev.y > p.y) { 
                sx = 2 * spriteUnit; sy = 1 * spriteUnit; 
            } 
            // Kıvrımlar (Otomatik Dönüşler)
            else if (prev.x < p.x && next.y > p.y || next.x < p.x && prev.y > p.y) { sx = 0; sy = 0; } // Sol-Alt
            else if (prev.x < p.x && next.y < p.y || next.x < p.x && prev.y < p.y) { sx = 0; sy = 1 * spriteUnit; } // Sol-Üst
            else if (prev.y < p.y && next.x > p.x || next.y < p.y && prev.x > p.x) { sx = 2 * spriteUnit; sy = 0; } // Üst-Sağ
            else if (prev.y > p.y && next.x > p.x || next.y > p.y && prev.x > p.x) { sx = 2 * spriteUnit; sy = 2 * spriteUnit; } // Alt-Sağ
        }

        ctx.drawImage(snakeSprites, sx, sy, spriteUnit, spriteUnit, p.x, p.y, gridSize, gridSize);
    });
}

// --- OYUN MANTIĞI ---
function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (wallPassSetting || godMode) {
        if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
        if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;
    } else if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return gameOver();
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
    ctx.fillStyle = "black"; // Arka plan senin istediğin gibi siyah
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Yemek Çizimi
    ctx.font = "16px Arial";
    ctx.fillText(food.type, food.x + 2, food.y + 16);
    
    move();
    drawSnake();
    setTimeout(() => { requestAnimationFrame(main); }, 1000 / gameSpeed);
}

// --- BAŞLATMA VE ARA YÜZ ---
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
    alert("SİSTEM DURDURULDU! SKOR: " + score);
    location.reload(); 
}

// Kontroller ve Service Worker
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }

window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = gridSize; }
    else if (e.key === "ArrowLeft" && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === "ArrowRight" && dx === 0) { dx = gridSize; dy = 0; }
});

window.onload = () => {
    if (localStorage.getItem('theme')) document.documentElement.style.setProperty('--p-color', localStorage.getItem('theme'));
};

