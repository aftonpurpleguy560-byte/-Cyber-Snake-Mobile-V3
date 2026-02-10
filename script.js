const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
const CANVAS_SIZE = 600;

let snake = [], food = {}, dx = 0, dy = 0, score = 0, gameActive = false, isPanic = false;
let baseSpeed = 130, wallMode = "die", snakeColor = "#38bdf8";

// Skor Yükleme
let highScore = localStorage.getItem("best_v3") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

// TABLET SWIPE (KAYDIRMA)
let tX = 0, tY = 0;
canvas.addEventListener('touchstart', e => {
    tX = e.touches[0].clientX;
    tY = e.touches[0].clientY;
}, {passive: true});

canvas.addEventListener('touchmove', e => {
    if (!gameActive) return;
    let dX = e.touches[0].clientX - tX;
    let dY = e.touches[0].clientY - tY;
    
    if (Math.abs(dX) > Math.abs(dY)) {
        if (Math.abs(dX) > 25 && dx === 0) {
            dx = dX > 0 ? GRID : -GRID;
            dy = 0;
        }
    } else {
        if (Math.abs(dY) > 25 && dy === 0) {
            dy = dY > 0 ? GRID : -GRID;
            dx = 0;
        }
    }
}, {passive: true});

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * 15) * GRID,
        y: Math.floor(Math.random() * 15) * GRID,
        char: '🍎'
    };
}

function draw() {
    ctx.fillStyle = "#010409";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Arka Plan Izgarası
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for(let i=0; i<=CANVAS_SIZE; i+=GRID) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_SIZE,i); ctx.stroke();
    }

    if(gameActive) {
        ctx.font = "32px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(food.char, food.x + 20, food.y + 20);
    }

    // Silindir Yılan Çizimi
    snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? snakeColor : "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.roundRect(s.x + 2, s.y + 2, 36, 36, 12);
        ctx.fill();
        
        if(i === 0) { // Gözler
            ctx.fillStyle = "#fff";
            ctx.fillRect(s.x + 10, s.y + 12, 5, 5);
            ctx.fillRect(s.x + 25, s.y + 12, 5, 5);
        }
    });
}

function update() {
    if(!gameActive || isPanic) return;
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Duvar Kontrolü
    if(wallMode === "pass") {
        if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
        if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
    } else {
        if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();
    }

    // Çarpma Kontrolü
    if(snake.some((s, idx) => idx !== 0 && s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);

    // Yemek Yeme
    if(head.x === food.x && head.y === food.y) {
        score += 5;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        spawnFood();
    } else {
        snake.pop();
    }
}

function endGame(win = false) {
    gameActive = false;
    if(score > highScore) {
        highScore = score;
        localStorage.setItem("best_v3", highScore);
        document.getElementById("highScore").innerText = score.toString().padStart(3, '0');
    }
    document.getElementById(win ? "victoryScreen" : "gameOverScreen").classList.remove("hidden");
}

function loop() {
    update();
    draw();
    setTimeout(loop, baseSpeed);
}

// Buton İşlemleri
document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 200, y: 200}, {x: 160, y: 200}];
    dx = GRID; dy = 0; score = 0;
    document.getElementById("score").innerText = "000";
    gameActive = true;
    spawnFood();
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
document.getElementById("backMenuBtnWin").onclick = () => {
    document.getElementById("victoryScreen").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
};

function panicMode() {
    isPanic = !isPanic;
    document.getElementById("panicScreen").classList.toggle("hidden", !isPanic);
}

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
loop();

