/**
 * Cyber Snake v4.0.2 - UPWA & 15 Foods Final Build
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- KALICI HAFIZA VE AYARLAR ---
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

// --- 15 ÇEŞİT YEMEK LİSTESİ ---
const foods = [
    {t:'🍎',p:5},  {t:'🍌',p:8},  {t:'🍇',p:10}, {t:'🍓',p:12}, {t:'🍍',p:20}, 
    {t:'🍉',p:30}, {t:'🍄',p:50}, {t:'🍅',p:14}, {t:'🍒',p:15}, {t:'🍑',p:18},
    {t:'🍐',p:7},  {t:'🍋',p:9},  {t:'🥝',p:25}, {t:'🌽',p:11}, {t:'🥥',p:40}
];
let food = {x:0, y:0, type:'🍎', points:5};

// --- DİL MOTORU ---
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

// --- UPWA: SERVICE WORKER VE BİLDİRİM KAYDI ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log("PWA Servis Kayıtlı.");
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') scheduleNotifications(reg);
        });
    });
}

// 20 Tane Bildirim Planlayıcı
function scheduleNotifications(reg) {
    const messages = [
        "Yılan acıkmaya başladı...",
        "Yılan seni görmeyi bekliyor.",
        "Yılan çok aç!",
        "Hadi Efe, siber rekor seni bekliyor!",
        "Yılan paslanıyor, bir şeyler yedir."
    ];

    for (let i = 1; i <= 20; i++) {
        // Bildirimleri 6 saatlik aralıklarla (rastgele sapmalı) planla
        let delay = i * (6 * 3600000) + (Math.random() * 3600000); 
        setTimeout(() => {
            reg.showNotification('Cyber Snake', {
                body: messages[Math.floor(Math.random() * messages.length)],
                icon: '/icon_large.png',
                badge: '/icon_large.png',
                tag: 'snake-notif-' + i
            });
        }, delay);
    }
}

// --- AYAR FONKSİYONLARI ---
window.setLang = (lang) => {
    currentLang = lang; localStorage.setItem('lang', lang);
    const t = translations[lang];
    Object.keys(t).forEach(id => { 
        const el = document.getElementById(id);
        if(el) el.innerText = t[id]; 
    });
    // Skor ve En İyi etiketlerini güncelle
    document.getElementById('scoreLabelText').innerText = t.scoreLabelText;
    document.getElementById('bestLabelText').innerText = t.bestLabelText;
};

window.setTheme = (c) => { 
    primaryColor = c; localStorage.setItem('theme', c); 
    document.documentElement.style.setProperty('--p-color', c); 
};

window.setSpeed = (v) => { 
    gameSpeed = parseInt(v); localStorage.setItem('speed', v); 
};

window.setWallPass = (v) => { 
    wallPassSetting = (v === true || v === 'true'); 
    localStorage.setItem('wallPass', wallPassSetting); 
};

window.openPage = (id) => { document.getElementById(id).style.display = 'flex'; };
window.closePage = (id) => { document.getElementById(id).style.display = 'none'; };

window.openAdvanced = () => { 
    if(prompt("PASS:") === "purpleguy2026") {
        const logs = currentLang === 'tr' ? 
            "SİSTEM LOGLARI [v4.0.2]:\n- UPWA: Aktif\n- 15 Yemek: Yüklendi\n- Bildirimler: Planlandı\n- Durum: Stabil" : 
            "SYSTEM LOGS [v4.0.2]:\n- UPWA: Active\n- 15 Foods: Loaded\n- Notifications: Scheduled\n- Status: Stable";
        document.getElementById('readme-content').innerText = logs;
        window.openPage('advanced-page');
    }
};

// --- OYUN MOTORU ---
window.startGame = () => {
    const s = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = canvas.height = Math.floor(s / gridSize) * gridSize;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('stats').style.display = 'flex';
    canvas.style.display = 'block';
    gameRunning = true; createFood(); main(); updateUI();
};

function drawSnake() {
    snake.forEach((p, i) => {
        if (assetsLoaded) {
            // Sprite koordinatları: 128 (Kafa), 64 (Gövde)
            if (i === 0) ctx.drawImage(snakeSprites, 128, 0, 64, 64, p.x, p.y, gridSize, gridSize);
            else ctx.drawImage(snakeSprites, 64, 0, 64, 64, p.x, p.y, gridSize, gridSize);
        } else {
            ctx.fillStyle = primaryColor; ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
        }
    });
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if(godMode || wallPassSetting) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else {
        if(head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();
    }

    if(!godMode) {
        for(let i = 1; i < snake.length; i++) {
            if(head.x === snake[i].x && head.y === snake[i].y) return gameOver();
        }
    }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += food.points; updateUI(); createFood();
    } else {
        snake.pop();
    }
}

function createFood() {
    const f = foods[Math.floor(Math.random() * foods.length)];
    food = { 
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, 
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize, 
        type: f.t, points: f.p 
    };
}

function drawFood() { 
    ctx.font = "16px Arial"; 
    ctx.fillText(food.type, food.x + 2, food.y + 16); 
}

function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.6)"; // Siyah arka plan izi
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

function updateUI() {
    document.getElementById('scoreVal').innerText = godMode ? score + " [GOD]" : score;
    document.getElementById('bestScore').innerText = bestScore;
}

function gameOver() {
    gameRunning = false;
    if(score > bestScore) localStorage.setItem('best', score);
    alert(translations[currentLang].gameOver + score);
    location.reload(); 
}

// --- KONTROLLER (SWIPE) ---
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if(Math.abs(dX) > Math.abs(dY)) { if(Math.abs(dX)>30 && dx===0) {dx=dX>0?gridSize:-gridSize; dy=0;} }
    else { if(Math.abs(dY)>30 && dy===0) {dx=0; dy=dY>0?gridSize:-gridSize;} }
}, {passive:false});

// --- GOD MODE (İmzaya 3 Tık) ---
document.addEventListener('click', e => {
    if(e.target.classList.contains('p-signature')) {
        let now = Date.now();
        if(now - (window.lastC || 0) < 500) window.cC = (window.cC || 0) + 1; else window.cC = 1;
        window.lastC = now;
        if(window.cC === 3) {
            godMode = !godMode; score = godMode ? 9999 : 0; updateUI();
            alert(godMode ? translations[currentLang].godOn : translations[currentLang].godOff);
        }
    }
});

// --- AÇILIŞ ---
window.onload = () => {
    window.setLang(currentLang);
    window.setTheme(primaryColor);
    // Select kutularını hafızaya göre eşitle
    if(document.querySelector('select[onchange*="setSpeed"]')) 
        document.querySelector('select[onchange*="setSpeed"]').value = gameSpeed;
    if(document.querySelector('select[onchange*="setWallPass"]')) 
        document.querySelector('select[onchange*="setWallPass"]').value = wallPassSetting.toString();
};
