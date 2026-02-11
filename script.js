/**
 * Cyber Snake V3.1+ 
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
const CANVAS_SIZE = 600;

// Oyun Değişkenleri
let snake = [], food = {}, dx = GRID, dy = 0, score = 0, gameActive = false, isPanic = false;
let wallMode = "die", snakeColor = "#38bdf8", lastTime = 0, moveTimer = 0, moveInterval = 130; 
let godMode = false, frameCount = 0;
const fruits = ["🍎","🍉","🍇","🍍","🍓","🍒","🥝","🫐"];

// Sprite Tanımları
const snakeSprites = {
    head: new Image(),
    body: new Image(),
    tail: new Image()
};
snakeSprites.head.src = 'head.png'; 
snakeSprites.body.src = 'body.png';
snakeSprites.tail.src = 'tail.png';

// DİL SİSTEMİ
function setLanguage(lang) {
    const t = translations[lang];
    document.getElementById("txt-score-label").innerText = t.scoreLabel;
    document.getElementById("txt-best-label").innerText = t.bestLabel;
    document.getElementById("godStatus").innerText = t.godModeActive;
    document.getElementById("startBtn").innerText = t.startBtn;
    document.getElementById("settingsBtn").innerText = t.settingsBtn;
    document.getElementById("txt-settings-title").innerText = t.settingsTitle;
    document.getElementById("txt-settings-title").setAttribute("data-text", t.settingsTitle);
    document.getElementById("txt-speed-label").innerText = t.speedLabel;
    document.getElementById("txt-walls-label").innerText = t.wallsLabel;
    document.getElementById("txt-theme-label").innerText = t.themeLabel;
    document.getElementById("saveBtn").innerText = t.saveBtn;
    document.getElementById("restartBtn").innerText = t.restartBtn;
    document.getElementById("backMenuBtn").innerText = t.backMenuBtn;
    document.getElementById("txt-halt-title").innerText = t.systemHalt;
    document.getElementById("txt-halt-title").setAttribute("data-text", t.systemHalt);
    document.getElementById("opt-slow").innerText = t.slow;
    document.getElementById("opt-normal").innerText = t.normal;
    document.getElementById("opt-fast").innerText = t.fast;
    document.getElementById("opt-die").innerText = t.die;
    document.getElementById("opt-pass").innerText = t.pass;
    localStorage.setItem("efe_lang", lang);
}

function spawnFood() {
    food = { 
        x: Math.floor(Math.random() * 14) * GRID, 
        y: Math.floor(Math.random() * 14) * GRID, 
        char: fruits[Math.floor(Math.random() * fruits.length)],
        score: 5 
    };
}

function draw() {
    frameCount++;
    ctx.fillStyle = "#010409"; 
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Arkaplan Izgarası
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for(let i=0; i<=600; i+=GRID) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(600,i); ctx.stroke();
    }

    if(gameActive) {
        // Yemek
        const pulse = Math.sin(frameCount * 0.1) * 3;
        ctx.font = `${32 + pulse}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(food.char, food.x + 20, food.y + 20);

        // Yılan (Sprite Çizimi)
        snake.forEach((part, index) => {
            let sprite;
            let angle = 0;

            if (index === 0) {
                sprite = snakeSprites.head;
                if (dx > 0) angle = 0;
                else if (dx < 0) angle = Math.PI;
                else if (dy > 0) angle = Math.PI / 2;
                else if (dy < 0) angle = -Math.PI / 2;
            } else if (index === snake.length - 1) {
                sprite = snakeSprites.tail;
                const prev = snake[index - 1];
                angle = Math.atan2(prev.y - part.y, prev.x - part.x);
            } else {
                sprite = snakeSprites.body;
                const prev = snake[index - 1];
                angle = Math.atan2(prev.y - part.y, prev.x - part.x);
            }

            ctx.save();
            ctx.translate(part.x + GRID / 2, part.y + GRID / 2);
            ctx.rotate(angle);

            if (sprite.complete && sprite.naturalWidth !== 0) {
                ctx.drawImage(sprite, -GRID / 2, -GRID / 2, GRID, GRID);
            } else {
                ctx.fillStyle = index === 0 ? snakeColor : "rgba(255, 255, 255, 0.15)";
                ctx.fillRect(-17, -17, 34, 34);
            }
            ctx.restore();
        });
    }
}

function update() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (godMode || wallMode === "pass") {
        if(head.x < 0) head.x = 560; else if(head.x >= 600) head.x = 0;
        if(head.y < 0) head.y = 560; else if(head.y >= 600) head.y = 0;
    } else if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) return endGame();

    if(!godMode && snake.some((s, idx) => idx > 0 && s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += food.score;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        spawnFood();
    } else { snake.pop(); }
}

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const delta = currentTime - lastTime;
    lastTime = currentTime;
    if (gameActive && !isPanic) {
        moveTimer += delta;
        if (moveTimer >= moveInterval) { update(); moveTimer = 0; }
    }
    draw(); requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    let hi = localStorage.getItem("best_v3") || 0;
    if(score > hi) localStorage.setItem("best_v3", score);
    document.getElementById("highScore").innerText = Math.max(score, hi).toString().padStart(3, '0');
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Event Listeners
document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}]; dx = GRID; dy = 0; score = 0;
    moveInterval = parseInt(document.getElementById("difficulty").value);
    gameActive = true; spawnFood();
};

document.getElementById("saveBtn").onclick = () => {
    moveInterval = parseInt(document.getElementById("difficulty").value);
    wallMode = document.getElementById("wallMode").value;
    snakeColor = document.getElementById("themeSelect").value;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

// ... (Kalan butonlar: restartBtn, backMenuBtn vb. aynı kalıyor)
document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("restartBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("startBtn").click(); };
document.getElementById("backMenuBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };

window.onload = () => { 
    setLanguage(localStorage.getItem("efe_lang") || "tr"); 
    canvas.width = 600; canvas.height = 600; 
    requestAnimationFrame(gameLoop);
};
