/**
 * Cyber Snake v3.8 Beta | Master Script
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreValue");
const highVal = document.getElementById("highScoreValue");

// --- OYUN AYARLARI ---
let gridSize = 20;
let snake = [{x: 160, y: 160}, {x: 140, y: 160}];
let food = {x: 0, y: 0};
let dx = gridSize, dy = 0;
let score = 0, highScore = localStorage.getItem("highScore") || 0;
let gameRunning = false, godMode = false;
let currentLang = 'tr', currentTheme = 'cyber';

// Sprite Yükleme
const snakeHead = new Image();
snakeHead.src = 'icon-512.png'; 

// 5 Efsane Tema
const themes = {
    cyber: { head: "#00f3ff", body: "rgba(0, 243, 255, 0.4)", food: "#ff003c" },
    neon: { head: "#ff00ff", body: "rgba(255, 0, 255, 0.4)", food: "#00ff00" },
    retro: { head: "#ff8c00", body: "rgba(255, 140, 0, 0.4)", food: "#fff" },
    matrix: { head: "#00ff41", body: "rgba(0, 255, 65, 0.2)", food: "#003b00" },
    gold: { head: "#ffd700", body: "rgba(255, 215, 0, 0.4)", food: "#ff4500" }
};

const translations = {
    tr: { play: "OYUNA BAŞLA", god: "SİBER GÜÇ: AKTİF", score: "PUAN: ", high: "EN İYİ: " },
    en: { play: "START GAME", god: "GOD MODE: ON", score: "SCORE: ", high: "BEST: " }
};

// --- SİBER FONKSİYONLAR ---

// Skor Sistemi (10'ar Artış)
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
        alert(godMode ? translations[currentLang].god : "Hile Devre Dışı");
    }
});

window.changeTheme = (t) => { 
    currentTheme = t; 
    canvas.style.borderColor = themes[t].head;
    document.getElementById('settings-panel').style.display = 'none';
};

window.setLanguage = (l) => {
    currentLang = l;
    document.querySelector('.play-btn').innerText = translations[l].play;
};

function createFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function draw() {
    if (!gameRunning) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glitch Efekti
    if (Math.random() > 0.98) {
        ctx.fillStyle = "rgba(0, 243, 255, 0.1)";
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 50, 2);
    }

    // Yılan Çizimi (Sprite + Tema)
    snake.forEach((part, i) => {
        if (i === 0) {
            ctx.drawImage(snakeHead, part.x, part.y, gridSize, gridSize);
        } else {
            ctx.fillStyle = godMode ? "#ff00ff" : themes[currentTheme].head;
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
        }
    });

    // Yemek Çizimi
    ctx.fillStyle = themes[currentTheme].food;
    ctx.fillRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);

    move();
    setTimeout(() => requestAnimationFrame(draw), 100);
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Duvar Kontrolü (Sonsuz Döngü)
    if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;

    // Kendine Çarpma Kontrolü (Sadece God Mode Kapalıyken)
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
    if (head.x === food.x && head.y === food.y) {
        updateScore();
        createFood();
    } else {
        snake.pop();
    }
}

window.startGame = () => {
    document.getElementById("menu").style.display = "none";
    gameRunning = true;
    createFood();
    draw();
};

console.log("Cyber Snake v3.8 Beta Ready | Purpleguy © 2026");

