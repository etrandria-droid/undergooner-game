const socket = io();

const nameInput = document.getElementById("nameInput");
const codeInput = document.getElementById("codeInput");
const joinBtn = document.getElementById("joinBtn");

const emojis = ["👽","🤖","🧙‍♂️","👩‍🚀","💩","👸","👺"];
let currentEmoji = emojis[0];
let emojiIndex = 0;

document.getElementById("emoji").innerText = currentEmoji;

document.getElementById("next").onclick = () => {
  emojiIndex = (emojiIndex + 1) % emojis.length;
  currentEmoji = emojis[emojiIndex];
  document.getElementById("emoji").innerText = currentEmoji;
};

document.getElementById("prev").onclick = () => {
  emojiIndex = (emojiIndex - 1 + emojis.length) % emojis.length;
  currentEmoji = emojis[emojiIndex];
  document.getElementById("emoji").innerText = currentEmoji;
};

joinBtn.onclick = () => {
  const name = nameInput.value.trim();
  const code = codeInput.value.trim().toUpperCase();

  if (!name || !code) {
    if (!name) shake(nameInput);
    if (!code) shake(codeInput);
    return;
  }

  localStorage.setItem("name", name);
  localStorage.setItem("roomCode", code);
  localStorage.setItem("emoji", currentEmoji);

  socket.emit("joinRoom", { playerName: name, code, emoji: currentEmoji });
};

socket.on("nameTaken", () => {
  showNotif("❌ Ce pseudo est déjà utilisé !", "#ff4b5c");
  shake(nameInput);
});

socket.on("roomNotFound", () => {
  showNotif("❌ Code invalide !", "#ff4b5c");
  shake(codeInput);
});

socket.on("gameAlreadyStarted", () => {
  showNotif("⏳ La partie est déjà en cours !", "#ffd700");
});

socket.on("roomFull", () => {
  showNotif("❌ Le salon est plein !", "#ff4b5c");
});

socket.on("roomJoined", ({ roomName }) => {
  localStorage.setItem("roomName", roomName);
  window.location.href = "lobby.html";
});

function shake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 300);
}

function showNotif(msg, color) {
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