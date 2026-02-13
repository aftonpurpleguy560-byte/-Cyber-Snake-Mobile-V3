const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;

let score = 0;
let speed = 125;
let d = "RIGHT";
let snake = [{x: 8 * box, y: 10 * box}];
let special = null;

// --- 15 ÇEŞİT YEMEK LİSTESİ ---
const foods = ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🍍","🥝","🥥"];
let food = getRandomFood();

function getRandomFood() {
    return {
        x: Math.floor(Math.random()*17+1)*box,
        y: Math.floor(Math.random()*17+1)*box,
        icon: foods[Math.floor(Math.random()*foods.length)]
    };
}

// --- DOKUNMATİK VE TIKLAMA KONTROLLERİ (FIXED) ---
const setDir = (newD) => {
    if (newD == "UP" && d != "DOWN") d = "UP";
    if (newD == "DOWN" && d != "UP") d = "DOWN";
    if (newD == "LEFT" && d != "RIGHT") d = "LEFT";
    if (newD == "RIGHT" && d != "LEFT") d = "RIGHT";
};

// Buton id'lerini ve yönlerini eşleştiriyoruz
const controls = {
    "upBtn": "UP",
    "downBtn": "DOWN",
    "leftBtn": "LEFT",
    "rightBtn": "RIGHT"
};

Object.keys(controls).forEach(id => {
    const el = document.getElementById(id);
    const dir = controls[id];
    
    // Mobilde gecikmesiz tepki için touchstart
    el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        setDir(dir);
    }, {passive: false});

    // PC'de tıklama için mousedown
    el.addEventListener("mousedown", () => setDir(dir));
});

// Klavye desteği (Test yaparken lazım olur)
document.addEventListener("keydown", (e) => {
    if(e.keyCode == 37) setDir("LEFT");
    if(e.keyCode == 38) setDir("UP");
    if(e.keyCode == 39) setDir("RIGHT");
    if(e.keyCode == 40) setDir("DOWN");
});

// --- SİBER BİLDİRİM SİSTEMİ ---
function showMsg(txt, clr) {
    const n = document.getElementById("notify");
    n.innerText = txt;
    n.style.color = clr;
    n.style.textShadow = `0 0 15px ${clr}`;
    n.style.opacity = 1;
    setTimeout(() => n.style.opacity = 0, 800);
}

// --- OYUN DÖNGÜSÜ ---
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yılan Çizimi (Neon Efekt)
    for(let i=0; i<snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#00f3ff" : "#005f66";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Yemek Çizimi
    ctx.font = "16px Arial";
    ctx.fillText(food.icon, food.x + 2, food.y + 16);

    // Özel Item Çizimi (⚡️, ⭐️, ❄️, 💠)
    if(special) {
        ctx.fillText(special.icon, special.x + 2, special.y + 16);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if(d == "LEFT") snakeX -= box;
    if(d == "UP") snakeY -= box;
    if(d == "RIGHT") snakeX += box;
    if(d == "DOWN") snakeY += box;

    // YEMEK YEME VE PUANLAMA
    if(snakeX == food.x && snakeY == food.y) {
        score++;
        food = getRandomFood();
        // Her 10 skorda zorluk artışı
        if(score % 10 == 0) { 
            speed -= 5; 
            showMsg("LEVEL UP! ⚡️", "#ff003c");
            restart(); 
        }
        // %30 şansla özel item çıkar
        if(Math.random() < 0.3) spawnSpecial();
    } else if(special && snakeX == special.x && snakeY == special.y) {
        handlePower(special.type);
        special = null;
    } else {
        snake.pop();
    }

    let newHead = {x: snakeX, y: snakeY};

    // ÖLÜM KONTROLÜ
    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        showMsg("GAME OVER", "white");
        setTimeout(() => location.reload(), 1500);
        return;
    }

    snake.unshift(newHead);
    document.getElementById("scoreDisplay").innerText = "SKOR: " + String(score).padStart(3, '0');
}

// ÖZEL İTEM SPAWN (EFE'NİN GÜÇLERİ)
function spawnSpecial() {
    const types = [
        {t: "BOLT", i: "⚡️"}, {t: "STAR", i: "⭐️"},
        {t: "SNOW", i: "❄️"}, {t: "DIAM", i: "💠"}
    ];
    const sel = types[Math.floor(Math.random()*types.length)];
    special = { 
        x: Math.floor(Math.random()*17+1)*box, 
        y: Math.floor(Math.random()*17+1)*box, 
        type: sel.t, 
        icon: sel.i 
    };
}

// GÜÇLERİ UYGULA
function handlePower(t) {
    if(t == "BOLT") { score += 2; speed -= 5; showMsg("HIZLANDI! ⚡️", "yellow"); }
    if(t == "STAR") { score += 4; speed -= 10; showMsg("SÜPER HIZ! ⭐️", "gold"); }
    if(t == "SNOW") { score += 2; speed += 5; showMsg("YAVAŞLADI ❄️", "#a5f3fc"); }
    if(t == "DIAM") { score += 1; speed += 10; showMsg("KONTROL 💠", "#2563eb"); }
    restart();
}

function collision(head, array) {
    for(let i=0; i<array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

let game;
function restart() { 
    clearInterval(game); 
    game = setInterval(draw, speed); 
}

// Başlat!
restart();
