// script.js

let totalGoalsA = parseInt(localStorage.getItem('totalGoalsA')) || 0;
let totalGoalsB = parseInt(localStorage.getItem('totalGoalsB')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    loadPlayers('A');
    loadPlayers('B');
    updateTotalGoals();
});

function addPlayer(team) {
    const playerName = prompt("Inserisci il nome del giocatore:");
    if (playerName) {
        const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="player-name">${playerName}</span>
            <div class="goal-controls">
                <button class="goal-button" onclick="changeGoals('${team}', 'add', '${playerName}')">+</button>
                <span class="goal-count" id="goals-${team}-${playerName}">0</span>
                <button class="goal-button" onclick="changeGoals('${team}', 'subtract', '${playerName}')">-</button>
                <button class="edit-button" onclick="editPlayer('${team}', '${playerName}')">Modifica</button>
                <button class="delete-button" onclick="deletePlayer('${team}', '${playerName}')">Elimina</button>
            </div>
        `;
        playerList.appendChild(li);
        savePlayers();
    }
}

function changeGoals(team, action, playerName) {
    const goalCountElement = document.getElementById(`goals-${team}-${playerName}`);
    let currentGoals = parseInt(goalCountElement.innerText);
    
    if (action === 'add') {
        currentGoals++;
        if (team === 'A') {
            totalGoalsA++;
        } else {
            totalGoalsB++;
        }
    } else if (action === 'subtract' && currentGoals > 0) {
        currentGoals--;
        if (team === 'A') {
            totalGoalsA--;
        } else {
            totalGoalsB--;
        }
    }

    goalCountElement.innerText = currentGoals;
    updateTotalGoals();
    savePlayers();
}

function updateTotalGoals() {
    document.getElementById('total-goals-a').innerText = totalGoalsA;
    document.getElementById('total-goals-b').innerText = totalGoalsB;

    // Salva il totale nel Local Storage
    localStorage.setItem('totalGoalsA', totalGoalsA);
    localStorage.setItem('totalGoalsB', totalGoalsB);
}

function editPlayer(team, oldName) {
    const newName = prompt("Inserisci il nuovo nome del giocatore:", oldName);
    if (newName) {
        const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
        const playerItems = playerList.getElementsByTagName('li');

        for (let item of playerItems) {
            const playerNameElement = item.querySelector('.player-name');
            if (playerNameElement.innerText === oldName) {
                playerNameElement.innerText = newName;

                // Aggiorna l'ID del conteggio gol
                const goalCountElement = item.querySelector('.goal-count');
                goalCountElement.id = `goals-${team}-${newName}`;
                break;
            }
        }
        savePlayers();
    }
}

function deletePlayer(team, playerName) {
    if (confirm(`Sei sicuro di voler eliminare ${playerName}?`)) {
        const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
        const playerItems = playerList.getElementsByTagName('li');

        for (let item of playerItems) {
            const playerNameElement = item.querySelector('.player-name');
            if (playerNameElement.innerText === playerName) {
                playerList.removeChild(item);
                break;
            }
        }
        savePlayers();
    }
}

function invertColors() {
    const scoreBoxA = document.getElementById('score-box-a');
    const scoreBoxB = document.getElementById('score-box-b');

    // Inverti i colori di sfondo
    const currentColorA = scoreBoxA.classList.contains('red-bg') ? 'red' : 'blue';
    const currentColorB = scoreBoxB.classList.contains('blue-bg') ? 'blue' : 'red';

    scoreBoxA.classList.toggle('red-bg', currentColorA === 'blue');
    scoreBoxA.classList.toggle('blue-bg', currentColorA === 'red');
    scoreBoxB.classList.toggle('red-bg', currentColorB === 'blue');
    scoreBoxB.classList.toggle('blue-bg', currentColorB === 'red');

    // Aggiorna i colori dei numeri
    const totalGoalsA = document.getElementById('total-goals-a');
    const totalGoalsB = document.getElementById('total-goals-b');
    totalGoalsA.classList.toggle('white', currentColorA === 'blue');
    totalGoalsB.classList.toggle('white', currentColorB === 'red');
}

function loadPlayers(team) {
    const players = JSON.parse(localStorage.getItem(`players${team}`)) || [];
    const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);

    players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="player-name">${player.name}</span>
            <div class="goal-controls">
                <button class="goal-button" onclick="changeGoals('${team}', 'add', '${player.name}')">+</button>
                <span class="goal-count" id="goals-${team}-${player.name}">${player.goals}</span>
                <button class="goal-button" onclick="changeGoals('${team}', 'subtract', '${player.name}')">-</button>
                <button class="edit-button" onclick="editPlayer('${team}', '${player.name}')">Modifica</button>
                <button class="delete-button" onclick="deletePlayer('${team}', '${player.name}')">Elimina</button>
            </div>
        `;
        playerList.appendChild(li);
        document.getElementById(`goals-${team}-${player.name}`).innerText = player.goals;
    });
}

function savePlayers() {
    const playersA = [];
    const playersB = [];
    const playerItemsA = document.getElementById('player-list-a').getElementsByTagName('li');
    const playerItemsB = document.getElementById('player-list-b').getElementsByTagName('li');

    for (let item of playerItemsA) {
        const playerNameElement = item.querySelector('.player-name');
        const goalCountElement = item.querySelector('.goal-count');
        playersA.push({ name: playerNameElement.innerText, goals: parseInt(goalCountElement.innerText) });
    }

    for (let item of playerItemsB) {
        const playerNameElement = item.querySelector('.player-name');
        const goalCountElement = item.querySelector('.goal-count');
        playersB.push({ name: playerNameElement.innerText, goals: parseInt(goalCountElement.innerText) });
    }

    localStorage.setItem('playersA', JSON.stringify(playersA));
    localStorage.setItem('playersB', JSON.stringify(playersB));
}
