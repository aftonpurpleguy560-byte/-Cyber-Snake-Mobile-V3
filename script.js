/**
 * Cyber Snake v3.8 Beta | Full Menu & God Mode Toggle
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 20, score = 0;
let gameSpeed = 10, dx = 20, dy = 0;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let gameRunning = false, wallPass = false, currentLang = 'tr', primaryColor = "#00f3ff";

// --- SPRITE MOTORU ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png'; 
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; window.setLang('tr'); };

// --- SİBER MUTFAK (14'TEN GERİ GELENLER) ---
const foodMatrix = [
    {t: '🍎', p: 5}, {t: '🍌', p: 8}, {t: '🍇', p: 10}, {t: '🍓', p: 12}, 
    {t: ' Pineapple', p: 20}, {t: '🍉', p: 30}, {t: '🍄', p: 50}, {t: '🍅', p: 14}
];
let food = {x: 0, y: 0, type: '🍎', points: 5};

// --- GİZLİ GOD MODE TOGGLE (AÇ/KAPAT - 3 TIK) ---
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
            alert(godModeActive ? 
                (currentLang === 'tr' ? "SİSTEM BYPASS: GOD MODE AKTİF!" : "SYSTEM OVERRIDE: GOD MODE ACTIVE!") : 
                (currentLang === 'tr' ? "YETKİLER İPTAL: NORMAL MOD" : "AUTH REVOKED: NORMAL MODE"));
            clickCount = 0;
        }
    }
});

function updateScoreUI() {
    const sEl = document.getElementById('scoreVal');
    if(score >= 5000) { 
        sEl.innerText = score + " [GOD MODE]"; 
        sEl.style.color = "#00ff41";
        sEl.style.textShadow = "0 0 10px #00ff41";
    } else {
        sEl.innerText = score;
        sEl.style.color = "var(--p-color)";
        sEl.style.textShadow = "none";
    }
}

// --- YILAN ÇİZİMİ (KÜÇÜK SPRITE FIX) ---
function drawSnake() {
    snake.forEach((p, i) => {
        if (assetsLoaded && snakeSprites.complete) {
            // Resmin genişliğini tam ortadan ikiye bölerek kafa ve gövdeyi ayırır
            const sourceWidth = snakeSprites.width / 2;
            const sourceX = (i === 0) ? 0 : sourceWidth; 
            
            ctx.drawImage(
                snakeSprites, 
                sourceX, 0, sourceWidth, snakeSprites.height, 
                p.x, p.y, gridSize, gridSize
            );
        } else {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
        }
    });
}

// --- OYUN DÖNGÜSÜ ---
function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else if(head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) return gameOver();

    for(let i=1; i<snake.length; i++) if(head.x===snake[i].x && head.y===snake[i].y) return gameOver();

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) { 
        score += food.points; 
        updateScoreUI(); 
        createFood(); 
    } else snake.pop();
}

function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFood(); 
    move(); 
    drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

function drawFood() { 
    ctx.font = "18px serif"; 
    ctx.fillText(food.type, food.x + 2, food.y + 17); 
}

function createFood() {
    const r = foodMatrix[Math.floor(Math.random() * foodMatrix.length)];
    food = { 
        x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, 
        y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, 
        type: r.t, 
        points: r.p 
    };
}

function gameOver() { 
    gameRunning = false; 
    alert(currentLang === 'tr' ? "SİSTEM DURDURULDU! SKOR: " + score : "SYSTEM HALTED! SCORE: " + score); 
    location.reload(); 
}

// --- BAŞLATMA VE AYARLAR ---
window.startGame = () => {
    if(!assetsLoaded) return alert("Siber varlıklar yükleniyor...");
    const s = Math.min(window.innerWidth * 0.9, 400); 
    canvas.width = canvas.height = Math.floor(s/20)*20;
    document.getElementById("menu").style.display = "none"; 
    document.getElementById("stats").style.display = "flex";
    canvas.style.display = "block"; 
    gameRunning = true; 
    createFood(); 
    main();
};

window.setLang = (lang) => {
    currentLang = lang;
    if(typeof translations !== 'undefined' && translations[lang]) {
        const t = translations[lang];
        document.getElementById('startBtn').innerText = t.startBtn;
        document.getElementById('scoreLabel').innerText = t.scoreLabel;
        document.getElementById('bestLabel').innerText = t.bestLabel;
    }
};

// Mobil Kontroller
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX=e.changedTouches[0].clientX-tX, dY=e.changedTouches[0].clientY-tY;
    if(Math.abs(dX)>Math.abs(dY)) { if(dX>30 && dx===0) {dx=gridSize; dy=0;} else if(dX<-30 && dx===0) {dx=-gridSize; dy=0;} }
    else { if(dY>30 && dy===0) {dx=0; dy=gridSize;} else if(dY<-30 && dy===0) {dx=0; dy=-gridSize;} }
}, {passive:false});

window.setSpeed = (v) => gameSpeed = parseInt(v);
window.setWallPass = (v) => wallPass = v;
window.setTheme = (c) => { primaryColor = c; document.documentElement.style.setProperty('--p-color', c); };
window.openSettings = () => { document.getElementById('settings-page').style.display='flex'; setTimeout(()=>document.getElementById('settings-page').style.opacity='1', 10); };
window.closePage = (id) => { document.getElementById(id).style.opacity = '0'; setTimeout(()=>document.getElementById(id).style.display='none', 400); };

