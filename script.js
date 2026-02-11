const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
const CANVAS_SIZE = 600;

let snake = [], food = {}, dx = 0, dy = 0, score = 0, gameActive = false, isPanic = false;
let baseSpeed = 130, wallMode = "die", snakeColor = "#38bdf8";

// GOD MODE DEĞİŞKENLERİ
let godMode = false;
let clickCount = 0;
let lastClickTime = 0;

// SES SİSTEMİ
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, duration) {
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

// BEST SCORE
let highScore = localStorage.getItem("best_v3") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

// GİZLİ GOD MODE TETİKLEYİCİ (3 Tıklama)
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
        // God Mode açıksa yılan altın rengi olur
        ctx.fillStyle = godMode ? "#facc15" : (i === 0 ? snakeColor : "rgba(255, 255, 255, 0.2)");
        ctx.beginPath();
        ctx.roundRect(s.x + 2, s.y + 2, 36, 36, 12);
        ctx.fill();
        if(i === 0) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(s.x + 10, s.y + 12, 5, 5); ctx.fillRect(s.x + 25, s.y + 12, 5, 5);
        }
    });
}

function update() {
    if(!gameActive || isPanic) return;
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // GOD MODE: DUVARLARDAN GEÇİŞ
    if (godMode) {
        if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
        if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
    } else {
        if(wallMode === "pass") {
            if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
            if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
        } else {
            if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();
        }
        // GOD MODE kapalıyken kendine çarpma
        if(snake.some((s, idx) => idx > 3 && s.x === head.x && s.y === head.y)) return endGame();
    }

    snake.unshift(head);

    if(head.x === food.x && head.y === food.y) {
        score += 5;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        playSound(600, 0.1);
        spawnFood();
    } else {
        snake.pop();
    }
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

function loop() {
    update(); draw();
    setTimeout(loop, baseSpeed);
}

document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 200, y: 200}, {x: 160, y: 200}];
    dx = GRID; dy = 0; score = 0;
    document.getElementById("score").innerText = "000";
    gameActive = true; spawnFood();
};

document.getElementById("saveBtn").onclick = () => {
    baseSpeed = parseInt(document.getElementById("difficulty").value);
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
loop();

