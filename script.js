* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0b3b5f, #1b4f72);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 1000px;
    width: 100%;
}

h1 {
    text-align: center;
    color: #1e6f5c;
    margin-bottom: 20px;
}

.score-board {
    display: flex;
    justify-content: space-around;
    background: #289672;
    color: white;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: bold;
}

.game-area {
    text-align: center;
}

canvas {
    background: linear-gradient(180deg, #6ab0de 0%, #3a7ca5 30%, #2c5a7a 60%, #1e3a4d 100%);
    border-radius: 15px;
    border: 3px solid #d4a373;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}

.controls {
    margin: 15px 0;
    display: flex;
    gap: 20px;
    justify-content: center;
}

button {
    padding: 12px 30px;
    font-size: 1.1rem;
    font-weight: bold;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
}

button:hover:not(:disabled) {
    transform: scale(1.05);
}

#castBtn {
    background: #2e86c1;
    color: white;
    box-shadow: 0 4px 0 #1a5276;
}

#castBtn:hover:not(:disabled) {
    background: #1f618d;
}

#reelBtn {
    background: #e67e22;
    color: white;
    box-shadow: 0 4px 0 #b45f1b;
}

#reelBtn:hover:not(:disabled) {
    background: #d35400;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reel-bar-container {
    width: 80%;
    height: 20px;
    background: #ddd;
    border-radius: 10px;
    margin: 15px auto;
    overflow: hidden;
    border: 1px solid #888;
}

#reelBar {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #f1c40f, #e67e22);
    transition: width 0.05s linear;
    border-radius: 10px;
}

.message-area {
    margin: 15px 0;
    padding: 10px;
    background: #f4f4f4;
    border-radius: 10px;
    font-weight: bold;
    color: #1e6f5c;
}

.fish-log {
    margin-top: 20px;
    padding: 10px;
    background: #fff3e0;
    border-radius: 10px;
    max-height: 200px;
    overflow-y: auto;
}

.fish-log h3 {
    color: #d4a373;
    margin-bottom: 10px;
}

#catchLog {
    list-style: none;
    padding-left: 0;
}

#catchLog li {
    padding: 5px;
    border-bottom: 1px solid #ddd;
    font-size: 0.9rem;
}
