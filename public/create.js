const socket = io();

const emojis = ["👽","🤖","🧙‍♂️","👩‍🚀","💩","👸","👺"];
let index = 0;

const emojiDisplay = document.getElementById("emoji");
const nameInput = document.getElementById("name");
const roomInput = document.getElementById("roomName");

nameInput.maxLength = 12;

document.getElementById("prev").onclick = () => {
  index = (index - 1 + emojis.length) % emojis.length;
  emojiDisplay.innerText = emojis[index];
};

document.getElementById("next").onclick = () => {
  index = (index + 1) % emojis.length;
  emojiDisplay.innerText = emojis[index];
};

function shake(el){
  el.classList.add("shake");
  setTimeout(()=> el.classList.remove("shake"), 300);
}

document.getElementById("createBtn").onclick = () => {
  const name = nameInput.value.trim();
  const room = roomInput.value.trim();

  if (!name || !room) {
    if(!name) shake(nameInput);
    if(!room) shake(roomInput);
    return;
  }

  socket.emit("createRoom", {
    name: name,
    room: room,
    emoji: emojis[index]
  });
};

socket.on("roomCreated", ({ code, room }) => {
  localStorage.setItem("name", nameInput.value.trim());
  localStorage.setItem("roomCode", code);
  localStorage.setItem("roomName", room);
  localStorage.setItem("emoji", emojis[index]);
  window.location.href = "lobby.html";
});