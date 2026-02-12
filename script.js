/**
 * Cyber Snake v4.2.7 - Green Chaos Edition
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SİSTEM HAFIZASI VE PARAMETRELER ---
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

// --- SPRITE MOTORU (256x256 Chaos Map) ---
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

// --- ÇEVİRİ VE DİL DESTEĞİ ---
const translations = {
    tr: {
        startBtn: "OYUNA BAŞLA", settingsBtn: "AYARLAR", advBtn: "GELİŞMİŞ",
        settingsTitle: "SİSTEM AYARLARI", langLabelText: "DİL:", speedLabelText: "HIZ:", wallsLabelText: "DUVARLAR:", themeLabelText: "TEMA:",
        saveBtn: "KAYDET", scoreLabelText: "SKOR", bestLabelText: "EN İYİ",
        gameOver: "SİSTEM DURDURULDU! SKOR: ", godOn: "GOD MODE: AKTİF", godOff: "GOD MODE: KAPALI"
    },
    en: {
        startBtn: "START GAME", settingsBtn: "SETTINGS", advBtn: "ADVANCED",
        settingsTitle: "SYSTEM SETTINGS", langLabelText: "LANG:", speedLabelText: "SPEED:", wallsLabelText: "WALLS:", themeLabelText: "THEME:",
        saveBtn: "SAVE", scoreLabelText: "SCORE", bestLabelText: "BEST",
        gameOver: "SYSTEM HALTED! SCORE: ", godOn: "GOD MODE: ACTIVE", godOff: "GOD MODE: OFF"
    }
};

// --- AKILLI BİLDİRİM SİSTEMİ (1 KERE) ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        if (!localStorage.getItem('notificationAsked') && Notification.permission === 'default') {
            Notification.requestPermission().then(p => {
                localStorage.setItem('notificationAsked', 'true');
                if (p === 'granted') scheduleNotifications(reg);
            });
        } else if (Notification.permission === 'granted') {
            scheduleNotifications(reg);
        }
    });
}

function scheduleNotifications(reg) {
    const msgs = ["Yılan çok acıktı!", "Efe, siber üs seni bekliyor.", "Yeni rekor zamanı!"];
    for (let i = 1; i <= 20; i++) {
        setTimeout(() => {
            reg.showNotification('Cyber Snake', {
                body: msgs[Math.floor(Math.random() * msgs.length)],
                icon: '/icon_large.png',
                tag: 'snake-notif-' + i
            });
        }, i * 21600000); // 6 saatte bir
    }
}

// --- 🎨 EFE'NİN KAOTİK RESMİNE ÖZEL ÇİZİM MOTORU ---
function drawSnake() {
    const unit = 64; // 256px / 4 parça = 64px

    snake.forEach((p, i) => {
        if (!assetsLoaded) {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
            return;
        }

        let sx = 0, sy = 0;
        const next = snake[i + 1];
        const prev = snake[i - 1];

        if (i === 0) { // KAFALAR
            if (dx === 0 && dy < 0) { sx = 2 * unit; sy = 0; }      
            else if (dx > 0 && dy === 0) { sx = 3 * unit; sy = 0; } 
            else if (dx < 0 && dy === 0) { sx = 2 * unit; sy = unit; } 
            else if (dx === 0 && dy > 0) { sx = 3 * unit; sy = unit; } 
        } 
        else if (i === snake.length - 1) { // KUYRUKLAR
            if (prev.y < p.y) { sx = 2 * unit; sy = 2 * unit; }
            else if (prev.x > p.x) { sx = 3 * unit; sy = 2 * unit; }
            else if (prev.x < p.x) { sx = 2 * unit; sy = 3 * unit; }
            else if (prev.y > p.y) { sx = 3 * unit; sy = 3 * unit; }
        }
        else { // GÖVDE
            if (prev.x < p.x && next.x > p.x || next.x < p.x && prev.x > p.x) { sx = unit; sy = 0; } 
            else if (prev.y < p.y && next.y > p.y || next.y < p.y && prev.y > p.y) { sx = unit; sy = unit; } 
            else { sx = 0; sy = 0; } 
        }

        ctx.drawImage(snakeSprites, sx, sy, unit, unit, p.x, p.y, gridSize, gridSize);
    });
}

// --- HAREKET MOTORU ---
function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallPassSetting) {
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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText(food.type, food.x + 2, food.y + 16);
    move(); drawSnake();
    setTimeout(() => { requestAnimationFrame(main); }, 1000 / gameSpeed);
}

// --- MENÜ VE AYARLAR ---
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

window.setLang = (l) => { currentLang = l; localStorage.setItem('lang', l); location.reload(); };
window.setTheme = (c) => { primaryColor = c; localStorage.setItem('theme', c); document.documentElement.style.setProperty('--p-color', c); };
window.setSpeed = (v) => { gameSpeed = parseInt(v); localStorage.setItem('speed', v); };
window.setWallPass = (v) => { wallPassSetting = (v === 'true'); localStorage.setItem('wallPass', v); };
window.openPage = (id) => { document.getElementById(id).style.display = 'flex'; };
window.closePage = (id) => { document.getElementById(id).style.display = 'none'; };

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

// --- SWIPE KONTROLÜ ---
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX)>30 && dx===0) {dx=dX>0?gridSize:-gridSize; dy=0;} }
    else { if (Math.abs(dY)>30 && dy===0) {dx=0; dy=dY>0?gridSize:-gridSize;} }
}, {passive:false});

// --- GOD MODE (İmzaya 3 Tık) ---
document.addEventListener('click', e => {
    if (e.target.innerText && e.target.innerText.includes('Purpleguy')) {
        let now = Date.now();
        if (now - (window.lastC || 0) < 500) window.cC = (window.cC || 0) + 1; else window.cC = 1;
        window.lastC = now;
        if (window.cC === 3) {
            godMode = !godMode; score = godMode ? 9999 : score; updateUI();
            alert(godMode ? translations[currentLang].godOn : translations[currentLang].godOff);
        }
    }
});

window.onload = () => {
    const t = translations[currentLang];
    Object.keys(t).forEach(id => { if (document.getElementById(id)) document.getElementById(id).innerText = t[id]; });
    window.setTheme(primaryColor);
};

