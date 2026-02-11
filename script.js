const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
canvas.width = 600; 
canvas.height = 600;

let snake = [], food = {}, dx = GRID, dy = 0, score = 0, highScore = 0, gameActive = false;
let snakeColor = "#38bdf8", moveInterval = 130, lastTime = 0;
let wallMode = "die", usePowerUps = true, godMode = false;

const fruits = ["🍎","🍏","🍉","🍇","🍓","🍒","🍍","🥝","🫐"];

function setLanguage(lang) {
    document.querySelectorAll("[data-key]").forEach(el => {
        const key = el.getAttribute("data-key");
        if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
    });
}

function spawnFood() {
    let rand = Math.random();
    let char;
    
    if (usePowerUps && rand < 0.15) {
        char = "⚡️"; // Hızlandırıcı
    } else if (usePowerUps && rand < 0.25) {
        char = "❄️"; // Yavaşlatıcı (Kar Tanesi geri geldi!)
    } else {
        char = fruits[Math.floor(Math.random() * fruits.length)];
    }

    food = { 
        x: Math.floor(Math.random() * 15) * GRID, 
        y: Math.floor(Math.random() * 15) * GRID,
        char: char
    };
}

function draw() {
    ctx.fillStyle = "#010409";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? (godMode ? "#facc15" : snakeColor) : "rgba(255,255,255,0.2)";
        ctx.shadowBlur = i === 0 ? 15 : 0; 
        ctx.shadowColor = snakeColor;
        
        ctx.beginPath();
        ctx.roundRect(p.x + 2, p.y + 2, 36, 36, 8); 
        ctx.fill();
        ctx.closePath();
    });

    ctx.shadowBlur = 0; 
    ctx.font = "32px serif"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(food.char, food.x + 20, food.y + 22);
}

function update() {
    let head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (godMode || wallMode === "pass") {
        if (head.x < 0) head.x = 560; else if (head.x >= 600) head.x = 0;
        if (head.y < 0) head.y = 560; else if (head.y >= 600) head.y = 0;
    } else {
        if (head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();
    }

    if (!godMode && snake.some(s => s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        // Güçlendirici Efektleri
        if (food.char === "⚡️") {
            score += 20;
            moveInterval = Math.max(50, moveInterval - 20); // Hızlandır
        } else if (food.char === "❄️") {
            score += 5;
            moveInterval = Math.min(200, moveInterval + 30); // Yavaşlat (Maksimum 200ms)
        } else {
            score += 10;
        }

        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        if (score > highScore) {
            highScore = score;
            document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');
        }
        spawnFood();
    } else {
        snake.pop();
    }
}

function gameLoop(t) {
    if (!lastTime) lastTime = t;
    if (gameActive && t - lastTime > moveInterval) {
        update();
        lastTime = t;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

let clickCount = 0;
document.querySelector(".glitch").onclick = () => {
    clickCount++;
    if (clickCount >= 3) {
        godMode = !godMode;
        alert("GOD MODE: " + (godMode ? "AKTİF" : "PASİF"));
        clickCount = 0;
    }
};

document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}];
    dx = GRID; dy = 0; score = 0; moveInterval = 130;
    document.getElementById("score").innerText = "000";
    gameActive = true;
    spawnFood();
};

document.getElementById("saveBtn").onclick = () => {
    snakeColor = document.getElementById("themeSelect").value;
    wallMode = document.getElementById("wallMode").value;
    usePowerUps = document.getElementById("powerUpToggle").checked;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("restartBtn").onclick = () => {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("startBtn").click();
};

requestAnimationFrame(gameLoop);
