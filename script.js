const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const box = 20;
canvas.width = 380; canvas.height = 380;

let score = 0;
let speed = 120;
let dir = "RIGHT";
let snake = [{x: 10*box, y: 10*box}];
let highScore = localStorage.getItem("efe_rekor") || 0;
let gameLoop;

// SPRITE YÜKLEME (Yılan ve Yemekler)
const spriteImg = new Image();
spriteImg.src = "snake_sprites.png"; // Bu dosyanın var olması gerekir

const items = [
    {i:"🍎",p:5},{i:"🍐",p:5},{i:"🍊",p:10},{i:"🍋",p:10},{i:"🍌",p:15},
    {i:"🍉",p:15},{i:"🍇",p:20},{i:"🍓",p:20},{i:"🫐",p:25},{i:"🍈",p:25},
    {i:"🍒",p:30},{i:"🍑",p:30},{i:"🍍",p:40},{i:"🥝",p:40},{i:"🍄",p:50}
];

let food = spawnFood();

function spawnFood() {
    return { x: Math.floor(Math.random()*18+1)*box, y: Math.floor(Math.random()*18+1)*box, ...items[Math.floor(Math.random()*items.length)] };
}

// SES MOTORU (CEZA 2)
function playHit() {
    const osc = new AudioContext().createOscillator();
    const g = new AudioContext().createGain();
    osc.connect(g); g.connect(new AudioContext().destination);
    osc.frequency.value = 440; g.gain.exponentialRampToValueAtTime(0.0001, new AudioContext().currentTime + 0.1);
    osc.start(); osc.stop(new AudioContext().currentTime + 0.1);
}

// KONTROLLER & SWIPE
document.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
document.addEventListener("touchend", e => { if(e.changedTouches[0].clientX - startX > 100) toggleMenu(); });

const setDir = (d) => {
    if(d=="UP" && dir!="DOWN") dir="UP"; if(d=="DOWN" && dir!="UP") dir="DOWN";
    if(d=="LEFT" && dir!="RIGHT") dir="LEFT"; if(d=="RIGHT" && dir!="LEFT") dir="RIGHT";
};

["up","down","left","right"].forEach(id => document.getElementById(id).onclick = () => setDir(id.toUpperCase()));

function draw() {
    ctx.clearRect(0,0,380,380);
    
    // YILAN ÇİZİMİ (Spriteli)
    snake.forEach((p, i) => {
        ctx.fillStyle = i==0 ? "#00f3ff" : "#005f66";
        ctx.fillRect(p.x, p.y, box, box);
        if(i==0 && score > 100) ctx.fillText("👑", p.x, p.y - 5);
    });

    // YEMEK
    ctx.font = "18px Arial";
    ctx.fillText(food.i, food.x, food.y + 18);

    let head = {x: snake[0].x, y: snake[0].y};
    if(dir=="UP") head.y -= box; if(dir=="DOWN") head.y += box;
    if(dir=="LEFT") head.x -= box; if(dir=="RIGHT") head.x += box;

    if(head.x == food.x && head.y == food.y) {
        score += food.p;
        playHit();
        food = spawnFood();
        if(score > highScore) { highScore = score; localStorage.setItem("efe_rekor", highScore); }
    } else { snake.pop(); }

    if(head.x<0 || head.x>=380 || head.y<0 || head.y>=380 || snake.some(p=>p.x==head.x && p.y==head.y)) {
        location.reload();
    }
    snake.unshift(head);
    document.getElementById("score-label").innerText = t('score') + ": " + score;
    document.getElementById("high-score-label").innerText = t('highScore') + ": " + highScore;
}

function toggleMenu() { document.getElementById("side-menu").classList.toggle("open"); }
function start() { clearInterval(gameLoop); gameLoop = setInterval(draw, speed); }
start();
