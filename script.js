/**
 * Cyber Snake V3.1+ 
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID_SIZE = 40; 
const CANVAS_SIZE = 600;

// Değişkenler
let snake = [], food = {}, dx = GRID_SIZE, dy = 0, score = 0, gameActive = false;
let wallMode = "die", snakeColor = "#38bdf8", lastTime = 0, moveTimer = 0, moveInterval = 130; 
let godMode = false, frameCount = 0;

const fruits = ["🍎","🍉","🍇","🍍","🍓","🍒","🥝","🫐","🍊","🍋"];

// 1. SPRITE YÜKLEME (Dosya isimlerine DİKKAT: head.png, body.png, tail.png)
const snakeSprites = {
    head: new Image(),
    body: new Image(),
    tail: new Image()
};
snakeSprites.head.src = 'head.png'; 
snakeSprites.body.src = 'body.png';
snakeSprites.tail.src = 'tail.png';

// 2. YEMEK SİSTEMİ (Neon Efektli)
function spawnNewFood() {
    let newX, newY;
    let overlap = true;
    while (overlap) {
        newX = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        newY = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        overlap = snake.some(part => part.x === newX && part.y === newY);
    }
    food = { x: newX, y: newY, icon: fruits[Math.floor(Math.random() * fruits.length)] };
}

// 3. ÇİZİM FONKSİYONU
function draw() {
    frameCount++;
    ctx.fillStyle = "#010409"; 
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Izgara
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for(let i=0; i<=CANVAS_SIZE; i+=GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_SIZE,i); ctx.stroke();
    }

    if(gameActive) {
        // Yemeği Çiz (Neon Parlama)
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff00ff";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(food.icon, food.x + GRID_SIZE / 2, food.y + GRID_SIZE / 2);
        ctx.restore();

        // Yılanı Çiz
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
            ctx.translate(part.x + GRID_SIZE / 2, part.y + GRID_SIZE / 2);
            ctx.rotate(angle);

            // SPRITE KONTROLÜ
            if (sprite.complete && sprite.naturalWidth !== 0) {
                ctx.drawImage(sprite, -GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE);
            } else {
                // Eğer resimler yüklenmezse (Vercel hatası) siber blok çiz
                ctx.shadowBlur = 15;
                ctx.shadowColor = snakeColor;
                ctx.fillStyle = index === 0 ? snakeColor : "rgba(255, 255, 255, 0.2)";
                ctx.fillRect(-18, -18, 36, 36);
            }
            ctx.restore();
        });
    }
}

// 4. MANTIK GÜNCELLEME
function update() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Duvarlar
    if (godMode || wallMode === "pass") {
        if(head.x < 0) head.x = CANVAS_SIZE - GRID_SIZE; else if(head.x >= CANVAS_SIZE) head.x = 0;
        if(head.y < 0) head.y = CANVAS_SIZE - GRID_SIZE; else if(head.y >= CANVAS_SIZE) head.y = 0;
    } else if(head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) return endGame();

    // Çarpışma
    if(!godMode && snake.some((s, idx) => idx > 0 && s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        spawnNewFood();
    } else { snake.pop(); }
}

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const delta = currentTime - lastTime;
    lastTime = currentTime;
    if (gameActive) {
        moveTimer += delta;
        if (moveTimer >= moveInterval) { update(); moveTimer = 0; }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    let hi = localStorage.getItem("best_v3") || 0;
    if(score > hi) localStorage.setItem("best_v3", score);
    document.getElementById("highScore").innerText = Math.max(score, hi).toString().padStart(3, '0');
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Giriş ve Başlatma
document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}, {x: 160, y: 240}];
    dx = GRID_SIZE; dy = 0; score = 0;
    moveInterval = parseInt(document.getElementById("difficulty").value);
    gameActive = true; spawnNewFood();
};

// ... (Ayarlar ve Dil Fonksiyonları öncekiyle aynı)
document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("saveBtn").onclick = () => {
    moveInterval = parseInt(document.getElementById("difficulty").value);
    wallMode = document.getElementById("wallMode").value;
    snakeColor = document.getElementById("themeSelect").value;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};
document.getElementById("restartBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("startBtn").click(); };
document.getElementById("backMenuBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };

// Dokunmatik
let tX, tY;
canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; });
canvas.addEventListener('touchmove', e => {
    if(!gameActive) return;
    let dX = e.touches[0].clientX - tX, dY = e.touches[0].clientY - tY;
    if(Math.abs(dX) > 30 || Math.abs(dY) > 30) {
        if(Math.abs(dX) > Math.abs(dY)) { if(dx === 0) { dx = dX > 0 ? GRID_SIZE : -GRID_SIZE; dy = 0; } }
        else { if(dy === 0) { dy = dY > 0 ? GRID_SIZE : -GRID_SIZE; dx = 0; } }
        tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    }
});

window.onload = () => {
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
    setLanguage(localStorage.getItem("efe_lang") || "tr");
    requestAnimationFrame(gameLoop);
};

