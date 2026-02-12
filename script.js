/**
 * Cyber Snake v3.8 Beta | Multi-Lang & Theme Fix
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 20, score = 0, bestScore = 0;
let gameSpeed = 10; 
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let dx = 20, dy = 0, gameRunning = false, wallPass = false;
let currentLang = 'tr';
let primaryColor = "#00f3ff";

// 14 Çeşit RPG Yemek Matrisi
const foodMatrix = [
    {t: '🍎', p: 5}, {t: '🍏', p: 5}, {t: '🍌', p: 8}, {t: '🍇', p: 10}, 
    {t: '🍓', p: 12}, {t: '🍒', p: 15}, {t: '🍍', p: 20}, {t: '🥭', p: 25}, 
    {t: '🍉', p: 30}, {t: '🥦', p: 3}, {t: '🌽', p: 7}, {t: '🥕', p: 6}, 
    {t: '🍄', p: 50}, {t: '🍅', p: 14}
];
let food = {x: 0, y: 0, type: '🍎', points: 5};

// --- DİL VE ÇEVİRİ MOTORU ---
window.setLang = (lang) => {
    currentLang = lang;
    const t = translations[lang];
    
    // HTML Elementlerini Çevirilerle Bağla
    document.getElementById('startBtn').innerText = t.startBtn;
    document.getElementById('settingsBtn').innerText = t.settingsBtn;
    document.getElementById('settingsTitle').innerText = t.settingsTitle;
    document.getElementById('speedLabelText').innerText = t.speedLabel;
    document.getElementById('wallsLabelText').innerText = t.wallsLabel;
    document.getElementById('themeLabelText').innerText = t.themeLabel;
    document.getElementById('saveBtn').innerText = t.saveBtn;
    
    document.getElementById('optSlow').innerText = t.slow;
    document.getElementById('optNormal').innerText = t.normal;
    document.getElementById('optFast').innerText = t.fast;
    document.getElementById('optDie').innerText = t.die;
    document.getElementById('optPass').innerText = t.pass;

    document.getElementById('scoreLabel').innerText = t.scoreLabel;
    document.getElementById('bestLabel').innerText = t.bestLabel;
};

// --- TEMA MOTORU ---
window.setTheme = (color) => {
    primaryColor = color;
    document.documentElement.style.setProperty('--p-color', color);
    canvas.style.borderColor = color;
};

// --- GELİŞMİŞ AYARLAR & README ---
window.openAdvanced = () => {
    let p = prompt("GELİŞMİŞ ERİŞİM ŞİFRESİ:");
    if(p === "purpleguy2026") {
        document.getElementById('readme-content').innerText = `
🐍 CYBER SNAKE V3.8 BETA | THE SYSTEM CRUSHER
AUTHORIZED ACCESS ONLY: Purpleguy © 2026

DİKKAT SAHTE DOSTLAR:
Bu proje sizin "basit" dediğiniz dünyayı siber bir labirente çevirdi.

TEKNİK:
- 14 RPG Meyve Matrisi Aktif.
- 0.5x, 1x, 2x Vitesler.
- Purpleguy Siber İmzalı Koruma.

RÜTBE:
0-50: Boş Yapıcı | 501-5000: Matrix Agent | 5000+: GOD MODE

SİBER DEVRİM BAŞLADI.`;
        openPage('advanced-page');
    } else { alert("YETKİSİZ ERİŞİM!"); }
};

window.confirmExit = () => {
    let lock = prompt("VERSİYON ŞİFRESİ:");
    if(lock === "3.8 beta") {
        window.closePage('advanced-page');
    } else {
        location.reload();
    }
};

// --- MENÜ KONTROLLERİ ---
window.openSettings = () => openPage('settings-page');
window.closePage = (id) => {
    document.getElementById(id).style.opacity = '0';
    setTimeout(() => document.getElementById(id).style.display = 'none', 400);
};
function openPage(id) {
    const p = document.getElementById(id);
    p.style.display = 'flex';
    setTimeout(() => p.style.opacity = '1', 10);
}

// --- OYUN MOTORU ---
function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawFood();
    move();
    drawSnake();
    
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else if(head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) {
        gameOver(); return;
    }

    for(let i=1; i<snake.length; i++) if(head.x===snake[i].x && head.y===snake[i].y) { gameOver(); return; }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += food.points;
        document.getElementById('scoreVal').innerText = score;
        createFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? primaryColor : `rgba(0, 243, 255, ${1 - i/snake.length})`;
        ctx.fillRect(p.x + 1, p.y + 1, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.font = "18px serif";
    ctx.fillText(food.type, food.x + 2, food.y + 17);
}

function createFood() {
    const r = foodMatrix[Math.floor(Math.random() * foodMatrix.length)];
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        type: r.t, points: r.p
    };
}

function gameOver() {
    gameRunning = false;
    alert(translations[currentLang].systemHalt + "\nSkor: " + score);
    if(score > bestScore) bestScore = score;
    location.reload();
}

window.startGame = () => {
    const s = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = canvas.height = Math.floor(s / 20) * 20;
    document.getElementById("menu").style.display = "none";
    document.getElementById("stats").style.display = "flex";
    canvas.style.display = "block";
    gameRunning = true;
    createFood();
    main();
};

// Swipe Kontrolleri (Mobil)
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; e.preventDefault(); }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX=e.changedTouches[0].clientX-tX, dY=e.changedTouches[0].clientY-tY;
    if(Math.abs(dX)>Math.abs(dY)) {
        if(dX>30 && dx===0) {dx=gridSize; dy=0;} else if(dX<-30 && dx===0) {dx=-gridSize; dy=0;}
    } else {
        if(dY>30 && dy===0) {dx=0; dy=gridSize;} else if(dY<-30 && dy===0) {dx=0; dy=-gridSize;}
    }
}, {passive:false});

window.setSpeed = (v) => gameSpeed = parseInt(v);
window.setWallPass = (v) => wallPass = v;

// Başlangıç Ayarı
window.setLang('tr');
