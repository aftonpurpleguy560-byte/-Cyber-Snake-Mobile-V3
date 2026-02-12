const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 20, score = 0, bestScore = localStorage.getItem('best') || 0;
let gameSpeed = 10, dx = 20, dy = 0, snake = [{x:160,y:160},{x:140,y:160},{x:120,y:160}];
let gameRunning = false, wallPass = false, primaryColor = "#00f3ff", godMode = false, currentLang = 'tr';

const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png';
let assetsLoaded = false;
snakeSprites.onload = () => assetsLoaded = true;

// 14 ÇEŞİT YEMEK SİSTEMİ
const foods = [
    {t:'🍎',p:5}, {t:'🍌',p:8}, {t:'🍇',p:10}, {t:'🍓',p:12}, {t:'🍍',p:20}, 
    {t:'🍉',p:30}, {t:'🍄',p:50}, {t:'🍅',p:14}, {t:'🍒',p:15}, {t:'🍑',p:18},
    {t:'🍐',p:7}, {t:'🍋',p:9}, {t:'🥝',p:25}, {t:'🌽',p:11}
];
let food = {x:0, y:0, type:'🍎', points:5};

const translations = {
    tr: {
        startBtn: "OYUNA BAŞLA", settingsBtn: "AYARLAR", readmeBtn: "GELİŞMİŞ",
        settingsTitle: "SİSTEM AYARLARI", langLabel: "DİL:", speedLabel: "HIZ:", wallsLabel: "DUVARLAR:", themeLabel: "TEMA:",
        saveBtn: "KAYDET", scoreLabel: "SKOR", bestLabel: "EN İYİ", slow: "YAVAŞ", normal: "NORMAL", fast: "HIZLI",
        die: "ÖLDÜRÜCÜ", pass: "GEÇİRGEN", readmeTitle: "SİSTEM KAYITLARI", exit: "KAPAT",
        gameOver: "SİSTEM DURDURULDU! SKOR: ", godOn: "GOD MODE: AKTİF", godOff: "GOD MODE: KAPALI"
    },
    en: {
        startBtn: "START GAME", settingsBtn: "SETTINGS", readmeBtn: "ADVANCED",
        settingsTitle: "SYSTEM SETTINGS", langLabel: "LANG:", speedLabel: "SPEED:", wallsLabel: "WALLS:", themeLabel: "THEME:",
        saveBtn: "SAVE", scoreLabel: "SCORE", bestLabel: "BEST", slow: "SLOW", normal: "NORMAL", fast: "FAST",
        die: "KILLER", pass: "PASSABLE", readmeTitle: "SYSTEM LOGS", exit: "CLOSE",
        gameOver: "SYSTEM HALTED! SCORE: ", godOn: "GOD MODE: ACTIVE", godOff: "GOD MODE: OFF"
    }
};

function setLang(lang) {
    currentLang = lang;
    const t = translations[lang];
    Object.keys(t).forEach(key => {
        const el = document.getElementById(key) || document.getElementById(key + 'Text');
        if(el) el.innerText = t[key];
    });
    // Özel ID eşleşmeleri
    document.getElementById('optSlow').innerText = t.slow;
    document.getElementById('optNormal').innerText = t.normal;
    document.getElementById('optFast').innerText = t.fast;
    document.getElementById('optDie').innerText = t.die;
    document.getElementById('optPass').innerText = t.pass;
}

// GOD MODE TOGGLE (İmzaya 3 Tık)
let clicks = 0, lastClick = 0;
document.addEventListener('click', e => {
    if(e.target.classList.contains('p-signature')) {
        if(Date.now() - lastClick < 500) clicks++; else clicks = 1;
        lastClick = Date.now();
        if(clicks === 3) {
            godMode = !godMode;
            score = godMode ? 5001 : 0;
            updateUI();
            alert(godMode ? translations[currentLang].godOn : translations[currentLang].godOff);
            clicks = 0;
        }
    }
});

function updateUI() {
    const s = document.getElementById('scoreVal');
    s.innerText = godMode ? score + " [GM]" : score;
    s.style.color = godMode ? "#0f4" : primaryColor;
    document.getElementById('bestScore').innerText = bestScore;
}

function drawSnake() {
    snake.forEach((p, i) => {
        if(assetsLoaded) {
            if(i === 0) ctx.drawImage(snakeSprites, 130, 210, 750, 550, p.x-4, p.y-4, gridSize+8, gridSize+8);
            else ctx.drawImage(snakeSprites, 75, 700, 280, 260, p.x, p.y, gridSize, gridSize);
        } else {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize-1, gridSize-1);
        }
    });
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else if(head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return gameOver();

    for(let i=1; i<snake.length; i++) if(head.x === snake[i].x && head.y === snake[i].y) return gameOver();

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) { score += food.points; updateUI(); createFood(); } else snake.pop();
}

function createFood() {
    const f = foods[Math.floor(Math.random()*foods.length)];
    food = { x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, type: f.t, points: f.p };
}

function drawFood() { ctx.font = "16px Arial"; ctx.fillText(food.type, food.x+2, food.y+16); }

function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000/gameSpeed);
}

function gameOver() {
    gameRunning = false;
    if(score > bestScore) { bestScore = score; localStorage.setItem('best', bestScore); }
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

window.openPage = (id) => { document.getElementById(id).style.display='flex'; };
window.closePage = (id) => { document.getElementById(id).style.display='none'; };
window.setSpeed = v => gameSpeed = parseInt(v);
window.setWallPass = v => wallPass = v;
window.setTheme = c => { primaryColor = c; document.documentElement.style.setProperty('--p-color', c); };
window.openAdvanced = () => { 
    if(prompt("PASS:") === "purpleguy2026") {
        document.getElementById('readme-content').innerText = "v3.8 FINAL:\n- 14 Foods\n- 5 Themes\n- Swipe Control\n- God Mode Active";
        openPage('advanced-page');
    }
};

setLang('tr');

