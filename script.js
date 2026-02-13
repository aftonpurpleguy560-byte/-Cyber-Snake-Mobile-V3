// --- SİSTEM BAŞLATICI ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;

// Oyun Değişkenleri (Senin Orjinal Ayarların)
let score = 0;
let speed = 125;
let d = "RIGHT";
let snake = [{x: 8 * box, y: 10 * box}];
let special = null;
let game;

// --- 15 ÇEŞİT YEMEK VE PUAN SKALASI (V3.1 DERİNLİĞİ) ---
// Her birinin sprite karşılığı ve puanı farklıdır
const foodTypes = [
    { i: "🍎", p: 5 }, { i: "🍐", p: 5 }, { i: "🍊", p: 10 },
    { i: "🍋", p: 10 }, { i: "🍌", p: 15 }, { i: "🍉", p: 15 },
    { i: "🍇", p: 20 }, { i: "🍓", p: 20 }, { i: "🫐", p: 25 },
    { i: "🍈", p: 25 }, { i: "🍒", p: 30 }, { i: "🍑", p: 30 },
    { i: "🍍", p: 40 }, { i: "🥝", p: 40 }, { i: "🍄", p: 50 }
];

let food = getRandomFood();

function getRandomFood() {
    let newX, newY;
    let isOccupied = true;
    
    // Yemeğin yılanın üzerine çıkmaması için döngü (Gerçek Optimizasyon Budur)
    while(isOccupied) {
        newX = Math.floor(Math.random() * 17 + 1) * box;
        newY = Math.floor(Math.random() * 17 + 1) * box;
        isOccupied = snake.some(part => part.x === newX && part.y === newY);
    }

    const sel = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    return { x: newX, y: newY, icon: sel.i, point: sel.p };
}

// --- KONTROL MEKANİZMASI (DOKUNMATİK & KLAVYE) ---
const setDir = (newD) => {
    if (newD == "UP" && d != "DOWN") d = "UP";
    else if (newD == "DOWN" && d != "UP") d = "DOWN";
    else if (newD == "LEFT" && d != "RIGHT") d = "LEFT";
    else if (newD == "RIGHT" && d != "LEFT") d = "RIGHT";
};

// Buton Olayları
["upBtn","downBtn","leftBtn","rightBtn"].forEach(id => {
    const el = document.getElementById(id);
    const dir = id.replace("Btn","").toUpperCase();
    el.addEventListener("touchstart", (e) => { e.preventDefault(); setDir(dir); }, {passive: false});
    el.addEventListener("mousedown", (e) => { e.preventDefault(); setDir(dir); });
});

// --- BİLDİRİM VE GÖRSEL FEEDBACK ---
function showMsg(txt, clr) {
    const n = document.getElementById("notify");
    if(!n) return;
    n.innerText = txt;
    n.style.color = clr;
    n.style.opacity = 1;
    n.style.transform = "translate(-50%, -50%) scale(1.2)";
    setTimeout(() => {
        n.style.opacity = 0;
        n.style.transform = "translate(-50%, -50%) scale(1.0)";
    }, 900);
}

// --- ANA OYUN MOTORU ---
function draw() {
    // Siyah Arka Plan (Senin İstediğin Gibi)
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yılanın Sprite Çizimi (V3.1 Mantığı)
    for(let i = 0; i < snake.length; i++) {
        // Kafa neon mavi, gövde siber yeşil
        ctx.fillStyle = (i == 0) ? "#00f3ff" : "#005f66";
        ctx.shadowBlur = (i == 0) ? 10 : 0;
        ctx.shadowColor = "#00f3ff";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }
    ctx.shadowBlur = 0; // Gölgeyi temizle

    // Yemek Çizimi
    ctx.font = "16px Arial";
    ctx.fillText(food.icon, food.x + 2, food.y + 16);

    // Özel Item Çizimi (⚡️, ⭐️, ❄️, 💠)
    if(special) {
        ctx.fillText(special.icon, special.x + 2, special.y + 16);
    }

    // Yılanın Hareketi
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if(d == "LEFT") snakeX -= box;
    if(d == "UP") snakeY -= box;
    if(d == "RIGHT") snakeX += box;
    if(d == "DOWN") snakeY += box;

    // YEMEK YEME KONTROLÜ
    if(snakeX == food.x && snakeY == food.y) {
        score += food.point;
        if(food.icon === "🍄") showMsg("+50 MANTAR!", "#00ff00");
        
        food = getRandomFood();
        
        // Puan Bazlı Hızlanma Mekaniği
        if(score % 100 == 0) { 
            speed -= 3; 
            showMsg("HIZLANDI!", "#ff003c");
            restart(); 
        }
        
        // Özel Eşya Çıkma Şansı
        if(Math.random() < 0.25) spawnSpecial();
    } else if(special && snakeX == special.x && snakeY == special.y) {
        handlePower(special.type);
        special = null;
    } else {
        snake.pop(); // Kuyruğu sil
    }

    let newHead = { x: snakeX, y: snakeY };

    // ÖLÜM ŞARTLARI
    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        showMsg("SİSTEM ÇÖKTÜ", "white");
        setTimeout(() => location.reload(), 1500);
        return;
    }

    snake.unshift(newHead);
    document.getElementById("scoreDisplay").innerText = "SKOR: " + score;
}

// --- GÜÇLENDİRİCİ YÖNETİMİ ---
function spawnSpecial() {
    const types = [
        {t: "BOLT", i: "⚡️"}, {t: "STAR", i: "⭐️"},
        {t: "SNOW", i: "❄️"}, {t: "DIAM", i: "💠"}
    ];
    const sel = types[Math.floor(Math.random() * types.length)];
    special = { 
        x: Math.floor(Math.random() * 17 + 1) * box, 
        y: Math.floor(Math.random() * 17 + 1) * box, 
        type: sel.t, 
        icon: sel.i 
    };
}

function handlePower(t) {
    if(t == "BOLT") { score += 20; speed -= 5; showMsg("⚡️ HIZLANDI", "yellow"); }
    if(t == "STAR") { score += 40; speed -= 10; showMsg("⭐️ SÜPER HIZ", "gold"); }
    if(t == "SNOW") { score += 20; speed += 5; showMsg("❄️ YAVAŞLADI", "#a5f3fc"); }
    if(t == "DIAM") { score += 10; speed += 10; showMsg("💠 KONTROL", "#2563eb"); }
    restart();
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

// --- MOTORU ÇALIŞTIR ---
function restart() { 
    clearInterval(game); 
    game = setInterval(draw, speed); 
}

restart();
