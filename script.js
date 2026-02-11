const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
const CANVAS_SIZE = 600;

// Oyun Değişkenleri
let snake = [], food = {}, dx = GRID, dy = 0, score = 0, gameActive = false, isPanic = false;
let wallMode = "die", snakeColor = "#38bdf8", lastTime = 0, moveTimer = 0, moveInterval = 130; 
let godMode = false, frameCount = 0;

// Yeni: Yemek Listesi ve Özel Objeler
const fruits = ["🍇","🍈","🍉","🍊","🍋","🍍","🥭","🍎","🍏","🍐","🍒","🍓","🫐","🥝","🍅"];
const powerUps = [
    { char: "⚡️", type: "speed", score: 10 },
    { char: "❄️", type: "slow", score: 2 }
];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function spawnFood() {
    // %20 ihtimalle Power-up, %80 ihtimalle normal meyve çıkar
    const isPowerUp = Math.random() < 0.2;
    if (isPowerUp) {
        const p = powerUps[Math.floor(Math.random() * powerUps.length)];
        food = { x: Math.floor(Math.random() * 15) * GRID, y: Math.floor(Math.random() * 15) * GRID, ...p };
    } else {
        const char = fruits[Math.floor(Math.random() * fruits.length)];
        food = { x: Math.floor(Math.random() * 15) * GRID, y: Math.floor(Math.random() * 15) * GRID, char: char, type: "normal", score: 5 };
    }
}

function draw() {
    frameCount++;
    ctx.fillStyle = "#010409";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Arka Plan Izgarası
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for(let i=0; i<=600; i+=GRID) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(600,i); ctx.stroke();
    }

    if(gameActive) {
        // Yemek Animasyonu
        ctx.font = "32px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(food.char, food.x + 20, food.y + 20);

        // TAM SİLİNDİR YILAN
        if (snake.length > 0) {
            ctx.shadowBlur = 15 + Math.sin(frameCount * 0.1) * 5;
            ctx.shadowColor = godMode ? "#facc15" : snakeColor;

            ctx.beginPath();
            ctx.lineWidth = 34;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = godMode ? "#facc15" : snakeColor;

            ctx.moveTo(snake[0].x + 20, snake[0].y + 20);
            for(let i = 1; i < snake.length; i++) {
                ctx.lineTo(snake[i].x + 20, snake[i].y + 20);
            }
            ctx.stroke();

            // Gözler
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fff";
            const head = snake[0];
            ctx.beginPath(); ctx.arc(head.x + 14, head.y + 16, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(head.x + 26, head.y + 16, 4, 0, Math.PI*2); ctx.fill();
        }
    }
}

function update() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallMode === "pass") {
        if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
        if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
    } else if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();
    
    if(!godMode && snake.some((s, idx) => idx > 1 && s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);

    // YEMEK YEME VE POWER-UP KONTROLÜ
    if(head.x === food.x && head.y === food.y) {
        score += food.score;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');

        // Power-up Etkileri
        if (food.type === "speed") {
            moveInterval = Math.max(40, moveInterval - 20); // Ciddi hızlanma
            canvas.style.borderColor = "#facc15";
            playSound(900, 0.2);
        } else if (food.type === "slow") {
            moveInterval = Math.min(220, moveInterval + 30); // Rahatlatıcı yavaşlama
            canvas.style.borderColor = "#38bdf8";
            playSound(400, 0.2);
        } else {
            playSound(600, 0.1);
        }

        // Normal Skor Hızlanması
        if (score % 50 === 0 && moveInterval > 45) {
            moveInterval -= 5;
        }

        spawnFood();
    } else {
        snake.pop();
    }
}

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const delta = currentTime - lastTime;
    lastTime = currentTime;
    if (gameActive && !isPanic) {
        moveTimer += delta;
        if (moveTimer >= moveInterval) { update(); moveTimer = 0; }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}];
    dx = GRID; dy = 0; score = 0; moveInterval = 130;
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

canvas.width = 600; canvas.height = 600;
requestAnimationFrame(gameLoop);
