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

  if (name.length > 12) {
    shake(nameInput);
    return;
  }

  localStorage.setItem("name", name);
  localStorage.setItem("roomCode", code);
  localStorage.setItem("emoji", currentEmoji);

  socket.emit("joinRoom", {
    playerName: name,
    code: code,
    emoji: currentEmoji
  });
};

socket.on("nameTaken", () => {
  alert("❌ Ce pseudo est déjà utilisé dans ce salon !");
  shake(nameInput);
});

socket.on("roomNotFound", () => {
  alert("Code invalide");
  shake(codeInput);
});

socket.on("gameAlreadyStarted", () => {
  alert("La partie est déjà en cours");
});

socket.on("roomFull", () => {
  alert("Le salon est plein");
});

socket.on("roomJoined", ({ roomName }) => {
  localStorage.setItem("roomName", roomName);
  window.location.href = "lobby.html";
});

function shake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 300);
}