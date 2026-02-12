/**
 * Cyber Snake v3.8 Beta | Final Sprite & God Mode Toggle
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 20, score = 0;
let gameSpeed = 10, dx = 20, dy = 0;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let gameRunning = false, wallPass = false, currentLang = 'tr', primaryColor = "#00f3ff";

// --- SPRITE MOTORU (Senin 1024x1024 Resmine Özel) ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png'; 
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; window.setLang('tr'); };

const foodMatrix = [
    {t: '🍎', p: 5}, {t: '🍌', p: 8}, {t: '🍇', p: 10}, {t: '🍓', p: 12}, 
    {t: '🍍', p: 20}, {t: '🍉', p: 30}, {t: '🍄', p: 50}, {t: '🍅', p: 14}
];
let food = {x: 0, y: 0, type: '🍎', points: 5};

// --- GOD MODE TOGGLE (3 TIK - AÇ/KAPAT) ---
let clickCount = 0, lastClickTime = 0, godModeActive = false;
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('p-signature')) {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 500) clickCount++;
        else clickCount = 1;
        lastClickTime = currentTime;

        if (clickCount === 3) {
            godModeActive = !godModeActive;
            score = godModeActive ? 5001 : 0;
            updateScoreUI();
            alert(godModeActive ? "GOD MODE: AKTİF" : "NORMAL MODA DÖNÜLDÜ");
            clickCount = 0;
        }
    }
});

function updateScoreUI() {
    const sEl = document.getElementById('scoreVal');
    if(score >= 5000) { 
        sEl.innerText = score + " [GOD MODE]"; 
        sEl.style.color = "#00ff41";
    } else {
        sEl.innerText = score;
        sEl.style.color = "var(--p-color)";
    }
}

// --- YILAN ÇİZİMİ (RESMİNDEKİ YERLERE GÖRE AYARLANDI) ---
function drawSnake() {
    snake.forEach((p, i) => {
        if (assetsLoaded && snakeSprites.complete) {
            if (i === 0) {
                // KAFA: Resmin üst kısmındaki dev kafa (0,0'dan başlar)
                ctx.drawImage(snakeSprites, 130, 210, 750, 550, p.x-5, p.y-5, gridSize+10, gridSize+10);
            } else {
                // GÖVDE: Resmin sol altındaki mor kare parça
                ctx.drawImage(snakeSprites, 75, 700, 280, 260, p.x, p.y, gridSize, gridSize);
            }
        } else {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
        }
    });
}

// --- OYUN AKIŞI ---
function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else if(head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) return gameOver();

    for(let i=1; i<snake.length; i++) if(head.x===snake[i].x && head.y===snake[i].y) return gameOver();

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) { score += food.points; updateScoreUI(); createFood(); } 
    else snake.pop();
}

function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

function createFood() {
    const r = foodMatrix[Math.floor(Math.random() * foodMatrix.length)];
    food = { x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, type: r.t, points: r.p };
}
function drawFood() { ctx.font = "18px serif"; ctx.fillText(food.type, food.x + 2, food.y + 17); }
function gameOver() { gameRunning = false; alert("SİSTEM DURDU!"); location.reload(); }

window.startGame = () => {
    if(!assetsLoaded) return;
    const s = Math.min(window.innerWidth * 0.9, 400); canvas.width = canvas.height = Math.floor(s/20)*20;
    document.getElementById("menu").style.display = "none"; document.getElementById("stats").style.display = "flex";
    canvas.style.display = "block"; gameRunning = true; createFood(); main();
};

window.setLang = (l) => {
    const t = translations[l];
    document.getElementById('startBtn').innerText = t.startBtn;
    document.getElementById('scoreLabel').innerText = t.scoreLabel;
};

// Mobil ve Diğer Ayarlar
window.setSpeed = (v) => gameSpeed = parseInt(v);
window.setWallPass = (v) => wallPass = v;
window.setTheme = (c) => { primaryColor = c; document.documentElement.style.setProperty('--p-color', c); };
window.openSettings = () => { document.getElementById('settings-page').style.display='flex'; setTimeout(()=>document.getElementById('settings-page').style.opacity='1', 10); };
window.closePage = (id) => { document.getElementById(id).style.opacity = '0'; setTimeout(()=>document.getElementById(id).style.display='none', 400); };

