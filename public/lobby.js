const socket = io();

const name = localStorage.getItem("name");
const code = localStorage.getItem("roomCode");
const roomName = localStorage.getItem("roomName");
const emoji = localStorage.getItem("emoji");

document.getElementById("lobbyName").innerText = roomName;
document.getElementById("roomCode").innerText = code;

socket.on("connect", () => {
  socket.emit("joinRoom", {
    playerName: name,
    code: code,
    emoji: emoji
  });
});

document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(code);
};

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");

let savedSettings = {
  maxPlayers: 8,
  timer: 30,
  totalRounds: 10,
  wordsPerRound: 3,
  mrWhite: false,
  mrBlack: false
};

function restoreSettings() {
  document.getElementById("maxPlayers").value = savedSettings.maxPlayers;
  document.getElementById("timer").value = savedSettings.timer;
  document.getElementById("totalRounds").value = savedSettings.totalRounds;
  document.getElementById("wordsPerRound").value = savedSettings.wordsPerRound;
  document.getElementById("mrWhite").checked = savedSettings.mrWhite;
  document.getElementById("mrBlack").checked = savedSettings.mrBlack;
}

settingsBtn.onclick = () => {
  if (settingsPanel.style.display === "block") {
    restoreSettings();
    settingsPanel.style.display = "none";
  } else {
    settingsPanel.style.display = "block";
  }
};

document.getElementById("closeSettings").onclick = () => {
  restoreSettings();
  settingsPanel.style.display = "none";
};

document.getElementById("saveSettings").onclick = () => {
  savedSettings = {
    maxPlayers: parseInt(document.getElementById("maxPlayers").value),
    timer: parseInt(document.getElementById("timer").value),
    totalRounds: parseInt(document.getElementById("totalRounds").value),
    wordsPerRound: parseInt(document.getElementById("wordsPerRound").value),
    mrWhite: document.getElementById("mrWhite").checked,
    mrBlack: document.getElementById("mrBlack").checked,
  };
  socket.emit("updateSettings", { code, settings: savedSettings });
  settingsPanel.style.display = "none";
};

const startBtn = document.getElementById("startBtn");

startBtn.onclick = () => {
  if (startBtn.disabled) return;
  socket.emit("startGame");
};

socket.on("updateLobby", (players) => {

  const zone = document.getElementById("playersZone");
  zone.innerHTML = "";

  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "player-card";
    if (p.name === name) div.classList.add("me");
    div.innerHTML = `
      <span>${p.emoji}</span>
      <p>
        ${p.name}
        ${p.host ? "<span class='host-dot'>👑</span>" : ""}
      </p>
    `;
    zone.appendChild(div);
  });

  const me = players.find(p => p.name === name);
  const msg = document.getElementById("minPlayersMsg");

  // 🔥 message minimum 3 joueurs
  if (players.length >= 3) {
    if (msg) msg.style.display = "none";
  } else {
    if (msg) msg.style.display = "block";
  }

  // 🔥 engrenage uniquement pour le host
  if (me && me.host) {
    settingsBtn.style.display = "flex";
  } else {
    settingsBtn.style.display = "none";
  }

  // 🔥 bouton start
  if (me && me.host && players.length >= 3) {
    startBtn.className = "btn red big-action";
    startBtn.disabled = false;
  } else {
    startBtn.className = "btn big-action disabled-btn";
    startBtn.disabled = true;
  }

  // 🔥 Mr. White et Mr. Black — désactiver si moins de 6 joueurs
  const mrWhiteCheck = document.getElementById("mrWhite");
  const mrBlackCheck = document.getElementById("mrBlack");
  const mrWhiteRow = document.getElementById("mrWhiteRow");
  const mrBlackRow = document.getElementById("mrBlackRow");
  const mrMinMsg = document.getElementById("mrMinMsg");

  if (players.length < 6) {
    if (mrWhiteCheck) { mrWhiteCheck.disabled = true; mrWhiteCheck.checked = false; }
    if (mrBlackCheck) { mrBlackCheck.disabled = true; mrBlackCheck.checked = false; }
    if (mrWhiteRow) mrWhiteRow.style.opacity = "0.4";
    if (mrBlackRow) mrBlackRow.style.opacity = "0.4";
    if (mrMinMsg) mrMinMsg.style.display = "block";
  } else {
    if (mrWhiteCheck) mrWhiteCheck.disabled = false;
    if (mrBlackCheck) mrBlackCheck.disabled = false;
    if (mrWhiteRow) mrWhiteRow.style.opacity = "1";
    if (mrBlackRow) mrBlackRow.style.opacity = "1";
    if (mrMinMsg) mrMinMsg.style.display = "none";
  }
});

socket.on("settingsUpdated", (settings) => {
  savedSettings = {
    maxPlayers: settings.maxPlayers,
    timer: settings.timer,
    totalRounds: settings.totalRounds,
    wordsPerRound: settings.wordsPerRound,
    mrWhite: settings.mrWhite,
    mrBlack: settings.mrBlack,
  };
  restoreSettings();
});

socket.on("countdown", (num) => {
  const zone = document.getElementById("playersZone");
  zone.innerHTML = `
    <h1 style="font-size:70px; color:white;">${num}</h1>
  `;
});

socket.on("startCountdown", (data) => {
  localStorage.setItem("word", data.word);
  localStorage.setItem("role", data.role);
  localStorage.setItem("players", JSON.stringify(data.players));
  localStorage.setItem("timer", data.timer);
  localStorage.setItem("wordsPerRound", data.wordsPerRound);
  localStorage.setItem("totalRounds", data.totalRounds);
  localStorage.setItem("round", data.round || 1);
  const t = document.getElementById("pageTransition");
  if (t) t.classList.add("active");
  setTimeout(() => { window.location.href = "game.html"; }, 300);
});

socket.on("backToLobby", () => {
  localStorage.removeItem("word");
  localStorage.removeItem("role");
  localStorage.removeItem("timer");
  localStorage.removeItem("players");
  localStorage.removeItem("wordsPerRound");
  localStorage.removeItem("totalRounds");
  localStorage.removeItem("round");
  window.location.href = "lobby.html";
});