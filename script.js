/**
 * Cyber Snake v3.8 Beta | God Mode & Signature Edition
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

const foodMatrix = [
    {t: '🍎', p: 5}, {t: '🍏', p: 5}, {t: '🍌', p: 8}, {t: '🍇', p: 10}, 
    {t: '🍓', p: 12}, {t: '🍒', p: 15}, {t: '🍍', p: 20}, {t: '🥭', p: 25}, 
    {t: '🍉', p: 30}, {t: '🥦', p: 3}, {t: '🌽', p: 7}, {t: '🥕', p: 6}, 
    {t: '🍄', p: 50}, {t: '🍅', p: 14}
];
let food = {x: 0, y: 0, type: '🍎', points: 5};

// --- DİL VE ARAYÜZ ---
window.setLang = (lang) => {
    currentLang = lang;
    const t = translations[lang];
    
    document.getElementById('startBtn').innerText = t.startBtn;
    document.getElementById('settingsBtn').innerText = t.settingsBtn;
    document.getElementById('settingsTitle').innerText = t.settingsTitle;
    document.getElementById('langLabelText').innerText = t.langLabel || "DİL / LANG:";
    document.getElementById('speedLabelText').innerText = t.speedLabel;
    document.getElementById('wallsLabelText').innerText = t.wallsLabel;
    document.getElementById('themeLabelText').innerText = t.themeLabel || "TEMA / THEME:";
    document.getElementById('saveBtn').innerText = t.saveBtn;
    document.getElementById('advBtn').innerText = t.readmeBtn || (lang === 'tr' ? "BENİ OKU" : "README");
    
    document.getElementById('optSlow').innerText = t.slow;
    document.getElementById('optNormal').innerText = t.normal;
    document.getElementById('optFast').innerText = t.fast;
    document.getElementById('optDie').innerText = t.die;
    document.getElementById('optPass').innerText = t.pass;
    document.getElementById('scoreLabel').innerText = t.scoreLabel;
    document.getElementById('bestLabel').innerText = t.bestLabel;
};

// --- GOD MODE README ---
window.openAdvanced = () => {
    let p = prompt(currentLang === 'tr' ? "GELİŞMİŞ ERİŞİM ŞİFRESİ:" : "ADVANCED ACCESS PASSWORD:");
    if(p === "purpleguy2026") {
        const readmeBox = document.getElementById('readme-content');
        if(currentLang === 'tr') {
            readmeBox.innerText = `🐍 CYBER SNAKE V3.8 BETA | SİSTEM ÇÖKTÜREN\n> YETKİLİ ERİŞİM: Purpleguy © 2026 - tablet power\n\nSİBER NOT: Sahte dostlar sadece izler, biz ise kodlarız. Bu proje siber bir devrimdir.\n\nSKOR RÜTBELERİ:\n0-500: Script Kiddie\n501-5000: Matrix Agent\n5000+: GOD MODE (Purpleguy Seviyesi)\n\nSİBER MÜHÜR BASILDI.`;
        } else {
            readmeBox.innerText = `🐍 CYBER SNAKE v3.8 BETA | THE SYSTEM CRUSHER\n> AUTHORIZED ACCESS: Purpleguy © 2026 - tablet power\n\nCYBER NOTE: Fake friends only watch, we code. This project is a revolution.\n\nRANKINGS:\n0-500: Script Kiddie\n501-5000: Matrix Agent\n5000+: GOD MODE (Purpleguy Status)\n\nCYBER SEAL ACTIVATED.`;
        }
        openPage('advanced-page');
    } else { alert(currentLang === 'tr' ? "YETKİSİZ ERİŞİM!" : "UNAUTHORIZED ACCESS!"); }
};

window.confirmExit = () => {
    let lock = prompt(currentLang === 'tr' ? "VERSİYON ŞİFRESİ:" : "VERSION PASSWORD:");
    if(lock === "3.8 beta") { window.closePage('advanced-page'); } else { location.reload(); }
};

// --- TEMA VE SAYFA KONTROL ---
window.setTheme = (color) => {
    primaryColor = color;
    document.documentElement.style.setProperty('--p-color', color);
    canvas.style.borderColor = color;
};

window.openSettings = () => openPage('settings-page');
window.closePage = (id) => { document.getElementById(id).style.opacity = '0'; setTimeout(() => document.getElementById(id).style.display = 'none', 400); };
function openPage(id) { const p = document.getElementById(id); p.style.display = 'flex'; setTimeout(() => p.style.opacity = '1', 10); }

// --- OYUN MOTORU ---
function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else if(head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) { gameOver(); return; }

    for(let i=1; i<snake.length; i++) if(head.x===snake[i].x && head.y===snake[i].y) { gameOver(); return; }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += food.points;
        const scoreEl = document.getElementById('scoreVal');
        
        // GOD MODE Kontrolü
        if(score >= 5000) {
            scoreEl.innerText = score + " [GOD MODE]";
            scoreEl.style.color = "var(--matrix-green)";
            scoreEl.style.textShadow = "0 0 10px var(--matrix-green)";
        } else {
            scoreEl.innerText = score;
            scoreEl.style.color = "var(--p-color)";
        }
        createFood();
    } else snake.pop();
}

function drawSnake() {
    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? primaryColor : `rgba(${hexToRgb(primaryColor)}, ${1 - i/snake.length})`;
        ctx.fillRect(p.x + 1, p.y + 1, gridSize - 2, gridSize - 2);
    });
}

function hexToRgb(hex) {
    let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return `${r}, ${g}, ${b}`;
}

function drawFood() { ctx.font = "18px serif"; ctx.fillText(food.type, food.x + 2, food.y + 17); }
function createFood() {
    const r = foodMatrix[Math.floor(Math.random() * foodMatrix.length)];
    food = { x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize, type: r.t, points: r.p };
}

function gameOver() { 
    gameRunning = false; 
    const msg = currentLang === 'tr' ? "SİSTEM DURDURULDU!" : "SYSTEM HALTED!";
    alert(msg + "\nSkor: " + score); 
    location.reload(); 
}

window.startGame = () => {
    const s = Math.min(window.innerWidth * 0.9, 400); canvas.width = canvas.height = Math.floor(s / 20) * 20;
    document.getElementById("menu").style.display = "none"; document.getElementById("stats").style.display = "flex";
    canvas.style.display = "block"; gameRunning = true; createFood(); main();
};

// Mobil Kontrol
let tX=0, tY=0;
canvas.addEventListener('touchstart', e => { tX=e.touches[0].clientX; tY=e.touches[0].clientY; e.preventDefault(); }, {passive:false});
canvas.addEventListener('touchend', e => {
    let dX=e.changedTouches[0].clientX-tX, dY=e.changedTouches[0].clientY-tY;
    if(Math.abs(dX)>Math.abs(dY)) { if(dX>30 && dx===0) {dx=gridSize; dy=0;} else if(dX<-30 && dx===0) {dx=-gridSize; dy=0;} }
    else { if(dY>30 && dy===0) {dx=0; dy=gridSize;} else if(dY<-30 && dy===0) {dx=0; dy=-gridSize;} }
}, {passive:false});

window.setSpeed = (v) => gameSpeed = parseInt(v);
window.setWallPass = (v) => wallPass = v;
window.setLang('tr');

