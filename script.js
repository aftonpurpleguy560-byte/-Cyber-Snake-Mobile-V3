const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
const CANVAS_SIZE = 600;

// Oyun Değişkenleri
let snake = [], food = {}, dx = GRID, dy = 0, score = 0, gameActive = false, isPanic = false;
let wallMode = "die", snakeColor = "#38bdf8";
let lastTime = 0, moveTimer = 0, moveInterval = 130; 

// God Mode Değişkenleri
let godMode = false;
let clickCount = 0;
let lastClickTime = 0;

// Ses Sistemi
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Yüksek Skor Yükleme
let highScore = localStorage.getItem("best_v3") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

// GİZLİ GOD MODE TETİKLEYİCİ
document.getElementById("godTrigger").onclick = () => {
    const now = Date.now();
    if (now - lastClickTime > 500) clickCount = 0;
    clickCount++;
    lastClickTime = now;
    if (clickCount === 3) {
        godMode = !godMode;
        clickCount = 0;
        const trigger = document.getElementById("godTrigger");
        const status = document.getElementById("godStatus");
        if (godMode) {
            trigger.style.color = "#4ade80";
            trigger.innerText = "GOD MODE: ON";
            status.style.visibility = "visible";
            playSound(800, 0.3);
        } else {
            trigger.style.color = "";
            trigger.innerText = "Purpleguy © 2026 - tablet power";
            status.style.visibility = "hidden";
            playSound(200, 0.3);
        }
    }
};

// TABLET KONTROLLERİ (SWIPE)
let tX = 0, tY = 0;
canvas.addEventListener('touchstart', e => {
    tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    if (audioCtx.state === 'suspended') audioCtx.resume();
}, {passive: true});

canvas.addEventListener('touchmove', e => {
    if (!gameActive) return;
    let dX = e.touches[0].clientX - tX;
    let dY = e.touches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) {
        if (Math.abs(dX) > 20 && dx === 0) { dx = dX > 0 ? GRID : -GRID; dy = 0; tX = e.touches[0].clientX; }
    } else {
        if (Math.abs(dY) > 20 && dy === 0) { dy = dY > 0 ? GRID : -GRID; dx = 0; tY = e.touches[0].clientY; }
    }
}, {passive: true});

function spawnFood() {
    food = { x: Math.floor(Math.random() * 15) * GRID, y: Math.floor(Math.random() * 15) * GRID, char: '🍎' };
}

function draw() {
    ctx.fillStyle = "#010409";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for(let i=0; i<=CANVAS_SIZE; i+=GRID) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(600,i); ctx.stroke();
    }

    if(gameActive) {
        ctx.font = "32px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(food.char, food.x + 20, food.y + 20);
    }

    snake.forEach((s, i) => {
        ctx.fillStyle = godMode ? "#facc15" : (i === 0 ? snakeColor : "rgba(255, 255, 255, 0.2)");
        ctx.beginPath();
        ctx.arc(s.x + 20, s.y + 20, 18, 0, Math.PI * 2);
        ctx.fill();
        if(i === 0) {
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(s.x + 14, s.y + 16, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(s.x + 26, s.y + 16, 3, 0, Math.PI * 2); ctx.fill();
        }
    });
}

function update() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode) {
        if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
        if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
    } else {
        if(wallMode === "pass") {
            if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
            if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
        } else if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();
        if(snake.some((s, idx) => idx > 3 && s.x === head.x && s.y === head.y)) return endGame();
    }

    snake.unshift(head);

    if(head.x === food.x && head.y === food.y) {
        score += 5;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        
        // --- DINAMIK ZORLUK ---
        if (score % 50 === 0 && moveInterval > 45) {
            moveInterval -= 8;
            canvas.style.borderColor = "#ff4757"; // Hızlanma uyarısı
            setTimeout(() => canvas.style.borderColor = "var(--main-color)", 300);
            playSound(900, 0.2); // Hızlanma sesi
        }

        playSound(600, 0.1);
        spawnFood();
    } else {
        snake.pop();
    }
}

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    if (gameActive && !isPanic) {
        moveTimer += deltaTime;
        if (moveTimer >= moveInterval) { update(); moveTimer = 0; }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    if(score > highScore) {
        highScore = score;
        localStorage.setItem("best_v3", highScore);
        document.getElementById("highScore").innerText = score.toString().padStart(3, '0');
    }
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}];
    dx = GRID; dy = 0; score = 0; moveTimer = 0;
    moveInterval = parseInt(document.getElementById("difficulty").value);
    document.getElementById("score").innerText = "000";
    gameActive = true; spawnFood();
};

document.getElementById("saveBtn").onclick = () => {
    moveInterval = parseInt(document.getElementById("difficulty").value);
    wallMode = document.getElementById("wallMode").value;
    snakeColor = document.getElementById("themeSelect").value;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("restartBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("startBtn").click();
};
document.getElementById("backMenuBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
};

function panicMode() { isPanic = !isPanic; document.getElementById("panicScreen").classList.toggle("hidden", !isPanic); }

canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
requestAnimationFrame(gameLoop);

