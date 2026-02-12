/**
 * Cyber Snake v3.8 Final Stable Build
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- KALICI HAFIZA & AYARLAR ---
let score = 0;
let gridSize = 20;
let bestScore = localStorage.getItem('best') || 0;
let currentLang = localStorage.getItem('lang') || 'tr';
let primaryColor = localStorage.getItem('theme') || "#00f3ff";
let gameSpeed = parseInt(localStorage.getItem('speed')) || 10;
let wallPassSetting = localStorage.getItem('wallPass') === 'true';

let dx = 20, dy = 0;
let snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
let gameRunning = false, godMode = false;

// --- SPRITE YÜKLEME ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png';
let assetsLoaded = false;
snakeSprites.onload = () => assetsLoaded = true;

// --- 14 ÇEŞİT YEMEK ---
const foods = [
    {t:'🍎',p:5}, {t:'🍌',p:8}, {t:'🍇',p:10}, {t:'🍓',p:12}, {t:'🍍',p:20}, 
    {t:'🍉',p:30}, {t:'🍄',p:50}, {t:'🍅',p:14}, {t:'🍒',p:15}, {t:'🍑',p:18},
    {t:'🍐',p:7}, {t:'🍋',p:9}, {t:'🥝',p:25}, {t:'🌽',p:11}
];
let food = {x:0, y:0, type:'🍎', points:5};

// --- DİL MOTORU ---
const translations = {
    tr: {
        startBtn: "OYUNA BAŞLA", settingsBtn: "AYARLAR", advBtn: "GELİŞMİŞ",
        settingsTitle: "SİSTEM AYARLARI", langLabelText: "DİL:", speedLabelText: "HIZ:", wallsLabelText: "DUVARLAR:", themeLabelText: "TEMA:",
        saveBtn: "KAYDET", scoreLabel: "SKOR", bestLabel: "EN İYİ", slow: "YAVAŞ", normal: "NORMAL", fast: "HIZLI",
        die: "ÖLDÜRÜCÜ", pass: "GEÇİRGEN", readmeTitle: "SİSTEM KAYITLARI", readmeExitBtn: "KAPAT",
        gameOver: "SİSTEM DURDURULDU! SKOR: ", godOn: "GOD MODE: AKTİF", godOff: "GOD MODE: KAPALI"
    },
    en: {
        startBtn: "START GAME", settingsBtn: "SETTINGS", advBtn: "ADVANCED",
        settingsTitle: "SYSTEM SETTINGS", langLabelText: "LANG:", speedLabelText: "SPEED:", wallsLabelText: "WALLS:", themeLabelText: "THEME:",
        saveBtn: "SAVE", scoreLabel: "SCORE", bestLabel: "BEST", slow: "SLOW", normal: "NORMAL", fast: "FAST",
        die: "KILLER", pass: "PASSABLE", readmeTitle: "SYSTEM LOGS", readmeExitBtn: "CLOSE",
        gameOver: "SYSTEM HALTED! SCORE: ", godOn: "GOD MODE: ACTIVE", godOff: "GOD MODE: OFF"
    }
};

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const t = translations[lang];
    
    // Metinleri Güncelle
    Object.keys(t).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = t[id];
    });

    // Select Kutusunu Eşitle
    const langSelect = document.querySelector('select[onchange*="setLang"]');
    if(langSelect) langSelect.value = lang;

    document.getElementById('scoreLabel').innerText = t.scoreLabel;
    document.getElementById('bestLabel').innerText = t.bestLabel;
}

function setTheme(c) {
    primaryColor = c;
    localStorage.setItem('theme', c);
    document.documentElement.style.setProperty('--p-color', c);
    const themeSelect = document.querySelector('select[onchange*="setTheme"]');
    if(themeSelect) themeSelect.value = c;
}

function setSpeed(v) {
    gameSpeed = parseInt(v);
    localStorage.setItem('speed', v);
}

function setWallPass(v) {
    wallPassSetting = (v === true || v === 'true');
    localStorage.setItem('wallPass', wallPassSetting);
}

// --- GOD MODE (İmzaya 3 Tık) ---
let clicks = 0, lastClick = 0;
document.addEventListener('click', e => {
    if(e.target.classList.contains('p-signature')) {
        if(Date.now() - lastClick < 500) clicks++; else clicks = 1;
        lastClick = Date.now();
        if(clicks === 3) {
            godMode = !godMode;
            score = godMode ? 9999 : 0;
            updateUI();
            alert(godMode ? translations[currentLang].godOn : translations[currentLang].godOff);
            clicks = 0;
        }
    }
});

function updateUI() {
    const s = document.getElementById('scoreVal');
    s.innerText = godMode ? score + " [GOD]" : score;
    s.style.color = godMode ? "#0f4" : primaryColor;
    document.getElementById('bestScore').innerText = bestScore;
}

// --- OYUN MOTORU ---
function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if(godMode || wallPassSetting) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else {
        if(head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();
    }

    if(!godMode) {
        for(let i=1; i<snake.length; i++) if(head.x === snake[i].x && head.y === snake[i].y) return gameOver();
    }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) { score += food.points; updateUI(); createFood(); } else snake.pop();
}

function drawSnake() {
    snake.forEach((p, i) => {
        if(assetsLoaded) {
            if(i === 0) ctx.drawImage(snakeSprites, 192, 0, 64, 64, p.x, p.y, gridSize, gridSize);
            else ctx.drawImage(snakeSprites, 64, 0, 64, 64, p.x, p.y, gridSize, gridSize);
        } else {
            ctx.fillStyle = primaryColor; ctx.fillRect(p.x, p.y, gridSize-1, gridSize-1);
        }
    });
}

function createFood() {
    const f = foods[Math.floor(Math.random()*foods.length)];
    food = { 
        x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, 
        y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, 
        type: f.t, points: f.p 
    };
}

function drawFood() { ctx.font = "16px Arial"; ctx.fillText(food.type, food.x+2, food.y+16); }

function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000/gameSpeed);
}

function gameOver() {
    gameRunning = false;
    if(score > bestScore) localStorage.setItem('best', score);
    alert(translations[currentLang].gameOver + score);
    location.reload(); 
}

window.startGame = () => {
    const s = Math.min(window.innerWidth*0.9, 400);
    canvas.width = canvas.height = Math.floor(s/gridSize)*gridSize;
    document.getElementById('menu').style.display='none';
    document.getElementById('stats').style.display='flex';
    canvas.style.display='block';
    gameRunning = true; createFood(); main(); updateUI();
};

// --- SWIPE (KAYDIRMA) MOTORU ---
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if(Math.abs(dX) > Math.abs(dY)) { if(Math.abs(dX)>30 && dx===0) {dx=dX>0?gridSize:-gridSize; dy=0;} }
    else { if(Math.abs(dY)>30 && dy===0) {dx=0; dy=dY>0?gridSize:-gridSize;} }
}, {passive:false});

window.openPage = (id) => { document.getElementById(id).style.display='flex'; };
window.closePage = (id) => { document.getElementById(id).style.display='none'; };

window.openAdvanced = () => { 
    if(prompt("PASS:") === "purpleguy2026") {
        const logs = currentLang === 'tr' ? 
            "SİSTEM LOGLARI [v3.8]:\n- Bellek: OK\n- God Mode: Fix\n- Dil Senkronu: OK\n- 14 Yemek: Aktif" : 
            "SYSTEM LOGS [v3.8]:\n- Memory: OK\n- God Mode: Fix\n- Lang Sync: OK\n- 14 Foods: Active";
        document.getElementById('readme-content').innerText = logs;
        openPage('advanced-page');
    }
};

// --- AÇILIŞ SENKRONU ---
window.onload = () => {
    setLang(currentLang);
    setTheme(primaryColor);
    document.querySelector('select[onchange*="setSpeed"]').value = gameSpeed;
    document.querySelector('select[onchange*="setWallPass"]').value = wallPassSetting.toString();
};
