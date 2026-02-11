/**
 * Cyber Snake v3.8 Beta | Ultimate Responsive Master Edition
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreValue");
const highVal = document.getElementById("highScoreValue");

// --- 1. EKRAN UYUMLULUĞU (Yatay & Dikey) ---
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
    canvas.width = Math.floor(size / 20) * 20; 
    canvas.height = canvas.width;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 2. DEĞİŞKENLER ---
let gridSize = 20;
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let food = {x: 0, y: 0};
let dx = gridSize, dy = 0;
let score = 0, highScore = localStorage.getItem("highScore") || 0;
let gameRunning = false, godMode = false;
let currentLang = 'tr', currentTheme = 'cyber';

const snakeHead = new Image();
snakeHead.src = 'icon-512.png'; 

const themes = {
    cyber: { head: "#00f3ff", body: "rgba(0, 243, 255, 0.4)", food: "#ff003c" },
    neon: { head: "#ff00ff", body: "rgba(255, 0, 255, 0.4)", food: "#00ff00" },
    retro: { head: "#ff8c00", body: "rgba(255, 140, 0, 0.4)", food: "#fff" },
    matrix: { head: "#00ff41", body: "rgba(0, 255, 65, 0.2)", food: "#003b00" },
    gold: { head: "#ffd700", body: "rgba(255, 215, 0, 0.4)", food: "#ff4500" }
};

// --- 3. ANA OYUN DÖNGÜSÜ ---
function draw() {
    if (!gameRunning) return;
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yemek Çizimi
    ctx.fillStyle = themes[currentTheme].food;
    ctx.shadowBlur = 15;
    ctx.shadowColor = themes[currentTheme].food;
    ctx.fillRect(food.x + 4, food.y + 4, gridSize - 8, gridSize - 8);

    // Yılan Çizimi
    snake.forEach((part, i) => {
        ctx.shadowBlur = godMode ? 25 : 10;
        ctx.shadowColor = godMode ? "#ff00ff" : themes[currentTheme].head;

        if (i === 0) {
            // KAFA VE GÖZLER
            ctx.drawImage(snakeHead, part.x, part.y, gridSize, gridSize);
            
            ctx.fillStyle = "white";
            ctx.shadowBlur = 15;
            let eS = 4; // Göz boyutu
            // Yöne göre göz konumlandırma
            if (dx > 0) { ctx.fillRect(part.x + 12, part.y + 4, eS, eS); ctx.fillRect(part.x + 12, part.y + 12, eS, eS); }
            else if (dx < 0) { ctx.fillRect(part.x + 4, part.y + 4, eS, eS); ctx.fillRect(part.x + 4, part.y + 12, eS, eS); }
            else if (dy < 0) { ctx.fillRect(part.x + 4, part.y + 4, eS, eS); ctx.fillRect(part.x + 12, part.y + 4, eS, eS); }
            else if (dy > 0) { ctx.fillRect(part.x + 4, part.y + 12, eS, eS); ctx.fillRect(part.x + 12, part.y + 12, eS, eS); }
        } else {
            // GÖVDE VE İNCELEN KUYRUK
            const isTail = (i === snake.length - 1);
            const sR = isTail ? 6 : 2; // Kuyruğa doğru küçülme
            ctx.fillStyle = godMode ? "#ff00ff" : themes[currentTheme].head;
            
            // Yuvarlatılmış gövde parçaları
            roundRect(ctx, part.x + sR/2, part.y + sR/2, gridSize - sR, gridSize - sR, isTail ? 10 : 4);
        }
    });

    move();
    setTimeout(() => requestAnimationFrame(draw), 100);
}

// --- 4. HAREKET VE MANTIK ---
function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Duvar Geçişi (Sonsuz Ekran)
    if (head.x >= canvas.width) head.x = 0; else if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.y >= canvas.height) head.y = 0; else if (head.y < 0) head.y = canvas.height - gridSize;

    // Kendine Çarpma (God Mode kapalıyken)
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

// --- 5. YARDIMCI FONKSİYONLAR ---
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r); ctx.lineTo(x+w, h+y-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h); ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r); ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath(); ctx.fill();
}

function createFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function updateScore() {
    score += 10;
    scoreVal.innerText = score.toString().padStart(3, '0');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highVal.innerText = highScore.toString().padStart(3, '0');
    }
}

// --- 6. KONTROLLER VE MENÜ ---
document.addEventListener('click', (e) => {
    if (e.target.innerText && e.target.innerText.includes("Purpleguy")) {
        godMode = !godMode;
        alert(godMode ? "SİBER GÜÇ: AKTİF" : "Normal Mod");
    }
});

window.startGame = () => { document.getElementById("menu").style.display = "none"; gameRunning = true; createFood(); draw(); };
window.changeTheme = (t) => { currentTheme = t; canvas.style.borderColor = themes[t].head; };
window.openReadme = () => { window.open("https://github.com/Efe/Cyber-Snake-v3.8/blob/main/README.md", '_blank'); };

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = gridSize; }
    else if (e.key === "ArrowLeft" && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === "ArrowRight" && dx === 0) { dx = gridSize; dy = 0; }
});

