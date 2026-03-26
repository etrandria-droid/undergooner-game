const socket = io();

const name = localStorage.getItem("name");
const code = localStorage.getItem("roomCode");
const roomName = localStorage.getItem("roomName");
let currentEmoji = localStorage.getItem("emoji") || "👽";

document.getElementById("lobbyName").innerText = roomName;
document.getElementById("roomCode").innerText = code;
document.getElementById("lobbyEmoji").innerText = currentEmoji;

if (code && !window.location.pathname.includes(code)) {
  window.history.replaceState(null, "", "/" + code);
}

socket.on("connect", () => {
  socket.emit("joinRoom", { playerName: name, code, emoji: currentEmoji });
});

document.getElementById("copyBtn").onclick = () => {
  const url = window.location.origin + "/" + code;
  navigator.clipboard.writeText(url);
  showLobbyNotif("🔗 Lien copié !", "#4dff91");
};

const emojis = ["👽","🤖","🧙‍♂️","👩‍🚀","💩","👸","👺"];
let emojiIndex = emojis.indexOf(currentEmoji);
if (emojiIndex === -1) emojiIndex = 0;

document.getElementById("prevEmoji").onclick = () => {
  emojiIndex = (emojiIndex - 1 + emojis.length) % emojis.length;
  currentEmoji = emojis[emojiIndex];
  document.getElementById("lobbyEmoji").innerText = currentEmoji;
  localStorage.setItem("emoji", currentEmoji);
  socket.emit("updateEmoji", { code, emoji: currentEmoji });
};

document.getElementById("nextEmoji").onclick = () => {
  emojiIndex = (emojiIndex + 1) % emojis.length;
  currentEmoji = emojis[emojiIndex];
  document.getElementById("lobbyEmoji").innerText = currentEmoji;
  localStorage.setItem("emoji", currentEmoji);
  socket.emit("updateEmoji", { code, emoji: currentEmoji });
};

const rulesBtn = document.getElementById("rulesBtn");
const rulesPanel = document.getElementById("rulesPanel");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");

const btnStyle = `
  position:absolute;
  font-size:18px;cursor:pointer;width:32px;height:32px;
  display:flex;align-items:center;justify-content:center;
  border-radius:10px;background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);transition:all 0.3s;
`;

settingsBtn.style.cssText = btnStyle + "top:16px;right:16px;";
rulesBtn.style.cssText = btnStyle + "top:58px;right:16px;";

rulesBtn.onmouseenter = () => { rulesBtn.style.transform = "scale(1.15)"; rulesBtn.style.background = "rgba(255,255,255,0.12)"; };
rulesBtn.onmouseleave = () => { rulesBtn.style.transform = "scale(1)"; rulesBtn.style.background = "rgba(255,255,255,0.06)"; };
settingsBtn.onmouseenter = () => { settingsBtn.style.transform = "scale(1.15)"; settingsBtn.style.background = "rgba(255,255,255,0.12)"; };
settingsBtn.onmouseleave = () => { settingsBtn.style.transform = "scale(1)"; settingsBtn.style.background = "rgba(255,255,255,0.06)"; };

rulesBtn.onclick = () => {
  const isOpen = rulesPanel.style.display === "block";
  rulesPanel.style.display = isOpen ? "none" : "block";
  settingsPanel.style.display = "none";
};

document.getElementById("closeRules").onclick = () => {
  rulesPanel.style.display = "none";
};

settingsBtn.onclick = () => {
  const isOpen = settingsPanel.style.display === "block";
  if (isOpen) {
    if (isHost) restoreSettings();
    settingsPanel.style.display = "none";
  } else {
    settingsPanel.style.display = "block";
    rulesPanel.style.display = "none";
  }
};

document.getElementById("closeSettings").onclick = () => {
  if (isHost) restoreSettings();
  settingsPanel.style.display = "none";
};

let savedSettings = {
  maxPlayers: 8, timer: 30, totalRounds: 10,
  wordsPerRound: 3, mrWhite: false, mrBlack: false
};

let isHost = false;

function restoreSettings() {
  document.getElementById("maxPlayers").value = savedSettings.maxPlayers;
  document.getElementById("timer").value = savedSettings.timer;
  document.getElementById("totalRounds").value = savedSettings.totalRounds;
  document.getElementById("wordsPerRound").value = savedSettings.wordsPerRound;
  document.getElementById("mrWhite").checked = savedSettings.mrWhite;
  document.getElementById("mrBlack").checked = savedSettings.mrBlack;
}

function setSettingsReadOnly(readOnly) {
  const inputs = settingsPanel.querySelectorAll("select, input[type='checkbox']");
  inputs.forEach(el => { el.disabled = readOnly; });
  const saveBtn = document.getElementById("saveSettings");
  if (saveBtn) saveBtn.style.display = readOnly ? "none" : "block";
}

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
      <p>${p.name}${p.host ? "<span class='host-dot'>👑</span>" : ""}</p>
    `;
    zone.appendChild(div);
  });

  const me = players.find(p => p.name === name);
  const msg = document.getElementById("minPlayersMsg");
  isHost = !!(me && me.host);

  if (players.length >= 3) {
    if (msg) msg.style.display = "none";
  } else {
    if (msg) msg.style.display = "block";
  }

  rulesBtn.style.display = "flex";
  settingsBtn.style.display = "flex";
  setSettingsReadOnly(!isHost);

  if (isHost && players.length >= 3) {
    startBtn.className = "btn red big-action";
    startBtn.disabled = false;
  } else {
    startBtn.className = "btn big-action disabled-btn";
    startBtn.disabled = true;
  }

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
    if (!isHost) {
      if (mrWhiteCheck) mrWhiteCheck.disabled = true;
      if (mrBlackCheck) mrBlackCheck.disabled = true;
    } else {
      if (mrWhiteCheck) mrWhiteCheck.disabled = false;
      if (mrBlackCheck) mrBlackCheck.disabled = false;
    }
    if (mrWhiteRow) mrWhiteRow.style.opacity = "1";
    if (mrBlackRow) mrBlackRow.style.opacity = "1";
    if (mrMinMsg) mrMinMsg.style.display = "none";
  }
});

socket.on("settingsUpdated", (settings) => {
  savedSettings = { ...settings };
  restoreSettings();
});

function showLobbyNotif(msg, color) {
  const notif = document.createElement("div");
  notif.style.cssText = `
    position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:rgba(0,0,0,0.85);color:${color};
    padding:10px 20px;border-radius:10px;
    font-weight:700;font-size:14px;
    z-index:999;border:1px solid ${color};
    font-family:'Baloo 2',cursive;
  `;
  notif.innerText = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

socket.on("nameTaken", () => {
  showLobbyNotif("❌ Ce pseudo est déjà utilisé dans ce salon !", "#ff4b5c");
  setTimeout(() => { window.location.href = "/"; }, 2000);
});

socket.on("roomNotFound", () => {
  showLobbyNotif("❌ Salon introuvable !", "#ff4b5c");
  setTimeout(() => { window.location.href = "/"; }, 2000);
});

socket.on("roomFull", () => {
  showLobbyNotif("❌ Le salon est plein !", "#ff4b5c");
  setTimeout(() => { window.location.href = "/"; }, 2000);
});

socket.on("gameAlreadyStarted", () => {
  showLobbyNotif("⏳ La partie est déjà en cours !", "#ffd700");
  setTimeout(() => { window.location.href = "/"; }, 2000);
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
  setTimeout(() => { window.location.href = "/game"; }, 300);
});

socket.on("backToLobby", () => {
  localStorage.removeItem("word");
  localStorage.removeItem("role");
  localStorage.removeItem("timer");
  localStorage.removeItem("players");
  localStorage.removeItem("wordsPerRound");
  localStorage.removeItem("totalRounds");
  localStorage.removeItem("round");
  window.location.href = "/" + code;
});