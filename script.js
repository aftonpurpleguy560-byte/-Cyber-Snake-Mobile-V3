/**
 * Cyber Snake v4.5.0 - 216px Surgical Fix
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SİSTEM PARAMETRELERİ ---
let score = 0;
let gridSize = 20; 
let bestScore = localStorage.getItem('best') || 0;
let primaryColor = localStorage.getItem('theme') || "#00f3ff";
let gameSpeed = parseInt(localStorage.getItem('speed')) || 10;
let wallPassSetting = (localStorage.getItem('wallPass') === 'true');

let dx = 20, dy = 0;
let snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
let gameRunning = false, godMode = false;

// --- SPRITE MOTORU ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png';
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; };

// --- 15 ÇEŞİT SİBER YEMEK ---
const foods = [{t:'🍎',p:5},{t:'🍌',p:8},{t:'🍇',p:10},{t:'🍓',p:12},{t:'🍍',p:20},{t:'🍉',p:30},{t:'🍄',p:50},{t:'🍅',p:14},{t:'🍒',p:15},{t:'🍑',p:18},{t:'🍐',p:7},{t:'🍋',p:9},{t:'🥝',p:25},{t:'🌽',p:11},{t:'🥥',p:40}];
let food = {x:0, y:0, type:'🍎', points:5};

// --- UPWA+ / SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        });
    });
}

// --- MENÜ FONKSİYONLARI ---
window.openPage = function(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; el.style.animation = 'fadeIn 0.3s ease'; }
};
window.closePage = function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
};
window.startGame = () => {
    canvas.width = canvas.height = 300;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('stats').style.display = 'flex';
    canvas.style.display = 'block';
    gameRunning = true; score = 0; dx = gridSize; dy = 0;
    snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
    createFood(); main(); updateUI();
};

// --- 🎨 216x216 İÇİN DÜZELTİLMİŞ ÇİZİM MOTORU ---
function drawSnake() {
    // 216 pikseli 4'e bölüyoruz = 54 piksel
    const unit = 54; 

    snake.forEach((p, i) => {
        if (!assetsLoaded) {
            ctx.fillStyle = primaryColor; ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
            return;
        }
        let sx = 0, sy = 0;
        const next = snake[i + 1], prev = snake[i - 1];

        // Koordinatları 'unit' (54) ile çarparak alıyoruz
        if (i === 0) { // KAFA
            if (dx > 0) { sx = 3 * unit; sy = 0; }            // Sağ
            else if (dx < 0) { sx = 2 * unit; sy = unit; }    // Sol (Genelde sol 2. satırda olur)
            else if (dy < 0) { sx = 2 * unit; sy = 0; }       // Yukarı
            else { sx = 3 * unit; sy = unit; }                // Aşağı
        } 
        else if (i === snake.length - 1) { // KUYRUK
            if (prev.x < p.x) { sx = 2 * unit; sy = 3 * unit; }     // Sol
            else if (prev.x > p.x) { sx = 3 * unit; sy = 2 * unit; } // Sağ
            else if (prev.y < p.y) { sx = 2 * unit; sy = 2 * unit; } // Yukarı
            else { sx = 3 * unit; sy = 3 * unit; }                   // Aşağı
        }
        else { // GÖVDE
            if (prev.x !== next.x && prev.y !== next.y) { sx = 0; sy = 0; } // Köşe (Genelde sol üst)
            else if (prev.x !== next.x) { sx = unit; sy = 0; }      // Yatay
            else { sx = unit; sy = unit; }                          // Dikey
        }
        // Resimden 54x54 al, ekrana 20x20 bas
        ctx.drawImage(snakeSprites, sx, sy, unit, unit, p.x, p.y, gridSize, gridSize);
    });
}

// --- OYUN DÖNGÜSÜ ---
function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (godMode || wallPassSetting) {
        if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
        if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;
    } else if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();
    if (!godMode) for (let i = 1; i < snake.length; i++) if (head.x === snake[i].x && head.y === snake[i].y) return gameOver();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score += food.points; updateUI(); createFood(); } else { snake.pop(); }
}

function main() {
    if (!gameRunning) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(food.type, food.x + 2, food.y + 16);
    move(); drawSnake();
    setTimeout(() => { requestAnimationFrame(main); }, 1000 / gameSpeed);
}

function createFood() {
    const f = foods[Math.floor(Math.random()*foods.length)];
    food = { x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, type: f.t, points: f.p };
}

function updateUI() {
    document.getElementById('scoreVal').innerText = score;
    document.getElementById('bestScore').innerText = bestScore;
}

function gameOver() {
    gameRunning = false;
    alert("SKOR: " + score);
    location.reload(); 
}

// --- KONTROLLER ---
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX)>30 && dx===0) {dx=dX>0?gridSize:-gridSize; dy=0;} }
    else { if (Math.abs(dY)>30 && dy===0) {dx=0; dy=dY>0?gridSize:-gridSize;} }
}, {passive:false});

document.addEventListener('click', e => {
    if (e.target.innerText && e.target.innerText.includes('Purpleguy')) {
        let now = Date.now();
        if (now - (window.lastC || 0) < 500) window.cC = (window.cC || 0) + 1; else window.cC = 1;
        window.lastC = now;
        if (window.cC === 3) { godMode = !godMode; score = godMode ? 9999 : score; updateUI(); alert("GOD MODE!"); }
    }
});

// Ayarlar
window.setLang = (l) => { localStorage.setItem('lang', l); location.reload(); };
window.setTheme = (c) => { localStorage.setItem('theme', c); document.documentElement.style.setProperty('--p-color', c); };
window.setSpeed = (v) => { localStorage.setItem('speed', v); };
window.setWallPass = (v) => { localStorage.setItem('wallPass', v); };

