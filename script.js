/**
 * Cyber Snake v3.8 Beta | Final Sprite & God Mode Edition
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 20, score = 0, bestScore = 0;
let gameSpeed = 10, dx = 20, dy = 0;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let gameRunning = false, wallPass = false, currentLang = 'tr', primaryColor = "#00f3ff";

// --- SPRITE SHEET MOTORU (1024x1024 Destekli) ---
const snakeSprites = new Image();
snakeSprites.src = 'snake_sprites.png'; 
let assetsLoaded = false;
snakeSprites.onload = () => { assetsLoaded = true; window.setLang('tr'); };

const foodMatrix = [
    {t: '🍎', p: 5}, {t: '🍌', p: 8}, {t: '🍇', p: 10}, {t: '🍓', p: 12}, 
    {t: '🍍', p: 20}, {t: '🍉', p: 30}, {t: '🍄', p: 50}, {t: '🍅', p: 14}
];
let food = {x: 0, y: 0, type: '🍎', points: 5};

// --- DİL MOTORU ---
window.setLang = (lang) => {
    currentLang = lang;
    const t = translations[lang];
    document.getElementById('startBtn').innerText = t.startBtn;
    document.getElementById('settingsBtn').innerText = t.settingsBtn;
    document.getElementById('settingsTitle').innerText = t.settingsTitle;
    document.getElementById('langLabelText').innerText = t.langLabel || "DİL:";
    document.getElementById('speedLabelText').innerText = t.speedLabel;
    document.getElementById('wallsLabelText').innerText = t.wallsLabel;
    document.getElementById('themeLabelText').innerText = t.themeLabel || "TEMA:";
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

// --- GİZLİ GOD MODE TETİKLEYİCİ (3 TIK) ---
let clickCount = 0, lastClickTime = 0;
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('p-signature')) {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 500) clickCount++;
        else clickCount = 1;
        lastClickTime = currentTime;
        if (clickCount === 3) {
            score = 5001;
            updateScoreUI();
            alert(currentLang === 'tr' ? "SİSTEM BYPASS EDİLDİ: GOD MODE AKTİF!" : "SYSTEM OVERRIDE: GOD MODE ACTIVE!");
            clickCount = 0;
        }
    }
});

function updateScoreUI() {
    const sEl = document.getElementById('scoreVal');
    if(score >= 5000) { 
        sEl.innerText = score + " [GOD MODE]"; 
        sEl.style.color = "var(--matrix-green)";
        sEl.style.textShadow = "0 0 15px var(--matrix-green)";
    } else {
        sEl.innerText = score;
        sEl.style.color = "var(--p-color)";
    }
}

// --- PANEL KONTROLLERİ ---
window.openAdvanced = () => {
    let p = prompt(currentLang === 'tr' ? "GELİŞMİŞ ŞİFRE:" : "ADVANCED PASS:");
    if(p === "purpleguy2026") {
        const readmeBox = document.getElementById('readme-content');
        readmeBox.innerText = currentLang === 'tr' ? 
            "🐍 CYBER SNAKE V3.8 | SİSTEM ÇÖKTÜREN\nPurpleguy © 2026\n\n- İmzana 3 kez tıklayarak God Mode açabilirsin.\n- 5000+ Skor: Tanrı Modu Tescillenir." : 
            "🐍 CYBER SNAKE v3.8 | SYSTEM CRUSHER\nPurpleguy © 2026\n\n- Triple click your signature for God Mode.\n- 5000+ Score: God Mode Certified.";
        openPage('advanced-page');
    } else alert("YETKİSİZ!");
};

window.confirmExit = () => {
    if(prompt("VERSİYON?") === "3.8 beta") window.closePage('advanced-page');
    else location.reload();
};

window.setTheme = (c) => { primaryColor = c; document.documentElement.style.setProperty('--p-color', c); };
window.openSettings = () => openPage('settings-page');
window.closePage = (id) => { document.getElementById(id).style.opacity = '0'; setTimeout(()=>document.getElementById(id).style.display='none', 400); };
function openPage(id) { const p = document.getElementById(id); p.style.display='flex'; setTimeout(()=>p.style.opacity='1', 10); }

// --- OYUN MOTORU ---
function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

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

function drawSnake() {
    snake.forEach((p, i) => {
        if (assetsLoaded && snakeSprites.complete) {
            // 1024x1024 resmi tam ortadan (512px) bölüp 20x20 oyun karesine sığdırır
            const sourceX = (i === 0) ? 0 : 512; 
            ctx.drawImage(snakeSprites, sourceX, 0, 512, 1024, p.x, p.y, gridSize, gridSize);
        } else {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(p.x, p.y, gridSize, gridSize);
        }
    });
}

function drawFood() { ctx.font = "18px serif"; ctx.fillText(food.type, food.x + 2, food.y + 17); }
function createFood() {
    const r = foodMatrix[Math.floor(Math.random() * foodMatrix.length)];
    food = { x: Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, y: Math.floor(Math.random()*(canvas.height/gridSize))*gridSize, type: r.t, points: r.p };
}

function gameOver() { 
    gameRunning = false; 
    alert(currentLang === 'tr' ? "SİSTEM DURDU! Skor: " + score : "SYSTEM HALTED! Score: " + score); 
    location.reload(); 
}

window.startGame = () => {
    if(!assetsLoaded) return alert("Siber varlıklar yükleniyor...");
    const s = Math.min(window.innerWidth * 0.9, 400); canvas.width = canvas.height = Math.floor(s/20)*20;
    document.getElementById("menu").style.display = "none"; document.getElementById("stats").style.display = "flex";
    canvas.style.display = "block"; gameRunning = true; createFood(); main();
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
