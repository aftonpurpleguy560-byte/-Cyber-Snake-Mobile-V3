/**
 * Cyber Snake v3.8 | Final Edition
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const eatSound = document.getElementById("eatSound");

let gridSize = 20, score = 0, gameSpeed = 25;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let food = {x: 0, y: 0, type: '🍎', points: 7};
let dx = 20, dy = 0, gameRunning = false, wallPass = false;
let primaryColor = "#00f3ff";

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

window.openAdvanced = () => {
    let p = prompt("GELİŞMİŞ ERİŞİM ŞİFRESİ:");
    if(p === "purpleguy2026") {
        document.getElementById('readme-content').innerText = `
        >>> CYBER SNAKE v3.8 README.md <<<
        ----------------------------------
        Siber dünyada sahte dostlara yer yok.
        Bu kodlar Efe tarafından Purpleguy imzasıyla
        sahte arkadaşlıkları bitirmek için yazıldı.
        
        Sizin yalanlarınız 60 FPS siber akıcılığa
        dayanamaz. Sistem çöktüğünde yanımda olanlar
        değil, sistemi çökertenler dostumdur.
        
        Purpleguy © 2026 - tablet power
        ----------------------------------`;
        openPage('advanced-page');
    } else { alert("ERİŞİM REDDEDİLDİ!"); }
};

window.openThemes = () => {
    const grid = document.getElementById("themeGrid"); grid.innerHTML = "";
    const colors = [{n:'CYBER', c:'#00f3ff'}, {n:'NEON', c:'#ff00ff'}, {n:'MATRIX', c:'#00ff41'}];
    colors.forEach(t => {
        const b = document.createElement("button"); b.innerText = t.n; b.style.borderColor = t.c;
        b.onclick = () => { primaryColor = t.c; canvas.style.borderColor = t.c; window.closePage('theme-page'); };
        grid.appendChild(b);
    });
    openPage('theme-page');
};

// --- SWIPE SİSTEMİ ---
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

// --- MOTOR ---
function main() {
    if(!gameRunning) return;
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFood(); move(); drawSnake();
    setTimeout(() => requestAnimationFrame(main), 1000 / gameSpeed);
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if(wallPass) {
        if(head.x>=canvas.width) head.x=0; else if(head.x<0) head.x=canvas.width-gridSize;
        if(head.y>=canvas.height) head.y=0; else if(head.y<0) head.y=canvas.height-gridSize;
    } else if(head.x>=canvas.width || head.x<0 || head.y>=canvas.height || head.y<0) { gameOver(); return; }
    
    for(let i=1; i<snake.length; i++) if(head.x===snake[i].x && head.y===snake[i].y) { gameOver(); return; }

    snake.unshift(head);
    if(head.x===food.x && head.y===food.y) {
        score+=food.points; if(eatSound) {eatSound.currentTime=0; eatSound.play();}
        createFood();
    } else snake.pop();
}

function drawSnake() {
    snake.forEach((p, i) => {
        ctx.fillStyle = i===0 ? primaryColor : `rgba(${hexToRgb(primaryColor)}, ${1 - i/snake.length})`;
        ctx.fillRect(p.x+1, p.y+1, gridSize-2, gridSize-2);
        if(i===0) { ctx.fillStyle="white"; ctx.fillRect(p.x+12, p.y+4, 4, 4); ctx.fillRect(p.x+12, p.y+12, 4, 4); }
    });
}

function drawFood() { ctx.font="18px serif"; ctx.fillText(food.type, food.x+2, food.y+17); }
function createFood() { food.x=Math.floor(Math.random()*(canvas.width/gridSize))*gridSize; food.y=Math.floor(Math.random()*(canvas.height/gridSize))*gridSize; }
function gameOver() { gameRunning=false; alert("SİSTEM ÇÖKTÜ! Skor: "+score); location.reload(); }
function hexToRgb(h) { let r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16); return `${r},${g},${b}`; }

window.startGame = () => {
    const s = Math.min(window.innerWidth*0.9, 400); canvas.width=canvas.height=Math.floor(s/20)*20;
    document.getElementById("menu").style.transform="scale(0)";
    setTimeout(() => { document.getElementById("menu").style.display="none"; canvas.style.display="block"; gameRunning=true; createFood(); main(); }, 400);
};
window.setSpeed = (v) => gameSpeed = parseInt(v);
window.setWallPass = (v) => wallPass = v;
