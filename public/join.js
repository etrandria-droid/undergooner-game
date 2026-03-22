const socket = io();

const nameInput = document.getElementById("nameInput");
const codeInput = document.getElementById("codeInput");
const joinBtn = document.getElementById("joinBtn");

let currentEmoji = document.getElementById("emoji").innerText;

document.getElementById("next").onclick = () => {
  const emojis = ["👽","🤖","🧙‍♂️","👨‍🚀","💩","👸","👺"];
  let index = emojis.indexOf(currentEmoji);
  index = (index + 1) % emojis.length;
  currentEmoji = emojis[index];
  document.getElementById("emoji").innerText = currentEmoji;
};

document.getElementById("prev").onclick = () => {
  const emojis = ["👽","🤖","🧙‍♂️","👨‍🚀","💩","👸","👺"];
  let index = emojis.indexOf(currentEmoji);
  index = (index - 1 + emojis.length) % emojis.length;
  currentEmoji = emojis[index];
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

  if (name.length > 9) {
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
  alert("Pseudo déjà utilisé dans ce salon");
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
  alert("Le salon est plein (8 joueurs max)");
});

socket.on("roomJoined", ({ roomName }) => {
  localStorage.setItem("roomName", roomName);
  window.location.href = "lobby.html";
});

function shake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 300);
}