const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const GRID = 40; 
const CANVAS_SIZE = 600;

let snake = [], food = {}, dx = GRID, dy = 0, score = 0, gameActive = false, isPanic = false;
let wallMode = "die", snakeColor = "#38bdf8", lastTime = 0, moveTimer = 0, moveInterval = 130; 
let godMode = false, clickCount = 0, lastClickTime = 0, frameCount = 0;

const fruits = ["🍇","🍈","🍉","🍊","🍋","🍍","🥭","🍎","🍏","🍐","🍒","🍓","🫐","🥝","🍅"];
const powerUps = [{ char: "⚡️", type: "speed", score: 10, sound: 900 }, { char: "❄️", type: "slow", score: 2, sound: 400 }];
const headImg = new Image(); headImg.src = 'kafa.png';

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

// SES SİSTEMİ
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

let highScore = localStorage.getItem("best_v3") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

document.getElementById("godTrigger").onclick = () => {
    const now = Date.now();
    if (now - lastClickTime > 500) clickCount = 0;
    clickCount++; lastClickTime = now;
    if (clickCount === 3) {
        godMode = !godMode; clickCount = 0;
        document.getElementById("godStatus").style.visibility = godMode ? "visible" : "hidden";
        playSound(godMode ? 800 : 200, 0.3);
    }
};

let tX = 0, tY = 0;
canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; }, {passive: true});
canvas.addEventListener('touchmove', e => {
    if (!gameActive) return;
    let dX = e.touches[0].clientX - tX, dY = e.touches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) {
        if (Math.abs(dX) > 20 && dx === 0) { dx = dX > 0 ? GRID : -GRID; dy = 0; tX = e.touches[0].clientX; }
    } else {
        if (Math.abs(dY) > 20 && dy === 0) { dy = dY > 0 ? GRID : -GRID; dx = 0; tY = e.touches[0].clientY; }
    }
}, {passive: true});

function spawnFood() {
    food = { x: Math.floor(Math.random() * 14) * GRID, y: Math.floor(Math.random() * 14) * GRID, char: fruits[Math.floor(Math.random() * fruits.length)], score: 5 };
}

function drawRoundedRect(x, y, size, radius) {
    ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + size - radius, y); ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    ctx.lineTo(x + size, y + size - radius); ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    ctx.lineTo(x + radius, y + size); ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();
}

function draw() {
    frameCount++;
    ctx.fillStyle = "#010409"; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for(let i=0; i<=600; i+=GRID) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(600,i); ctx.stroke();
    }
    if(gameActive) {
        const pulse = Math.sin(frameCount * 0.1) * 3;
        ctx.font = `${32 + pulse}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(food.char, food.x + 20, food.y + 20);

        snake.forEach((part, index) => {
            if (index === 0 && headImg.complete && headImg.naturalWidth !== 0) {
                ctx.drawImage(headImg, part.x, part.y, GRID, GRID);
            } else {
                ctx.shadowBlur = 12; ctx.shadowColor = godMode ? "#facc15" : snakeColor;
                ctx.fillStyle = godMode ? "#facc15" : (index === 0 ? snakeColor : "rgba(255, 255, 255, 0.15)");
                drawRoundedRect(part.x + 3, part.y + 3, 34, 8); ctx.fill();
                if (index === 0) {
                    ctx.shadowBlur = 0; ctx.fillStyle = "#fff";
                    ctx.beginPath(); ctx.arc(part.x + 13, part.y + 16, 4, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(part.x + 27, part.y + 16, 4, 0, Math.PI*2); ctx.fill();
                }
            }
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
        score += food.score; document.getElementById("score").innerText = score.toString().padStart(3, '0');
        playSound(600, 0.15); spawnFood();
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
    if(score > highScore) { highScore = score; localStorage.setItem("best_v3", highScore); document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0'); }
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

document.getElementById("startBtn").onclick = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    snake = [{x: 240, y: 240}, {x: 200, y: 240}]; dx = GRID; dy = 0; score = 0; moveTimer = 0;
    document.getElementById("score").innerText = "000"; gameActive = true; spawnFood();
};

document.getElementById("saveBtn").onclick = () => {
    moveInterval = parseInt(document.getElementById("difficulty").value);
    wallMode = document.getElementById("wallMode").value;
    snakeColor = document.getElementById("themeSelect").value;
    document.documentElement.style.setProperty('--main-color', snakeColor);
    document.getElementById("settingsMenu").classList.add("hidden");
};

document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsMenu").classList.remove("hidden");
document.getElementById("restartBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("startBtn").click(); };
document.getElementById("backMenuBtn").onclick = () => { document.getElementById("gameOverScreen").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };
function panicMode() { isPanic = !isPanic; document.getElementById("panicScreen").classList.toggle("hidden", !isPanic); }

window.onload = () => { setLanguage(localStorage.getItem("efe_lang") || "tr"); };
canvas.width = 600; canvas.height = 600; requestAnimationFrame(gameLoop);
