const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; canvas.width = 600; canvas.height = 600;

// Oyun Değişkenleri
let snake = [], food = {}, dx = GRID, dy = 0, score = 0, gameActive = false;
let snakeColor = "#38bdf8", moveInterval = 130, lastTime = 0, moveTimer = 0;
let wallMode = "die", usePowerUps = true, canChangeDirection = true;
let currentLang = 'tr';

// DİL FONKSİYONU
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-key]").forEach(el => {
        const key = el.getAttribute("data-key");
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });
}

// JOYSTICK (Efe'nin Stabil Kontrolü)
let tX = 0, tY = 0;
canvas.addEventListener('touchstart', e => {
    tX = e.touches[0].clientX;
    tY = e.touches[0].clientY;
    canChangeDirection = true;
}, {passive: true});

canvas.addEventListener('touchmove', e => {
    if (!gameActive || !canChangeDirection) return;
    let dX = e.touches[0].clientX - tX;
    let dY = e.touches[0].clientY - tY;

    if (Math.abs(dX) > 30 || Math.abs(dY) > 30) {
        if (Math.abs(dX) > Math.abs(dY)) {
            if (dX > 0 && dx === 0) { dx = GRID; dy = 0; }
            else if (dX < 0 && dx === 0) { dx = -GRID; dy = 0; }
        } else {
            if (dY > 0 && dy === 0) { dy = GRID; dx = 0; }
            else if (dY < 0 && dy === 0) { dy = -GRID; dx = 0; }
        }
        tX = e.touches[0].clientX;
        tY = e.touches[0].clientY;
        canChangeDirection = false;
    }
}, {passive: false});

function spawnFood() {
    food = { 
        x: Math.floor(Math.random()*15)*GRID, 
        y: Math.floor(Math.random()*15)*GRID,
        char: usePowerUps && Math.random() < 0.2 ? "⚡️" : "🍎"
    };
}

function draw() {
    ctx.fillStyle = "#010409"; ctx.fillRect(0, 0, 600, 600);
    // Yılan Çizimi (Sprite-ish)
    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? snakeColor : "rgba(255,255,255,0.15)";
        ctx.beginPath(); ctx.roundRect(p.x+2, p.y+2, 36, 36, 8); ctx.fill();
        if(i === 0) { // Gözler
            ctx.fillStyle = "#fff";
            ctx.fillRect(p.x+10, p.y+12, 4, 4); ctx.fillRect(p.x+26, p.y+12, 4, 4);
        }
    });
    // Yemek
    ctx.font = "30px serif"; ctx.textAlign = "center";
    ctx.fillText(food.char, food.x + 20, food.y + 32);
}

function update() {
    canChangeDirection = true;
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if(wallMode === "pass") {
        if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
        if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
    } else if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();
    
    if(snake.some(s => s.x === head.x && s.y === head.y)) return endGame();
    
    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += 5; document.getElementById("score").innerText = score.toString().padStart(3,'0');
        if(food.char === "⚡️") moveInterval = Math.max(50, moveInterval - 20);
        spawnFood();
    } else { snake.pop(); }
}

function gameLoop(t) {
    if(!lastTime) lastTime = t;
    if(gameActive && t - lastTime > moveInterval) { update(); lastTime = t; }
    draw(); requestAnimationFrame(gameLoop);
}

function endGame() { gameActive = false; document.getElementById("gameOverScreen").classList.remove("hidden"); }

// BUTON OLAYLARI
document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x:240,y:240},{x:200,y:240}]; dx=GRID; dy=0; score=0; moveInterval=130;
    gameActive=true; spawnFood();
};

document.getElementById("saveBtn").onclick = () => {
    snakeColor = document.getElementById("themeSelect").value;
    wallMode = document.getElementById("wallMode").value;
    usePowerUps = document.getElementById("powerUpToggle").checked;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("backMenuBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
};
document.getElementById("restartBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("startBtn").click();
};

setLanguage('tr'); requestAnimationFrame(gameLoop);
