// --- SİSTEM ÇEKİRDEĞİ ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;

let score = 0;
let speed = 120;
let currentDir = "RIGHT";
let snake = [{x: 10 * box, y: 10 * box}];
let gameEngine;

// --- 15 ÇEŞİT YEMEK VE STRATEJİK PUANLAR ---
const lootTable = [
    {icon: "🍎", pt: 5}, {icon: "🍐", pt: 5}, {icon: "🍊", pt: 10},
    {icon: "🍋", pt: 10}, {icon: "🍌", pt: 15}, {icon: "🍉", pt: 15},
    {icon: "🍇", pt: 20}, {icon: "🍓", pt: 20}, {icon: "🫐", pt: 25},
    {icon: "🍈", pt: 25}, {icon: "🍒", pt: 30}, {icon: "🍑", pt: 30},
    {icon: "🍍", pt: 40}, {icon: "🥝", pt: 40}, 
    {icon: "🍄", pt: 50} // 50 PUANLIK MANTAR MÜHÜRLENDİ
];

let food = spawnFood();

function spawnFood() {
    let xPos, yPos;
    let overlap = true;
    while(overlap) {
        xPos = Math.floor(Math.random() * 19) * box;
        yPos = Math.floor(Math.random() * 19) * box;
        overlap = snake.some(p => p.x === xPos && p.y === yPos);
    }
    const item = lootTable[Math.floor(Math.random() * lootTable.length)];
    return { x: xPos, y: yPos, ...item };
}

// --- SWIPE & AYARLAR YÖNETİMİ ---
const sideMenu = document.getElementById('side-menu');
let touchX = 0;

document.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchX;
    if (diff > 120) sideMenu.classList.add('open'); // Sağa kaydır: Aç
    if (diff < -120) sideMenu.classList.remove('open'); // Sola kaydır: Kapat
});

function toggleMenu() { sideMenu.classList.toggle('open'); }

// --- KONTROL MEKANİZMASI ---
function setDirection(newDir) {
    if(newDir === "UP" && currentDir !== "DOWN") currentDir = "UP";
    if(newDir === "DOWN" && currentDir !== "UP") currentDir = "DOWN";
    if(newDir === "LEFT" && currentDir !== "RIGHT") currentDir = "LEFT";
    if(newDir === "RIGHT" && currentDir !== "LEFT") currentDir = "RIGHT";
}

document.getElementById('up-btn').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection("UP"); });
document.getElementById('down-btn').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection("DOWN"); });
document.getElementById('left-btn').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection("LEFT"); });
document.getElementById('right-btn').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection("RIGHT"); });

// --- GÖRSEL GERİ BİLDİRİM ---
function triggerAlert(msg) {
    const alertBox = document.getElementById('system-alert');
    alertBox.innerText = msg;
    alertBox.style.opacity = 1;
    setTimeout(() => alertBox.style.opacity = 0, 1200);
}

// --- ANA ÇİZİM MOTORU ---
function update() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yılan Çizimi (Neon Sprite)
    snake.forEach((part, index) => {
        ctx.fillStyle = (index === 0) ? "#00f3ff" : "#005f66";
        ctx.shadowBlur = (index === 0) ? 20 : 0;
        ctx.shadowColor = "#00f3ff";
        ctx.fillRect(part.x, part.y, box, box);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(part.x, part.y, box, box);
    });
    ctx.shadowBlur = 0;

    // Yemek Çizimi
    ctx.font = "18px Arial";
    ctx.fillText(food.icon, food.x + 2, food.y + 18);

    // Hareket Hesaplama
    let headX = snake[0].x;
    let headY = snake[0].y;

    if(currentDir === "UP") headY -= box;
    if(currentDir === "DOWN") headY += box;
    if(currentDir === "LEFT") headX -= box;
    if(currentDir === "RIGHT") headX += box;

    // Yemek Yeme Durumu
    if(headX === food.x && headY === food.y) {
        score += food.pt;
        if(food.icon === "🍄") triggerAlert("+50 MANTAR!");
        food = spawnFood();
        document.getElementById('score-num').innerText = String(score).padStart(3, '0');
    } else {
        snake.pop();
    }

    let newHead = { x: headX, y: headY };

    // ÖLÜM ŞARTLARI
    if(headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height || snake.some(p => p.x === newHead.x && p.y === newHead.y)) {
        triggerAlert("SYSTEM OVERLOAD");
        setTimeout(() => location.reload(), 1500);
        return;
    }

    snake.unshift(newHead);
}

// --- MOTORU ÇALIŞTIR VE HIZ AYARI ---
function run() {
    clearInterval(gameEngine);
    gameEngine = setInterval(update, speed);
}

document.getElementById('speed-slider').addEventListener('input', (e) => {
    let val = e.target.value;
    speed = 290 - val; // Slider arttıkça gecikme azalır (hız artar)
    document.getElementById('speed-val').innerText = val;
    run();
});

run();

