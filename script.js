/**
 * Cyber Snake v3.8 Beta | 14 Food RPG Matrix
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const eatSound = document.getElementById("eatSound");

let gridSize = 20, score = 0;
let gameSpeed = 10; 
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let dx = 20, dy = 0, gameRunning = false, wallPass = false;
let primaryColor = "#00f3ff";

// --- 14 ÇEŞİT YEMEK MATRİSİ ---
const foodMatrix = [
    {t: '🍎', p: 5},  {t: '🍏', p: 5},  {t: '🍌', p: 8}, 
    {t: '🍇', p: 10}, {t: '🍓', p: 12}, {t: '🍒', p: 15},
    {t: '🍍', p: 20}, {t: '🥭', p: 25}, {t: '🍉', p: 30},
    {t: '🥦', p: 3},  {t: '🌽', p: 7},  {t: '🥕', p: 6},
    {t: '🍄', p: 50}, // Nadir Cyber Mantar
    {t: '🍅', p: 14}  // Domates (Senin metindeki özel değer)
];
let food = {x: 0, y: 0, type: '🍎', points: 5};

// --- MENÜ SİSTEMİ ---
window.openSettings = () => openPage('settings-page');

window.openAdvanced = () => {
    let p = prompt("GELİŞMİŞ ERİŞİM ŞİFRESİ:");
    if(p === "purpleguy2026") {
        const readmeBox = document.getElementById('readme-content');
        readmeBox.innerText = `
🐍 CYBER SNAKE V3.8 BETA | THE SYSTEM CRUSHER
> AUTHORIZED ACCESS ONLY: Purpleguy © 2026 - tablet power

---
🚫 DİKKAT: SAHTE DOSTLAR VE KLAVYE DELİKANLILARI İÇİN
Bu dosya, projenin sadece teknik detaylarını değil, arkadan iş çevirenlerin kapasitesini de analiz etmek için yazılmıştır.

🛠 TEKNİK ÜSTÜNLÜK (ANLAMAYANLAR İÇİN)
1. Dinamik Göz Takibi: Yılanın gözleri bile senin yalanlarını takip eder.
2. RPG Meyve Matrisi: 14 farklı yiyecek ile puan sistemi.
3. Zaman Bükücü: 0.5x, 1x, 2x hız seçenekleri.

📊 RÜTBE VE REZALET TABLOSU
| 0 - 50      | "Boş Yapıcı"
| 51 - 200    | "Script Kiddie"
| 201 - 500   | "Copy-Paste Expert"
| 501 - 5000  | "Matrix Agent"
| 5000+       | "GOD MODE" - Purpleguy © 2026

🚩 SON SÖZ
SİBER DEVRİM BAŞLADI.`;
        openPage('advanced-page');
    } else { alert("YETKİSİZ ERİŞİM!"); }
};

window.confirmExit = () => {
    let secondLock = prompt("SİSTEM MÜHÜRLERİNİ DOĞRULA (Versiyon Şifresi):");
    if(secondLock === "3.8 beta") {
        alert("SİSTEM MÜHÜRLENDİ.");
        window.closePage('advanced-page');
    } else {
        alert("YANLIŞ ŞİFRE!");
        location.reload();
    }
};

window.closePage = (id) => {
    document.getElementById(id).style.opacity = '0';
    setTimeout(() => document.getElementById(id).style.display = 'none', 400);
};

function openPage(id) {
    const p = document.getElementById(id);
    p.style.display = 'flex';
    setTimeout(() => p.style.opacity = '1', 10);
}

// --- MOBİL SWIPE ---
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
        score += food.points;
        if(eatSound) {eatSound.currentTime=0; eatSound.play();}
        createFood();
    } else snake.pop();
}

function drawSnake() {
    snake.forEach((p, i) => {
        ctx.fillStyle = i===0 ? primaryColor : `rgba(0, 243, 255, ${1 - i/snake.length})`;
        ctx.fillRect(p.x+1, p.y+1, gridSize-2, gridSize-2);
        if(i===0) { // Gözler
            ctx.fillStyle="white"; ctx.fillRect(p.x+12, p.y+4, 4, 4); ctx.fillRect(p.x+12, p.y+12, 4, 4);
        }
    });
}

function drawFood() { 
    ctx.font="18px serif"; 
    ctx.fillText(food.type, food.x+2, food.y+17); 
}

function createFood() {
    const randomFood = foodMatrix[Math.floor(Math.random() * foodMatrix.length)];
    food.type = randomFood.t;
    food.points = randomFood.p;
    food.x = Math.floor(Math.random()*(canvas.width/gridSize))*gridSize; 
    food.y = Math.floor(Math.random()*(canvas.height/gridSize))*gridSize; 
}

function gameOver() { 
    gameRunning=false; 
    alert("SİSTEM ÇÖKTÜ! Skor: "+score); 
    location.reload(); 
}

window.startGame = () => {
    const s = Math.min(window.innerWidth*0.9, 400); canvas.width=canvas.height=Math.floor(s/20)*20;
    document.getElementById("menu").style.transform="scale(0)";
    setTimeout(() => { 
        document.getElementById("menu").style.display="none"; 
        canvas.style.display="block"; 
        gameRunning=true; 
        createFood(); 
        main(); 
    }, 400);
};

window.setSpeed = (v) => gameSpeed = parseInt(v);
window.setWallPass = (v) => wallPass = v;

