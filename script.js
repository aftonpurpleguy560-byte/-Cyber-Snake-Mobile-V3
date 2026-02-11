/**
 * Cyber Snake v3.8 Beta | Master Edition (Full 150+ Lines)
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreValue");
const highVal = document.getElementById("highScoreValue");

// --- SİBER DEĞİŞKENLER ---
let gridSize = 20;
let snake = [{x: 160, y: 160}, {x: 140, y: 160}, {x: 120, y: 160}];
let food = {x: 0, y: 0};
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameRunning = false;
let godMode = false;
let currentLang = 'tr';
let currentTheme = 'cyber';

// Sprite Desteği
const snakeHead = new Image();
snakeHead.src = 'icon-512.png'; 

// --- DİL VE TEMA PAKETLERİ ---
const translations = {
    tr: { play: "OYUNA BAŞLA", settings: "AYARLAR", back: "GERİ", score: "PUAN: ", high: "EN İYİ: ", god: "SİBER GÜÇ: AKTİF" },
    en: { play: "START GAME", settings: "SETTINGS", back: "BACK", score: "SCORE: ", high: "BEST: ", god: "GOD MODE: ON" }
};

const themes = {
    cyber: { head: "#00f3ff", body: "rgba(0, 243, 255, 0.4)", food: "#ff003c" },
    neon: { head: "#ff00ff", body: "rgba(255, 0, 255, 0.4)", food: "#00ff00" }
};

// --- SİSTEM FONKSİYONLARI ---

// 1. Skor Tamiri (10'ar artış)
function updateScore() {
    score += 10;
    scoreVal.innerText = score.toString().padStart(3, '0');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highVal.innerText = highScore.toString().padStart(3, '0');
    }
}

// 2. God Mode (İmza Hilesi)
document.addEventListener('click', (e) => {
    if (e.target.innerText && e.target.innerText.includes("Purpleguy")) {
        godMode = !godMode;
        alert(godMode ? translations[currentLang].god : "Normal Mod");
    }
});

// 3. Glitch Efekti (Ekran Titremesi)
function applyGlitch() {
    if (Math.random() > 0.98) {
        ctx.save();
        ctx.translate((Math.random()-0.5)*5, (Math.random()-0.5)*5);
        setTimeout(() => ctx.restore(), 50);
    }
}

// 4. Dil ve Tema Kontrolü
window.setLanguage = (lang) => {
    currentLang = lang;
    document.querySelector('.play-btn').innerText = translations[lang].play;
    document.querySelector('.settings-btn').innerText = translations[lang].settings;
};

window.changeTheme = (theme) => { currentTheme = theme; };

// --- ANA OYUN DÖNGÜSÜ ---
function createFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Duvarlardan Geçme (God Mode veya Normal)
    if (head.x >= canvas.width) head.x = 0;
    if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.y >= canvas.height) head.y = 0;
    if (head.y < 0) head.y = canvas.height - gridSize;

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        updateScore();
        createFood();
    } else {
        snake.pop();
    }
}

function draw() {
    if (!gameRunning) return;
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    applyGlitch();

    // Yemi Çiz
    ctx.fillStyle = themes[currentTheme].food;
    ctx.shadowBlur = 15;
    ctx.shadowColor = themes[currentTheme].food;
    ctx.fillRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);

    // Yılanı Çiz (Sprite + Neon)
    snake.forEach((part, index) => {
        if (index === 0) {
            ctx.drawImage(snakeHead, part.x, part.y, gridSize, gridSize);
        } else {
            ctx.fillStyle = godMode ? "#ff00ff" : themes[currentTheme].head;
            ctx.shadowBlur = godMode ? 20 : 10;
            ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
        }
    });

    moveSnake();
    if (!godMode) checkGameOver();
    setTimeout(() => requestAnimationFrame(draw), 100);
}

function checkGameOver() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameRunning = false;
            location.reload(); // En hızlı "Ana Menüye Dön"
        }
    }
}

window.startGame = () => {
    document.getElementById("menu").style.display = "none";
    gameRunning = true;
    createFood();
    draw();
};

console.log("v3.8 Beta Full Loaded | Purpleguy © 2026");
