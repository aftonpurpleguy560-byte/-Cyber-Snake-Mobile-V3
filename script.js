/**
 * Cyber Snake v3.8 Beta | Final Master Edition
 * Purpleguy © 2026 - tablet power
 * Özellikler: Hareketli Gözler, İncelen Kuyruk, 5 Tema, God Mode
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreValue");
const highVal = document.getElementById("highScoreValue");

// --- SİBER DEĞİŞKENLER ---
let gridSize = 20;
let snake = [{x: 160, y: 160}, {x: 140, y: 160}, {x: 120, y: 160}];
let food = {x: 0, y: 0};
let dx = gridSize, dy = 0;
let score = 0, highScore = localStorage.getItem("highScore") || 0;
let gameRunning = false, godMode = false;
let currentLang = 'tr', currentTheme = 'cyber';

// Sprite Yükleme
const snakeHead = new Image();
snakeHead.src = 'icon-512.png'; 

// 5 Efsane Tema Paketi
const themes = {
    cyber: { head: "#00f3ff", body: "rgba(0, 243, 255, 0.4)", food: "#ff003c" },
    neon: { head: "#ff00ff", body: "rgba(255, 0, 255, 0.4)", food: "#00ff00" },
    retro: { head: "#ff8c00", body: "rgba(255, 140, 0, 0.4)", food: "#fff" },
    matrix: { head: "#00ff41", body: "rgba(0, 255, 65, 0.2)", food: "#003b00" },
    gold: { head: "#ffd700", body: "rgba(255, 215, 0, 0.4)", food: "#ff4500" }
};

const translations = {
    tr: { play: "OYUNA BAŞLA", god: "HİLE AKTİF", score: "PUAN: ", high: "EN İYİ: " },
    en: { play: "START GAME", god: "GOD MODE: ON", score: "SCORE: ", high: "BEST: " }
};

// --- SİSTEM FONKSİYONLARI ---

function updateScore() {
    score += 10;
    scoreVal.innerText = score.toString().padStart(3, '0');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highVal.innerText = highScore.toString().padStart(3, '0');
    }
}

// God Mode (İmza Hilesi)
document.addEventListener('click', (e) => {
    if (e.target.innerText && e.target.innerText.includes("Purpleguy")) {
        godMode = !godMode;
        alert(godMode ? translations[currentLang].god : "Normal Mod");
    }
});

window.openReadme = () => {
    window.open("https://github.com/Efe/Cyber-Snake-v3.8/blob/main/README.md", '_blank');
};

window.changeTheme = (t) => { 
    currentTheme = t; 
    canvas.style.borderColor = themes[t].head;
    document.getElementById('settings-panel').style.display = 'none';
};

window.setLanguage = (l) => {
    currentLang = l;
    document.querySelector('.play-btn').innerText = translations[l].play;
};

// Yuvarlak Köşeli Çizim (Kuyruk ve Gövde İçin)
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function createFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

// --- ANA ÇİZİM DÖNGÜSÜ ---
function draw() {
    if (!gameRunning) return;
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yemek Çizimi
    ctx.fillStyle = themes[currentTheme].food;
    ctx.shadowBlur = 15;
    ctx.shadowColor = themes[currentTheme].food;
    ctx.fillRect(food.x + 4, food.y + 4, gridSize - 8, gridSize - 8);

    // YILAN ÇİZİMİ
    snake.forEach((part, i) => {
        ctx.shadowBlur = godMode ? 20 : 10;
        ctx.shadowColor = godMode ? "#ff00ff" : themes[currentTheme].head;

        if (i === 0) {
            // KAFA VE GÖZLER
            ctx.drawImage(snakeHead, part.x, part.y, gridSize, gridSize);
            
            // Parlayan Gözler (Beyaz ve yöne bakan)
            ctx.fillStyle = "white";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "white";
            let eyeSize = 4;
            if (dx === gridSize) { // Sağ
                ctx.fillRect(part.x + 12, part.y + 4, eyeSize, eyeSize);
                ctx.fillRect(part.x + 12, part.y + 12, eyeSize, eyeSize);
            } else if (dx === -gridSize) { // Sol
                ctx.fillRect(part.x + 4, part.y + 4, eyeSize, eyeSize);
                ctx.fillRect(part.x + 4, part.y + 12, eyeSize, eyeSize);
            } else if (dy === -gridSize) { // Yukarı
                ctx.fillRect(part.x + 4, part.y + 4, eyeSize, eyeSize);
                ctx.fillRect(part.x + 12, part.y + 4, eyeSize, eyeSize);
            } else if (dy === gridSize) { // Aşağı
                ctx.fillRect(part.x + 4, part.y + 12, eyeSize, eyeSize);
                ctx.fillRect(part.x + 12, part.y + 12, eyeSize, eyeSize);
            }
        } else {
            // GÖVDE VE KUYRUK (İncelen efekt)
            const isTail = (i === snake.length - 1);
            const sizeReduce = isTail ? 6 : 2;
            ctx.fillStyle = godMode ? "#ff00ff" : themes[currentTheme].head;
            roundRect(ctx, part.x + sizeReduce/2, part.y + sizeReduce/2, gridSize - sizeReduce, gridSize - sizeReduce, isTail ? 10 : 4);
        }
    });

    ctx.shadowBlur = 0;
    move();
    setTimeout(() => requestAnimationFrame(draw), 100);
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;

    if (!godMode) {
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameRunning = false;
                location.reload();
                return;
            }
        }
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { updateScore(); createFood(); } else { snake.pop(); }
}

// Kontroller
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = gridSize; }
    else if (e.key === "ArrowLeft" && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === "ArrowRight" && dx === 0) { dx = gridSize; dy = 0; }
});

window.startGame = () => { document.getElementById("menu").style.display = "none"; gameRunning = true; createFood(); draw(); };
