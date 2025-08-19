// Totali gol caricati/salvati separatamente
let totalGoalsA = parseInt(localStorage.getItem('totalGoalsA')) || 0;
let totalGoalsB = parseInt(localStorage.getItem('totalGoalsB')) || 0;

document.addEventListener('DOMContentLoaded', () => {
  loadPlayers('A');
  loadPlayers('B');
  updateTotalGoals();
});

/* ================= Utils ================= */
function safeId(str) {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

/* ================= Sezione GOL ================= */
function addPlayer(team) {
  const playerName = prompt("Inserisci il nome del giocatore:");
  if (!playerName) return;

  const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
  const li = document.createElement('li');
  const safe = safeId(playerName);

  li.innerHTML = `
    <span class="player-name">${playerName}</span>
    <div class="goal-controls">
      <button class="goal-button" onclick="changeGoals('${team}', 'add', '${playerName}')">+</button>
      <span class="goal-count" id="goals-${team}-${safe}">0</span>
      <button class="goal-button" onclick="changeGoals('${team}', 'subtract', '${playerName}')">-</button>
      <button class="edit-button" onclick="editPlayer('${team}', '${playerName}')">Modifica</button>
      <button class="delete-button" onclick="deletePlayer('${team}', '${playerName}')">Elimina</button>
    </div>
  `;
  playerList.appendChild(li);

  // Crea anche la voce nella lista Assist con conteggio 0
  addAssistItem(team, playerName, 0);

  savePlayers();
}

function changeGoals(team, action, playerName) {
  const safe = safeId(playerName);
  const goalCountElement = document.getElementById(`goals-${team}-${safe}`);
  if (!goalCountElement) return;

  let currentGoals = parseInt(goalCountElement.innerText) || 0;

  if (action === 'add') {
    currentGoals++;
    if (team === 'A') totalGoalsA++;
    else totalGoalsB++;
  } else if (action === 'subtract' && currentGoals > 0) {
    currentGoals--;
    if (team === 'A') totalGoalsA--;
    else totalGoalsB--;
  }

  goalCountElement.innerText = currentGoals;
  updateTotalGoals();
  savePlayers();
}

function updateTotalGoals() {
  document.getElementById('total-goals-a').innerText = totalGoalsA;
  document.getElementById('total-goals-b').innerText = totalGoalsB;
  localStorage.setItem('totalGoalsA', totalGoalsA);
  localStorage.setItem('totalGoalsB', totalGoalsB);
}

function editPlayer(team, oldName) {
  const newName = prompt("Inserisci il nuovo nome del giocatore:", oldName);
  if (!newName || newName === oldName) return;

  const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
  const playerItems = playerList.getElementsByTagName('li');

  for (let item of playerItems) {
    const playerNameElement = item.querySelector('.player-name');
    if (playerNameElement.innerText === oldName) {
      // Aggiorna nome visibile
      playerNameElement.innerText = newName;

      // Aggiorna id conteggio gol
      const goalCountElement = item.querySelector('.goal-count');
      goalCountElement.id = `goals-${team}-${safeId(newName)}`;

      // *** FIX 1: aggiorna TUTTI gli onclick di questo giocatore col nuovo nome ***
      const goalButtons = item.querySelectorAll('.goal-button'); // [+, -]
      if (goalButtons[0]) goalButtons[0].setAttribute('onclick', `changeGoals('${team}', 'add', '${newName}')`);
      if (goalButtons[1]) goalButtons[1].setAttribute('onclick', `changeGoals('${team}', 'subtract', '${newName}')`);
      const editBtn = item.querySelector('.edit-button');
      if (editBtn) editBtn.setAttribute('onclick', `editPlayer('${team}', '${newName}')`);
      const delBtn = item.querySelector('.delete-button');
      if (delBtn) delBtn.setAttribute('onclick', `deletePlayer('${team}', '${newName}')`);

      // Aggiorna anche la voce nella lista Assist (nome, id e onclick dei pulsanti)
      renameAssistItem(team, oldName, newName);

      break;
    }
  }
  savePlayers();
}

function deletePlayer(team, playerName) {
  if (!confirm(`Sei sicuro di voler eliminare ${playerName}?`)) return;

  const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
  const playerItems = playerList.getElementsByTagName('li');

  for (let item of playerItems) {
    const playerNameElement = item.querySelector('.player-name');
    if (playerNameElement.innerText === playerName) {
      // Se cancelli, rimuovi i gol di quel giocatore dal totale
      const countEl = item.querySelector('.goal-count');
      const goalsToRemove = parseInt(countEl.innerText) || 0;
      if (team === 'A') totalGoalsA = Math.max(0, totalGoalsA - goalsToRemove);
      else totalGoalsB = Math.max(0, totalGoalsB - goalsToRemove);

      playerList.removeChild(item);
      break;
    }
  }

  // Rimuovi anche dalla lista Assist
  removeAssistItem(team, playerName);

  updateTotalGoals();
  savePlayers();
}

/* ================= Sezione ASSIST ================= */
function addAssistItem(team, playerName, initialAssists = 0) {
  const assistList = document.getElementById(`assist-list-${team.toLowerCase()}`);
  const li = document.createElement('li');
  const safe = safeId(playerName);

  li.innerHTML = `
    <span class="assist-name">${playerName}</span>
    <div class="assist-controls">
      <button class="assist-button" onclick="changeAssists('${team}', 'add', '${playerName}')">+</button>
      <span class="assist-count" id="assists-${team}-${safe}">${initialAssists}</span>
      <button class="assist-button" onclick="changeAssists('${team}', 'subtract', '${playerName}')">-</button>
    </div>
  `;
  assistList.appendChild(li);
}

function renameAssistItem(team, oldName, newName) {
  const assistList = document.getElementById(`assist-list-${team.toLowerCase()}`);
  const items = assistList.getElementsByTagName('li');

  for (let item of items) {
    const nameEl = item.querySelector('.assist-name');
    if (nameEl.innerText === oldName) {
      nameEl.innerText = newName;

      // Aggiorna id conteggio assist
      const countEl = item.querySelector('.assist-count');
      countEl.id = `assists-${team}-${safeId(newName)}`;

      // *** FIX 2: aggiorna gli onclick dei pulsanti assist col nuovo nome ***
      const assistButtons = item.querySelectorAll('.assist-button'); // [+, -]
      if (assistButtons[0]) assistButtons[0].setAttribute('onclick', `changeAssists('${team}', 'add', '${newName}')`);
      if (assistButtons[1]) assistButtons[1].setAttribute('onclick', `changeAssists('${team}', 'subtract', '${newName}')`);

      break;
    }
  }
}

function removeAssistItem(team, playerName) {
  const assistList = document.getElementById(`assist-list-${team.toLowerCase()}`);
  const items = assistList.getElementsByTagName('li');

  for (let item of items) {
    const nameEl = item.querySelector('.assist-name');
    if (nameEl.innerText === playerName) {
      assistList.removeChild(item);
      break;
    }
  }
}

function changeAssists(team, action, playerName) {
  const safe = safeId(playerName);
  const assistCountElement = document.getElementById(`assists-${team}-${safe}`);
  if (!assistCountElement) return;

  let currentAssists = parseInt(assistCountElement.innerText) || 0;

  if (action === 'add') {
    currentAssists++;
  } else if (action === 'subtract' && currentAssists > 0) {
    currentAssists--;
  }

  assistCountElement.innerText = currentAssists;
  savePlayers();
}

/* ================= Storage & Render ================= */
function loadPlayers(team) {
  const players = JSON.parse(localStorage.getItem(`players${team}`)) || [];
  const playerList = document.getElementById(`player-list-${team.toLowerCase()}`);
  const assistList = document.getElementById(`assist-list-${team.toLowerCase()}`);

  // Pulisci e ricostruisci
  playerList.innerHTML = '';
  assistList.innerHTML = '';

  players.forEach(player => {
    const name = player.name;
    const safe = safeId(name);
    const goals = Number.isFinite(player.goals) ? player.goals : 0;
    const assists = Number.isFinite(player.assists) ? player.assists : 0;

    // GOL
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="player-name">${name}</span>
      <div class="goal-controls">
        <button class="goal-button" onclick="changeGoals('${team}', 'add', '${name}')">+</button>
        <span class="goal-count" id="goals-${team}-${safe}">${goals}</span>
        <button class="goal-button" onclick="changeGoals('${team}', 'subtract', '${name}')">-</button>
        <button class="edit-button" onclick="editPlayer('${team}', '${name}')">Modifica</button>
        <button class="delete-button" onclick="deletePlayer('${team}', '${name}')">Elimina</button>
      </div>
    `;
    playerList.appendChild(li);

    // ASSIST
    addAssistItem(team, name, assists);
  });
}

function savePlayers() {
  const playersA = [];
  const playersB = [];

  // Mappa assist per nome (A e B)
  function readAssistsMap(team) {
    const map = {};
    const list = document.getElementById(`assist-list-${team.toLowerCase()}`);
    const items = list.getElementsByTagName('li');
    for (let item of items) {
      const nameEl = item.querySelector('.assist-name');
      const countEl = item.querySelector('.assist-count');
      map[nameEl.innerText] = parseInt(countEl.innerText) || 0;
    }
    return map;
  }
  const assistsA = readAssistsMap('A');
  const assistsB = readAssistsMap('B');

  // Leggi dai pannelli GOL
  function readPlayers(team) {
    const arr = [];
    const list = document.getElementById(`player-list-${team.toLowerCase()}`);
    const items = list.getElementsByTagName('li');
    for (let item of items) {
      const nameEl = item.querySelector('.player-name');
      const goalEl = item.querySelector('.goal-count');
      const name = nameEl.innerText;
      arr.push({
        name,
        goals: parseInt(goalEl.innerText) || 0,
        assists: (team === 'A' ? assistsA[name] : assistsB[name]) || 0,
      });
    }
    return arr;
  }

  const arrA = readPlayers('A');
  const arrB = readPlayers('B');

  localStorage.setItem('playersA', JSON.stringify(arrA));
  localStorage.setItem('playersB', JSON.stringify(arrB));
  // Salva anche i totali gol
  localStorage.setItem('totalGoalsA', totalGoalsA);
  localStorage.setItem('totalGoalsB', totalGoalsB);
}

/* ================= Extra: inverti colori (come avevi) ================= */
function invertColors() {
  const scoreBoxA = document.getElementById('score-box-a');
  const scoreBoxB = document.getElementById('score-box-b');

  const currentColorA = scoreBoxA.classList.contains('red-bg') ? 'red' : 'blue';
  const currentColorB = scoreBoxB.classList.contains('blue-bg') ? 'blue' : 'red';

  scoreBoxA.classList.toggle('red-bg', currentColorA === 'blue');
  scoreBoxA.classList.toggle('blue-bg', currentColorA === 'red');
  scoreBoxB.classList.toggle('red-bg', currentColorB === 'blue');
  scoreBoxB.classList.toggle('blue-bg', currentColorB === 'red');

  const totalGoalsAEl = document.getElementById('total-goals-a');
  const totalGoalsBEl = document.getElementById('total-goals-b');
  totalGoalsAEl.classList.toggle('white', currentColorA === 'blue');
  totalGoalsBEl.classList.toggle('white', currentColorB === 'red');
}
