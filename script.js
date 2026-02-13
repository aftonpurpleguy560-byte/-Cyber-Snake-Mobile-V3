/**
 * Cyber Snake v4.6.9 - Final Sprite Sync
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

// --- SPRITE MOTORU ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png';
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; };

// --- 🍎 15 ÇEŞİT SİBER YEMEK ---
const foods = [
    {t:'🍎',p:10}, {t:'🍌',p:15}, {t:'🍇',p:20}, {t:'🍓',p:25}, {t:'🍍',p:30}, 
    {t:'🍉',p:40}, {t:'🍄',p:50}, {t:'🍅',p:15}, {t:'🍒',p:20}, {t:'🍑',p:25},
    {t:'🍐',p:10}, {t:'🍋',p:15}, {t:'🥝',p:35}, {t:'🌽',p:20}, {t:'🥥',p:45}
];
let food = {x:0, y:0, type:'🍎', points:10};

// --- MENÜ VE SAYFA YÖNETİMİ ---
window.openPage = (id) => { document.getElementById(id).style.display = 'flex'; };
window.closePage = (id) => { document.getElementById(id).style.display = 'none'; };

window.startGame = () => {
    canvas.width = canvas.height = 300;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('stats').style.display = 'flex';
    canvas.style.display = 'block';
    gameRunning = true; score = 0; dx = gridSize; dy = 0;
    snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
    createFood(); main(); updateUI();
};

// --- 🎨 SİBER YILAN ÇİZİM MOTORU (256px SPRITE FIX) ---
function drawSnake() {
    const unit = 64; // Senin yaptığın 256/4'lük parçalar
    snake.forEach((p, i) => {
        if (!assetsLoaded) {
            ctx.fillStyle = primaryColor; ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
            return;
        }

        let sx = 0, sy = 0;
        const next = snake[i + 1], prev = snake[i - 1];

        if (i === 0) { // KAFA KATMANI
            if (dx > 0) { sx = 192; sy = 0; }      // Kafa Sağa (3,0)
            else if (dx < 0) { sx = 128; sy = 64; } // Kafa Sola (2,1)
            else if (dy < 0) { sx = 192; sy = 64; } // Kafa Yukarı (3,1)
            else { sx = 128; sy = 0; }             // Kafa Aşağı (2,0)
        } 
        else if (i === snake.length - 1) { // KUYRUK KATMANI
            if (prev.x < p.x) { sx = 64; sy = 192; }      // Kuyruk Sola
            else if (prev.x > p.x) { sx = 0; sy = 128; }  // Kuyruk Sağa
            else if (prev.y < p.y) { sx = 64; sy = 128; } // Kuyruk Yukarı
            else { sx = 0; sy = 192; }                    // Kuyruk Aşağı
        }
        else { // GÖVDE KATMANI
            if (prev.x !== next.x && prev.y !== next.y) { sx = 0; sy = 0; } // Köşe
            else if (prev.x !== next.x) { sx = 64; sy = 0; }                // Yatay Gövde
            else { sx = 64; sy = 64; }                                      // Dikey Gövde
        }

        ctx.drawImage(snakeSprites, sx, sy, unit, unit, p.x, p.y, gridSize, gridSize);
    });
}

// --- HAREKET VE MANTIK ---
function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallPassSetting) {
        if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
        if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;
    } else if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();

    if (!godMode) for (let i = 1; i < snake.length; i++) if (head.x === snake[i].x && head.y === snake[i].y) return gameOver();

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += food.points; 
        updateUI(); 
        if (score >= winScore) return gameWin();
        createFood();
    } else { snake.pop(); }
}

function main() {
    if (!gameRunning) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Yemek Çizimi
    ctx.font = "16px Arial";
    ctx.fillText(food.type, food.x + 2, food.y + 16);
    
    move(); drawSnake();
    setTimeout(() => { requestAnimationFrame(main); }, 1000 / gameSpeed);
}

function createFood() {
    const f = foods[Math.floor(Math.random() * foods.length)];
    food = { 
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, 
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        type: f.t,
        points: f.p
    };
}

function updateUI() {
    document.getElementById('scoreVal').innerText = score;
    document.getElementById('bestScore').innerText = bestScore;
}

function gameOver() {
    gameRunning = false;
    alert("BAĞLANTI KESİLDİ! \nNihai Skor: " + score);
    location.reload(); 
}

function gameWin() {
    gameRunning = false;
    alert("SİSTEM TAMAMEN ELE GEÇİRİLDİ! \nGörev başarıyla tamamlandı.");
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
        if (window.cC === 3) { 
            godMode = !godMode; 
            alert(godMode ? "ÖLÜMSÜZLÜK PROTOKOLÜ: AKTİF" : "ÖLÜMSÜZLÜK PROTOKOLÜ: DEVRE DIŞI");
        }
    }
});

window.setDifficulty = (v) => { localStorage.setItem('difficulty', v); location.reload(); };
window.setTheme = (c) => { localStorage.setItem('theme', c); location.reload(); };
window.setWallPass = (v) => { localStorage.setItem('wallPass', v); location.reload(); };
