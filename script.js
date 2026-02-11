/**
 * Cyber Snake V3.1+ | Sprite & Neon Food Edition
 * Purpleguy © 2026 - tablet power
 * Architect: Efe
 */

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID_SIZE = 40; 
const CANVAS_SIZE = 600;

// Oyun Değişkenleri
let snake = [], food = {}, dx = GRID_SIZE, dy = 0, score = 0, gameActive = false, isPanic = false;
let wallMode = "die", snakeColor = "#38bdf8", lastTime = 0, moveTimer = 0, moveInterval = 130; 
let godMode = false, frameCount = 0;

// Meyve Listesi
const fruits = ["🍎","🍉","🍇","🍍","🍓","🍒","🥝","🫐","🍊","🍋"];

// 1. SPRITE SİSTEMİ (Sprite.js Entegrasyonu)
const snakeSprites = {
    head: new Image(),
    body: new Image(),
    tail: new Image()
};
snakeSprites.head.src = 'head.png'; 
snakeSprites.body.src = 'body.png';
snakeSprites.tail.src = 'tail.png';

// 2. DİL SİSTEMİ (translations.js Bağlantısı)
function setLanguage(lang) {
    const t = translations[lang];
    if(!t) return;
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
    
    // Select seçeneklerini güncelle
    document.getElementById("opt-slow").innerText = t.slow;
    document.getElementById("opt-normal").innerText = t.normal;
    document.getElementById("opt-fast").innerText = t.fast;
    document.getElementById("opt-die").innerText = t.die;
    document.getElementById("opt-pass").innerText = t.pass;
    
    localStorage.setItem("efe_lang", lang);
}

// 3. YEMEK SİSTEMİ (Yeni Food Mantığı)
function spawnNewFood() {
    let newX, newY;
    let overlap = true;
    while (overlap) {
        newX = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        newY = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        overlap = snake.some(part => part.x === newX && part.y === newY);
    }
    food = {
        x: newX,
        y: newY,
        icon: fruits[Math.floor(Math.random() * fruits.length)]
    };
}

function drawFood() {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff00ff"; // Siber Pembe Parlama
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(food.icon, food.x + GRID_SIZE / 2, food.y + GRID_SIZE / 2);
    ctx.restore();
}

// 4. ANA ÇİZİM DÖNGÜSÜ
function draw() {
    frameCount++;
    ctx.fillStyle = "#010409"; 
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Izgara Arkaplan
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for(let i=0; i<=CANVAS_SIZE; i+=GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_SIZE,i); ctx.stroke();
    }

    if(gameActive) {
        drawFood();

        // Yılan Çizimi (Sprite & Yön Takibi)
        snake.forEach((part, index) => {
            let sprite;
            let angle = 0;

            if (index === 0) { // KAFA
                sprite = snakeSprites.head;
                if (dx > 0) angle = 0;
                else if (dx < 0) angle = Math.PI;
                else if (dy > 0) angle = Math.PI / 2;
                else if (dy < 0) angle = -Math.PI / 2;
            } else if (index === snake.length - 1) { // KUYRUK
                sprite = snakeSprites.tail;
                const prev = snake[index - 1];
                angle = Math.atan2(prev.y - part.y, prev.x - part.x);
            } else { // GÖVDE
                sprite = snakeSprites.body;
                const prev = snake[index - 1];
                angle = Math.atan2(prev.y - part.y, prev.x - part.x);
            }

            ctx.save();
            ctx.translate(part.x + GRID_SIZE / 2, part.y + GRID_SIZE / 2);
            ctx.rotate(angle);
            
            if (sprite.complete && sprite.naturalWidth !== 0) {
                ctx.drawImage(sprite, -GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE);
            } else {
                // Fallback: Resim yoksa neon kare çiz
                ctx.shadowBlur = 10;
                ctx.shadowColor = snakeColor;
                ctx.fillStyle = index === 0 ? snakeColor : "rgba(255, 255, 255, 0.2)";
                ctx.fillRect(-17, -17, 34, 34);
            }
            ctx.restore();
        });
    }
}

// 5. MANTIK GÜNCELLEME
function update() {
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Duvar Kontrolü
    if (godMode || wallMode === "pass") {
        if(head.x < 0) head.x = CANVAS_SIZE - GRID_SIZE; else if(head.x >= CANVAS_SIZE) head.x = 0;
        if(head.y < 0) head.y = CANVAS_SIZE - GRID_SIZE; else if(head.y >= CANVAS_SIZE) head.y = 0;
    } else if(head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) return endGame();

    // Kendine Çarpma
    if(!godMode && snake.some((s, idx) => idx > 0 && s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);

    // Yemek Yeme
    if(head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        spawnNewFood();
    } else {
        snake.pop();
    }
}

// 6. OYUN KONTROL VE DÖNGÜ
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
    let hi = localStorage.getItem("best_v3") || 0;
    if(score > hi) {
        localStorage.setItem("best_v3", score);
        document.getElementById("highScore").innerText = score.toString().padStart(3, '0');
    }
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Buton Atamaları
document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}, {x: 160, y: 240}];
    dx = GRID_SIZE; dy = 0; score = 0;
    document.getElementById("score").innerText = "000";
    moveInterval = parseInt(document.getElementById("difficulty").value);
    gameActive = true; 
    spawnNewFood();
};

document.getElementById("saveBtn").onclick = () => {
    moveInterval = parseInt(document.getElementById("difficulty").value);
    wallMode = document.getElementById("wallMode").value;
    snakeColor = document.getElementById("themeSelect").value;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

// ... (Diğer menü butonları: settingsBtn, restartBtn vb.)
document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("restartBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("startBtn").click(); };
document.getElementById("backMenuBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };

// Dokunmatik Swipe Kontrolü
let tX = 0, tY = 0;
canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; }, {passive: true});
canvas.addEventListener('touchmove', e => {
    if (!gameActive) return;
    let dX = e.touches[0].clientX - tX, dY = e.touches[0].clientY - tY;
    if (Math.abs(dX) > 30 || Math.abs(dY) > 30) {
        if (Math.abs(dX) > Math.abs(dY)) {
            if (dx === 0) { dx = dX > 0 ? GRID_SIZE : -GRID_SIZE; dy = 0; }
        } else {
            if (dy === 0) { dy = dY > 0 ? GRID_SIZE : -GRID_SIZE; dx = 0; }
        }
        tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    }
}, {passive: true});

// Klavye Kontrolü
window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -GRID_SIZE; }
    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = GRID_SIZE; }
    if (e.key === "ArrowLeft" && dx === 0) { dx = -GRID_SIZE; dy = 0; }
    if (e.key === "ArrowRight" && dx === 0) { dx = GRID_SIZE; dy = 0; }
});

// Başlatma
window.onload = () => {
    setLanguage(localStorage.getItem("efe_lang") || "tr");
    canvas.width = CANVAS_SIZE; 
    canvas.height = CANVAS_SIZE;
    requestAnimationFrame(gameLoop);
};

function panicMode() { isPanic = !isPanic; document.getElementById("panicScreen").classList.toggle("hidden", !isPanic); }
