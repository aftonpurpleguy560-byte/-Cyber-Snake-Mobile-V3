/**
 * Cyber Snake v3.8 | Swipe Fix & Speed Gear Update
 * Purpleguy © 2026 - tablet power
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const eatSound = document.getElementById("eatSound");

// --- SİSTEM DEĞİŞKENLERİ ---
let gridSize = 20;
let score = 0;
let gameSpeed = 25; // Varsayılan "Normal" hız
let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let food = {x: 0, y: 0, type: '🍎', points: 7};
let dx = 20, dy = 0;
let gameRunning = false;
let wallPass = false;
let primaryColor = "#00f3ff";
let highScore = localStorage.getItem("best") || 0;

document.getElementById("highScoreValue").innerText = highScore.toString().padStart(3, '0');

// --- HIZ AYARLARI (SENİN İSTEDİĞİN VİTESLER) ---
window.setSpeed = (v) => {
    // String olarak gelen değeri sayıya çeviriyoruz
    gameSpeed = parseInt(v); 
    console.log("Siber Hız Ayarlandı: " + gameSpeed);
};

// --- SWIPE (KAYDIRMA) KONTROLÜ - MOBİL İÇİN KRİTİK ---
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault(); 
}, {passive: false});

canvas.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
            if (diffX > 0 && dx === 0) { dx = gridSize; dy = 0; } // Sağ
            else if (diffX < 0 && dx === 0) { dx = -gridSize; dy = 0; } // Sol
        }
    } else {
        if (Math.abs(diffY) > 30) {
            if (diffY > 0 && dy === 0) { dx = 0; dy = gridSize; } // Aşağı
            else if (diffY < 0 && dy === 0) { dx = 0; dy = -gridSize; } // Yukarı
        }
    }
    e.preventDefault();
}, {passive: false});

// --- OYUN MOTORU ---
function main() {
    if(!gameRunning) return;
    
    // İz bırakma efekti (60 FPS görünümü için)
    ctx.fillStyle = "rgba(5, 5, 5, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFood();
    move();
    drawSnake();

    // Hız burada uygulanıyor
    setTimeout(() => {
        requestAnimationFrame(main);
    }, 1000 / gameSpeed); 
}

function move() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Duvar Kontrolü ve Reset Döngüsü Kırıcı
    if(wallPass) {
        if(head.x >= canvas.width) head.x = 0; else if(head.x < 0) head.x = canvas.width - gridSize;
        if(head.y >= canvas.height) head.y = 0; else if(head.y < 0) head.y = canvas.height - gridSize;
    } else {
        if(head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) {
            gameOver();
            return;
        }
    }

    // Kendi üzerine çarpma kontrolü
    for(let i = 1; i < snake.length; i++) {
        if(head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += food.points;
        if(eatSound) { eatSound.currentTime = 0; eatSound.play(); }
        document.getElementById("scoreValue").innerText = score.toString().padStart(3, '0');
        if(score > highScore) { highScore = score; localStorage.setItem("best", score); }
        createFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((part, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? primaryColor : `rgba(${hexToRgb(primaryColor)}, ${1 - i/snake.length})`;
        ctx.shadowBlur = isHead ? 15 : 0;
        ctx.shadowColor = primaryColor;
        
        // Yuvarlatılmış Kare Çizimi
        drawRoundedRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, 5);

        if(isHead) { // Canlı Gözler
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.arc(part.x+14, part.y+6, 2, 0, 7); ctx.fill();
            ctx.beginPath(); ctx.arc(part.x+14, part.y+14, 2, 0, 7); ctx.fill();
        }
    });
}

function drawFood() {
    ctx.font = "18px serif";
    ctx.shadowBlur = 10; ctx.shadowColor = "red";
    ctx.fillText(food.type, food.x + 2, food.y + 17);
    ctx.shadowBlur = 0;
}

function createFood() {
    food.x = Math.floor(Math.random()*(canvas.width/gridSize))*gridSize;
    food.y = Math.floor(Math.random()*(canvas.height/gridSize))*gridSize;
    // Food tipi v3.8 meyve listesinden rastgele seçilebilir
}

function gameOver() {
    gameRunning = false; // RESET DÖNGÜSÜNÜ BURASI KIRAR!
    alert("SİSTEM ÇÖKTÜ! \nSkorun: " + score);
    location.reload();
}

function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r); ctx.closePath(); ctx.fill();
}

function hexToRgb(hex) {
    let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return `${r}, ${g}, ${b}`;
}

window.startGame = () => {
    document.getElementById("menu").style.transform = "scale(0)";
    setTimeout(() => {
        document.getElementById("menu").style.display = "none";
        canvas.style.display = "block";
        gameRunning = true; 
        createFood(); 
        main();
    }, 400);
};

window.setWallPass = (v) => wallPass = v;
