// Game State
let score = 0;
let fishCount = 0;
let isFishing = false;
let isReeling = false;
let reelProgress = 0;
let currentFish = null;
let reelInterval = null;
let biteTimeout = null;

// Fish species
const fishSpecies = [
    { name: "Minnow", weight: 1, value: 10, difficulty: 0.6, color: "#a5d6a5" },
    { name: "Perch", weight: 2, value: 20, difficulty: 0.8, color: "#ffb74d" },
    { name: "Bass", weight: 5, value: 50, difficulty: 1.0, color: "#81c784" },
    { name: "Trout", weight: 8, value: 80, difficulty: 1.3, color: "#ff8a65" },
    { name: "Catfish", weight: 12, value: 120, difficulty: 1.6, color: "#a1887f" },
    { name: "Muskie", weight: 20, value: 200, difficulty: 2.0, color: "#ba68c8" },
    { name: "Legendary Koi", weight: 50, value: 500, difficulty: 2.5, color: "#ffd966" }
];

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const castBtn = document.getElementById('castBtn');
const reelBtn = document.getElementById('reelBtn');
const scoreSpan = document.getElementById('score');
const fishCountSpan = document.getElementById('fishCount');
const messageP = document.getElementById('message');
const reelBar = document.getElementById('reelBar');
const catchLog = document.getElementById('catchLog');

// Bobber position
let bobberX = canvas.width / 2;
let bobberY = 50;
let bobberSplash = false;

// Animation frame
let animationId = null;

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw water
    ctx.fillStyle = "#3a7ca5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw water surface waves
    ctx.beginPath();
    ctx.moveTo(0, 80);
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.lineTo(x, 80 + Math.sin(x * 0.02 + Date.now() * 0.005) * 3);
    }
    ctx.lineTo(canvas.width, 100);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, 0);
    ctx.fillStyle = "#6ab0de";
    ctx.fill();
    
    // Draw fish shadows if not fishing
    if (!isFishing) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(150 + i * 200, 200 + Math.sin(Date.now() * 0.002 + i) * 10, 20, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw bobber
    ctx.beginPath();
    ctx.arc(bobberX, bobberY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#e63946";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(bobberX - 2, bobberY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw fishing line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(bobberX, bobberY);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Splash effect
    if (bobberSplash) {
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
    }
}

// Update bobber animation
function animateBobber() {
    if (isFishing && !isReeling) {
        // Bobber bobbing
        bobberY = 50 + Math.sin(Date.now() * 0.008) * 3;
        
        // Random bite chance when fishing
        if (currentFish === null && Math.random() < 0.005) {
            bite();
        }
    } else if (!isFishing) {
        bobberY = 50 + Math.sin(Date.now() * 0.005) * 2;
    }
    
    draw();
    animationId = requestAnimationFrame(animateBobber);
}

// Fish bites
function bite() {
    let fish = fishSpecies[Math.floor(Math.random() * fishSpecies.length)];
    currentFish = fish;
    
    messageP.textContent = `BITE! A ${fish.name} is on the line! Click REEL IN!`;
    messageP.style.color = "#e67e22";
    messageP.style.fontSize = "1.1rem";
    
    reelBtn.disabled = false;
    castBtn.disabled = true;
    
    bobberSplash = true;
    setTimeout(() => { bobberSplash = false; }, 300);
}

// Reel in fish
function startReeling() {
    if (!currentFish) return;
    
    isReeling = true;
    reelProgress = 0;
    reelBar.style.width = "0%";
    
    const reelSpeed = 1 / currentFish.difficulty;
    let tension = 0;
    
    reelInterval = setInterval(() => {
        if (!isReeling) return;
        
        tension += Math.random() * 8;
        reelProgress += reelSpeed * (1 + Math.random() * 0.5);
        
        if (tension > 100) {
            fishEscapes();
            return;
        }
        
        let percent = Math.min(100, (reelProgress / 100) * 100);
        reelBar.style.width = percent + "%";
        
        if (reelProgress >= 100) {
            fishCaught();
        }
    }, 50);
}

function fishCaught() {
    clearInterval(reelInterval);
    
    score += currentFish.value;
    fishCount++;
    scoreSpan.textContent = score;
    fishCountSpan.textContent = fishCount;
    
    const logItem = document.createElement('li');
    const time = new Date().toLocaleTimeString();
    logItem.textContent = `${time} - Caught ${currentFish.name} (${currentFish.weight} lbs) +${currentFish.value} pts!`;
    catchLog.prepend(logItem);
    
    messageP.textContent = `CAUGHT! ${currentFish.name} (${currentFish.weight} lbs) +${currentFish.value} points!`;
    messageP.style.color = "#1e6f5c";
    
    resetFishing();
}

function fishEscapes() {
    clearInterval(reelInterval);
    
    messageP.textContent = `The ${currentFish.name} got away! Try again!`;
    messageP.style.color = "#c0392b";
    
    const logItem = document.createElement('li');
    const time = new Date().toLocaleTimeString();
    logItem.textContent = `${time} - ${currentFish.name} ESCAPED!`;
    logItem.style.color = "#c0392b";
    catchLog.prepend(logItem);
    
    resetFishing();
}

function resetFishing() {
    isFishing = false;
    isReeling = false;
    currentFish = null;
    reelProgress = 0;
    reelBar.style.width = "0%";
    reelBtn.disabled = true;
    castBtn.disabled = false;
    
    if (reelInterval) clearInterval(reelInterval);
    if (biteTimeout) clearTimeout(biteTimeout);
}

// Cast line
function castLine() {
    if (isFishing) return;
    
    isFishing = true;
    currentFish = null;
    messageP.textContent = "Line cast! Waiting for a bite...";
    messageP.style.color = "#2e86c1";
    reelBtn.disabled = true;
    castBtn.disabled = true;
    
    bobberSplash = true;
    setTimeout(() => { bobberSplash = false; }, 500);
    
    biteTimeout = setTimeout(() => {
        if (isFishing && !currentFish) {
            messageP.textContent = "No bites... Cast again!";
            messageP.style.color = "#888";
            resetFishing();
        }
    }, 15000);
}

// Event listeners
castBtn.addEventListener('click', castLine);
reelBtn.addEventListener('click', () => {
    if (currentFish && !isReeling) {
        startReeling();
    }
});

// Start animation
animateBobber();
