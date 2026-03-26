// Game State
let score = 0;
let fishCount = 0;
let isFishing = false;
let isReeling = false;
let reelProgress = 0;
let currentFish = null;
let reelInterval = null;
let biteTimeout = null;

// Rod System
let currentRod = "basic";
const rods = {
    basic: { name: "Basic Rod", bonus: 0, price: 0 },
    steel: { name: "Steel Rod", bonus: 10, price: 500 },
    carbon: { name: "Carbon Rod", bonus: 20, price: 1500 },
    master: { name: "Master Rod", bonus: 30, price: 5000 }
};

// Location
let currentLocation = "pond";

// Fish Collection (Bestiary)
let caughtFish = {};

// Fish Species by Rarity
const fishByRarity = {
    normal: [
        { name: "Minnow", weight: 1, value: 10, difficulty: 0.6, rarity: "normal", locations: ["pond", "river", "lake"] },
        { name: "Perch", weight: 2, value: 20, difficulty: 0.8, rarity: "normal", locations: ["pond", "river"] },
        { name: "Bluegill", weight: 1.5, value: 15, difficulty: 0.7, rarity: "normal", locations: ["pond", "river"] },
        { name: "Sunfish", weight: 1.2, value: 12, difficulty: 0.65, rarity: "normal", locations: ["pond"] }
    ],
    uncommon: [
        { name: "Bass", weight: 5, value: 50, difficulty: 1.0, rarity: "uncommon", locations: ["river", "lake"] },
        { name: "Trout", weight: 8, value: 80, difficulty: 1.3, rarity: "uncommon", locations: ["river", "lake"] },
        { name: "Walleye", weight: 6, value: 60, difficulty: 1.2, rarity: "uncommon", locations: ["lake"] },
        { name: "Crappie", weight: 3, value: 30, difficulty: 0.9, rarity: "uncommon", locations: ["pond", "lake"] }
    ],
    legendary: [
        { name: "Catfish", weight: 12, value: 120, difficulty: 1.6, rarity: "legendary", locations: ["river", "lake"] },
        { name: "Muskie", weight: 20, value: 200, difficulty: 2.0, rarity: "legendary", locations: ["lake"] },
        { name: "Pike", weight: 15, value: 150, difficulty: 1.8, rarity: "legendary", locations: ["river", "lake"] }
    ],
    mythic: [
        { name: "Sturgeon", weight: 35, value: 350, difficulty: 2.3, rarity: "mythic", locations: ["lake"] },
        { name: "Arapaima", weight: 45, value: 450, difficulty: 2.6, rarity: "mythic", locations: ["river"] },
        { name: "Goliath Tigerfish", weight: 40, value: 400, difficulty: 2.5, rarity: "mythic", locations: ["lake"] }
    ],
    exotic: [
        { name: "Golden Dorado", weight: 28, value: 560, difficulty: 2.8, rarity: "exotic", locations: ["river"] },
        { name: "Peacock Bass", weight: 25, value: 500, difficulty: 2.7, rarity: "exotic", locations: ["lake"] },
        { name: "Taimen", weight: 55, value: 550, difficulty: 3.0, rarity: "exotic", locations: ["river"] }
    ],
    secret: [
        { name: "Ancient Coelacanth", weight: 80, value: 800, difficulty: 3.5, rarity: "secret", locations: ["lake"] },
        { name: "Abyssal Serpent", weight: 100, value: 1000, difficulty: 4.0, rarity: "secret", locations: ["river"] },
        { name: "Starlight Eel", weight: 60, value: 1200, difficulty: 3.8, rarity: "secret", locations: ["pond"] }
    ]
};

// Get all fish
function getAllFish() {
    let all = [];
    for (let rarity in fishByRarity) {
        all = all.concat(fishByRarity[rarity]);
    }
    return all;
}

// Get fish based on location and rarity
function getRandomFish() {
    let availableFish = [];
    let rodBonus = rods[currentRod].bonus;
    
    // Rarity chances (modified by rod bonus)
    let normalChance = 0.50 + (rodBonus / 100);
    let uncommonChance = 0.25;
    let legendaryChance = 0.12;
    let mythicChance = 0.08;
    let exoticChance = 0.04;
    let secretChance = 0.01;
    
    let rand = Math.random();
    let selectedRarity = null;
    
    if (rand < secretChance) selectedRarity = "secret";
    else if (rand < secretChance + exoticChance) selectedRarity = "exotic";
    else if (rand < secretChance + exoticChance + mythicChance) selectedRarity = "mythic";
    else if (rand < secretChance + exoticChance + mythicChance + legendaryChance) selectedRarity = "legendary";
    else if (rand < secretChance + exoticChance + mythicChance + legendaryChance + uncommonChance) selectedRarity = "uncommon";
    else selectedRarity = "normal";
    
    // Filter by location
    let pool = fishByRarity[selectedRarity].filter(fish => fish.locations.includes(currentLocation));
    
    if (pool.length === 0) {
        // Fallback to normal fish
        pool = fishByRarity.normal.filter(fish => fish.locations.includes(currentLocation));
    }
    
    return pool[Math.floor(Math.random() * pool.length)];
}

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
const locationSelect = document.getElementById('locationSelect');
const rodNameSpan = document.getElementById('rodName');
const catchBonusSpan = document.getElementById('catchBonus');
const shopPointsSpan = document.getElementById('shopPoints');

// Bobber position
let bobberX = canvas.width / 2;
let bobberY = 50;
let bobberSplash = false;
let animationId = null;

// Tab switching
document.getElementById('fishingTabBtn').addEventListener('click', () => switchTab('fishing'));
document.getElementById('shopTabBtn').addEventListener('click', () => switchTab('shop'));
document.getElementById('bestiaryTabBtn').addEventListener('click', () => switchTab('bestiary'));

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'fishing') {
        document.getElementById('fishingTabBtn').classList.add('active');
        document.getElementById('fishingTab').classList.add('active');
    } else if (tab === 'shop') {
        document.getElementById('shopTabBtn').classList.add('active');
        document.getElementById('shopTab').classList.add('active');
        updateShopUI();
    } else if (tab === 'bestiary') {
        document.getElementById('bestiaryTabBtn').classList.add('active');
        document.getElementById('bestiaryTab').classList.add('active');
        updateBestiaryUI();
    }
}

// Update Shop UI
function updateShopUI() {
    shopPointsSpan.textContent = score;
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        const rod = item.getAttribute('data-rod');
        const btn = item.querySelector('.buy-btn');
        if (rod === currentRod) {
            btn.textContent = 'EQUIPPED';
            btn.disabled = true;
        } else {
            btn.textContent = 'BUY';
            btn.disabled = score < rods[rod].price;
        }
    });
}

// Buy Rod
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const rod = e.target.getAttribute('data-rod');
        if (rod !== currentRod && score >= rods[rod].price) {
            score -= rods[rod].price;
            currentRod = rod;
            updateScore();
            rodNameSpan.textContent = rods[currentRod].name;
            catchBonusSpan.textContent = rods[currentRod].bonus;
            updateShopUI();
            addLogEntry(`Bought ${rods[currentRod].name}! +${rods[currentRod].bonus}% catch bonus.`);
        }
    });
});

// Update Bestiary UI
function updateBestiaryUI() {
    const allFish = getAllFish();
    const caughtCount = allFish.filter(fish => caughtFish[fish.name]).length;
    document.getElementById('bestiaryCaught').textContent = caughtCount;
    document.getElementById('bestiaryTotal').textContent = allFish.length;
    
    const grid = document.getElementById('bestiaryGrid');
    grid.innerHTML = '';
    
    allFish.forEach(fish => {
        const isCaught = caughtFish[fish.name];
        const card = document.createElement('div');
        card.className = `bestiary-card ${isCaught ? 'caught' : 'not-caught'}`;
        card.innerHTML = `
            <h4>${isCaught ? fish.name : '???'}</h4>
            ${isCaught ? `<div class="rarity rarity-${fish.rarity}">${fish.rarity.toUpperCase()}</div>` : '<div class="rarity">????</div>'}
            ${isCaught ? `<p class="weight">Weight: ${fish.weight} lbs</p>` : '<p>???</p>'}
            ${isCaught ? `<p>Value: ${fish.value} pts</p>` : '<p>Not discovered</p>'}
        `;
        grid.appendChild(card);
    });
}

// Add fish to bestiary
function addToBestiary(fish) {
    if (!caughtFish[fish.name]) {
        caughtFish[fish.name] = true;
        addLogEntry(`NEW DISCOVERY! ${fish.name} added to bestiary!`);
        updateBestiaryUI();
    }
}

// Location change
locationSelect.addEventListener('change', (e) => {
    currentLocation = e.target.value;
    addLogEntry(`Moved to ${currentLocation.toUpperCase()}!`);
});

// Draw functions
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#3a7ca5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    
    if (!isFishing) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(150 + i * 200, 200 + Math.sin(Date.now() * 0.002 + i) * 10, 20, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.beginPath();
    ctx.arc(bobberX, bobberY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#e63946";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(bobberX - 2, bobberY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(bobberX, bobberY);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (bobberSplash) {
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
    }
}

function animateBobber() {
    if (isFishing && !isReeling) {
        bobberY = 50 + Math.sin(Date.now() * 0.008) * 3;
        if (currentFish === null && Math.random() < 0.005) {
            bite();
        }
    } else if (!isFishing) {
        bobberY = 50 + Math.sin(Date.now() * 0.005) * 2;
    }
    draw();
    animationId = requestAnimationFrame(animateBobber);
}

function bite() {
    let fish = getRandomFish();
    currentFish = fish;
    
    messageP.textContent = `BITE! A ${fish.name} (${fish.rarity.toUpperCase()}) is on the line! Click REEL IN!`;
    messageP.style.color = "#e67e22";
    
    reelBtn.disabled = false;
    castBtn.disabled = true;
    
    bobberSplash = true;
    setTimeout(() => { bobberSplash = false; }, 300);
}

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
    
    let bonus = rods[currentRod].bonus;
    let finalValue = currentFish.value;
    
    score += finalValue;
    fishCount++;
    updateScore();
    
    addToBestiary(currentFish);
    
    addLogEntry(`Caught ${currentFish.name} (${currentFish.rarity}) - ${currentFish.weight} lbs +${finalValue} pts!`);
    messageP.textContent = `CAUGHT! ${currentFish.name} (${currentFish.rarity}) +${finalValue} points!`;
    messageP.style.color = "#1e6f5c";
    
    resetFishing();
}

function fishEscapes() {
    clearInterval(reelInterval);
    
    messageP.textContent = `The ${currentFish.name} got away! Try again!`;
    messageP.style.color = "#c0392b";
    
    addLogEntry(`${currentFish.name} ESCAPED!`);
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

function updateScore() {
    scoreSpan.textContent = score;
    fishCountSpan.textContent = fishCount;
    if (document.getElementById('shopTab').classList.contains('active')) {
        updateShopUI();
    }
}

function addLogEntry(text) {
    const logItem = document.createElement('li');
    const time = new Date().toLocaleTimeString();
    logItem.textContent = `${time} - ${text}`;
    catchLog.prepend(logItem);
    
    while (catchLog.children.length > 50) {
        catchLog.removeChild(catchLog.lastChild);
    }
}

// Event listeners
castBtn.addEventListener('click', castLine);
reelBtn.addEventListener('click', () => {
    if (currentFish && !isReeling) {
        startReeling();
    }
});

// Initialize
animateBobber();
updateBestiaryUI();
