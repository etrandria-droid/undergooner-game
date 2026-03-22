const socket = io();

const name = localStorage.getItem("name");
let word = localStorage.getItem("word");
const role = localStorage.getItem("role");
const players = JSON.parse(localStorage.getItem("players") || "[]");
const roomCode = localStorage.getItem("roomCode");
const wordsPerRoundStored = parseInt(localStorage.getItem("wordsPerRound")) || 3;
const totalRoundsStored = parseInt(localStorage.getItem("totalRounds")) || 10;
const roundStored = parseInt(localStorage.getItem("round")) || 1;

let selectedVote = null;
let wordsPerRoundConfig = wordsPerRoundStored;
let totalRoundsConfig = totalRoundsStored;
let currentRound = roundStored;
let isHost = false;
let mrWhiteTimerInterval = null;

const storedPlayers = JSON.parse(localStorage.getItem("players") || "[]");
isHost = storedPlayers[0]?.name === name;

socket.on("connect", () => {
  socket.emit("rejoinGame", { playerName: name, code: roomCode });
});

// 🔢 1. Décompte
const steps = ["3", "2", "1", "🔍"];
let i = 0;
const countdownScreen = document.getElementById("countdownScreen");
const countdownEl = document.getElementById("countdown");
const countdownRoundLabel = document.getElementById("countdownRoundLabel");

countdownRoundLabel.innerText = "ROUND " + currentRound + " / " + totalRoundsConfig;
document.getElementById("roundLabel").innerText = "ROUND " + currentRound + " / " + totalRoundsConfig;

const interval = setInterval(() => {
  countdownEl.innerText = steps[i];
  countdownEl.style.animation = "none";
  countdownEl.offsetHeight;
  countdownEl.style.animation = "countPop 0.4s ease";
  i++;

  if (i === steps.length) {
    clearInterval(interval);
    setTimeout(() => {
      countdownScreen.style.display = "none";
      document.getElementById("gameWrapper").style.display = "flex";
      document.getElementById("wordDisplay").innerText = word;
      buildTable(players, wordsPerRoundConfig);
    }, 800);
  }
}, 800);


// 🔥 startCountdown — nouveau round
socket.on("startCountdown", (data) => {
  isHost = data.players[0]?.name === name;

  word = data.word;
  localStorage.setItem("word", data.word);
  localStorage.setItem("wordsPerRound", data.wordsPerRound);
  localStorage.setItem("totalRounds", data.totalRounds);
  localStorage.setItem("round", data.round);

  const wordDisplay = document.getElementById("wordDisplay");
  if (wordDisplay) wordDisplay.innerText = data.word;

  data.players.forEach(p => {
    const scoreEl = document.getElementById("score-" + p.name);
    if (scoreEl) scoreEl.innerText = p.score + " pt" + (p.score > 1 ? "s" : "");
  });
});


// 🧩 2. Tableau
function buildTable(playersList, wordsCount) {
  const table = document.getElementById("gameTable");
  const rowLabels = document.getElementById("rowLabels");
  table.innerHTML = "";
  rowLabels.innerHTML = "";

  // 🔥 spacer pour aligner avec le header des joueurs
  const spacer = document.createElement("div");
spacer.style.height = "0px";
spacer.style.minHeight = "0px";
  spacer.style.flexShrink = "0";
  rowLabels.appendChild(spacer);

  for (let w = 1; w <= wordsCount; w++) {
    const label = document.createElement("div");
    label.className = "row-label";
    label.innerText = "Mots n°" + w;
    rowLabels.appendChild(label);
  }

  playersList.forEach(p => {
    const col = document.createElement("div");
    col.className = "player-col";
    col.id = "col-" + p.name;
    if (p.name === name) col.classList.add("me");

    let cellsHtml = "";
    for (let w = 0; w < wordsCount; w++) {
      cellsHtml += `<div class="word-cell pending" id="cell-${p.name}-${w}">·</div>`;
    }

    col.innerHTML = `
      <div class="player-header">
        <div class="player-avatar">${p.emoji}</div>
        <div class="player-name">${p.name}</div>
        <div class="player-score" id="score-${p.name}">${p.score || 0} pt</div>
      </div>
      <div class="player-words">${cellsHtml}</div>
    `;

    table.appendChild(col);
  });
}


// 🔄 3. Nouveau tour
socket.on("newTurn", ({ playerName, wordIndex, wordsPerRound, timer }) => {
  wordsPerRoundConfig = wordsPerRound;
  document.getElementById("inputZone").style.display = "flex";

  document.querySelectorAll(".player-col").forEach(c => c.classList.remove("active"));
  const activeCol = document.getElementById("col-" + playerName);
  if (activeCol) activeCol.classList.add("active");

  const turnInfo = document.getElementById("turnInfo");
  if (playerName === name) {
    turnInfo.innerHTML = "🎤 C'est <span>ton tour !</span>";
  } else {
    turnInfo.innerHTML = "Tour de <span>" + playerName + "</span>";
  }

  const input = document.getElementById("wordInput");
  const btn = document.getElementById("sendBtn");

  if (playerName === name) {
    input.disabled = false;
    btn.disabled = false;
    input.value = "";
    input.focus();
  } else {
    input.disabled = true;
    btn.disabled = true;
  }

  startClientTimer(timer);
});


// 🔥 4. Mot joué
socket.on("wordPlayed", ({ playerName, word, wordIndex }) => {
  const cell = document.getElementById("cell-" + playerName + "-" + wordIndex);
  if (cell) {
    cell.className = "word-cell filled";
    cell.innerText = word === "..." ? "⏱️" : word;
  }

  if (playerName === name) {
    document.getElementById("wordInput").value = "";
    document.getElementById("wordInput").disabled = true;
    document.getElementById("sendBtn").disabled = true;
    stopClientTimer();
  }
});


// ⚠️ 5. AFK
socket.on("playerWarned", ({ playerName }) => {
  showNotif("⚠️ " + playerName + " n'a pas joué !", "#ffd700");
});

socket.on("playerAutoEliminated", ({ playerName }) => {
  const col = document.getElementById("col-" + playerName);
  if (col) { col.style.opacity = "0.3"; col.style.filter = "grayscale(1)"; }
  showNotif("❌ " + playerName + " AFK !", "#ff4b5c");
});


// ⏱️ 6. Timer
let clientTimerInterval;

function startClientTimer(duration) {
  stopClientTimer();
  let t = duration;
  const bar = document.getElementById("timerBar");
  const count = document.getElementById("timerCount");
  bar.style.transition = "none";
  bar.style.width = "100%";
  bar.classList.remove("urgent");
  count.classList.remove("urgent");
  count.innerText = t + "s";
  setTimeout(() => { bar.style.transition = "width 1s linear"; }, 50);

  clientTimerInterval = setInterval(() => {
    t--;
    bar.style.width = ((t / duration) * 100) + "%";
    count.innerText = t + "s";
    if (t <= 10) { bar.classList.add("urgent"); count.classList.add("urgent"); }
    if (t <= 0) stopClientTimer();
  }, 1000);
}

function stopClientTimer() {
  clearInterval(clientTimerInterval);
  const count = document.getElementById("timerCount");
  if (count) count.innerText = "";
}


// 📤 7. Envoi mot
function sendWord() {
  const input = document.getElementById("wordInput");
  if (!input.value.trim() || input.disabled) return;
  const wordValue = input.value.trim();
  stopClientTimer();
  input.disabled = true;
  document.getElementById("sendBtn").disabled = true;
  socket.emit("wordSent", { word: wordValue });
}

document.getElementById("sendBtn").onclick = sendWord;
document.getElementById("wordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendWord();
});


// 🗳️ 8. Vote
socket.on("startVote", ({ players: alivePlayers }) => {
  document.getElementById("inputZone").style.display = "none";
  document.querySelectorAll(".player-col").forEach(c => c.classList.remove("active"));
  stopClientTimer();

  const voteScreen = document.getElementById("voteScreen");
  voteScreen.style.display = "flex";

  const voteGrid = document.getElementById("voteGrid");
  voteGrid.innerHTML = "";
  selectedVote = null;
  document.getElementById("voteConfirmBtn").style.display = "none";
  document.getElementById("voteWaiting").innerText = "";

  alivePlayers.forEach(p => {
    if (p.name === name) return;

    const card = document.createElement("div");
    card.className = "vote-card";
    card.id = "votecard-" + p.name;
    card.innerHTML = `
      <div class="vote-card-emoji">${p.emoji}</div>
      <div class="vote-card-name">${p.name}</div>
    `;

    card.onclick = () => {
      if (card.classList.contains("disabled")) return;
      document.querySelectorAll(".vote-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedVote = p.name;
      document.getElementById("voteConfirmBtn").style.display = "block";
    };

    voteGrid.appendChild(card);
  });

  document.getElementById("voteConfirmBtn").onclick = () => {
    if (!selectedVote) return;
    document.querySelectorAll(".vote-card").forEach(c => c.classList.add("disabled"));
    document.getElementById("voteConfirmBtn").style.display = "none";
    document.getElementById("voteWaiting").innerText = "✅ Vote enregistré — en attente des autres...";
    socket.emit("vote", { target: selectedVote });
  };
});


// ⬜ 9. Mr. White guess
socket.on("mrWhiteGuessPhase", ({ playerName, timer }) => {
  document.getElementById("voteScreen").style.display = "none";

  const screen = document.getElementById("mrWhiteGuessScreen");
  screen.style.display = "flex";

  const subtitle = document.getElementById("mrWhiteSubtitle");
  const timerDisplay = document.getElementById("mrWhiteTimerDisplay");
  const inputRow = document.getElementById("mrWhiteInputRow");
  const waiting = document.getElementById("mrWhiteWaiting");

  timerDisplay.style.color = "white";

  if (name === playerName) {
    subtitle.innerText = "Tu as reçu des votes ! Devine le mot des civils pour gagner des points.";
    inputRow.style.display = "flex";
    waiting.style.display = "none";

    let t = timer;
    timerDisplay.innerText = t + "s";

    mrWhiteTimerInterval = setInterval(() => {
      t--;
      timerDisplay.innerText = t + "s";
      if (t <= 10) timerDisplay.style.color = "#ff4b5c";
      if (t <= 0) {
        clearInterval(mrWhiteTimerInterval);
        inputRow.style.display = "none";
        waiting.style.display = "block";
        waiting.innerText = "⏰ Temps écoulé !";
      }
    }, 1000);

    document.getElementById("mrWhiteBtn").onclick = () => {
      const guess = document.getElementById("mrWhiteInput").value.trim();
      if (!guess) return;
      clearInterval(mrWhiteTimerInterval);
      inputRow.style.display = "none";
      waiting.style.display = "block";
      waiting.innerText = "✅ Réponse envoyée !";
      timerDisplay.innerText = "";
      socket.emit("mrWhiteGuess", { guess, code: roomCode });
    };

    document.getElementById("mrWhiteInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("mrWhiteBtn").click();
    });

  } else {
    subtitle.innerText = playerName + " doit deviner le mot des civils...";
    inputRow.style.display = "none";
    waiting.style.display = "block";
    waiting.innerText = "⏳ En attente de " + playerName + "...";

    let t = timer;
    timerDisplay.innerText = t + "s";

    mrWhiteTimerInterval = setInterval(() => {
      t--;
      timerDisplay.innerText = t + "s";
      if (t <= 10) timerDisplay.style.color = "#ff4b5c";
      if (t <= 0) clearInterval(mrWhiteTimerInterval);
    }, 1000);
  }
});


// 🏁 10. Résultat vote
socket.on("voteResult", ({ wasUndercover, wasMrWhite, civilWord, undercoverWord, undercoverName, unanimous, scores, voteMap, mrWhiteGuessCorrect, mrWhiteGuess }) => {

  document.getElementById("voteScreen").style.display = "none";
  document.getElementById("mrWhiteGuessScreen").style.display = "none";
  if (mrWhiteTimerInterval) clearInterval(mrWhiteTimerInterval);

  const resultZone = document.getElementById("resultZone");
  resultZone.innerHTML = "";

  const result = document.createElement("div");
  result.className = "result-screen";

  const myVote = voteMap ? voteMap[name] : null;
  const iVotedForUndercover = myVote === undercoverName;
  const iAmUndercover = name === undercoverName;

  const whoFoundUndercover = voteMap
    ? Object.entries(voteMap)
        .filter(([voter, target]) => target === undercoverName && voter !== name)
        .map(([voter]) => voter)
    : [];

  const whoVotedAgainstMe = iAmUndercover && voteMap
    ? Object.entries(voteMap).filter(([_, target]) => target === name).map(([voter]) => voter)
    : [];

  let resultIcon = "";
  let resultText = "";
  let subText = "";

  if (wasMrWhite) {
    if (mrWhiteGuessCorrect) {
      resultIcon = "⬜";
      resultText = "Mr. White a deviné le mot civil !";
      subText = iVotedForUndercover
        ? "Tu avais voté pour l'Undergooner — tu gagnes ton point !"
        : "Mr. White gagne ses points.";
    } else {
      const iVotedMrWhite = myVote && myVote !== undercoverName && !iAmUndercover;
      resultIcon = iVotedForUndercover || iVotedMrWhite ? "✅" : "❌";
      resultText = "Mr. White n'a pas deviné le mot civil.";
      subText = iVotedForUndercover
        ? "Tu avais voté pour l'Undergooner — tu gagnes ton point !"
        : iVotedMrWhite
          ? "Tu avais voté pour Mr. White — tu gagnes ton point !"
          : "Tu n'as pas trouvé l'Undergooner.";
    }

  } else if (iAmUndercover) {
    if (whoVotedAgainstMe.length === 0) {
      resultIcon = "✅";
      resultText = "Tu étais l'Undergooner !<br><span style='font-size:18px;color:rgba(255,255,255,0.6);'>Personne ne t'a démasqué(e) — tu t'en es sorti(e) !</span>";
      subText = "Tu gagnes des points pour chaque joueur qui ne t'a pas trouvé(e).";
    } else if (unanimous) {
      resultIcon = "❌";
      resultText = "Tu étais l'Undergooner !<br><span style='font-size:18px;color:rgba(255,255,255,0.6);'>Tout le monde t'a démasqué(e) à l'unanimité !</span>";
      subText = "Tu ne gagnes aucun point ce round.";
    } else {
      resultIcon = "❌";
      resultText = `Tu étais l'Undergooner !<br><span style='font-size:18px;color:rgba(255,255,255,0.6);'>Tu as été démasqué(e) par <b style='color:white;'>${whoVotedAgainstMe.join(", ")}</b>.</span>`;
      const notFound = scores.filter(p => p.name !== name && !whoVotedAgainstMe.includes(p.name));
      subText = notFound.length > 0 ? `Tu gagnes des points grâce à ${notFound.map(p => p.name).join(", ")}.` : "";
    }

  } else if (iVotedForUndercover) {
    if (unanimous) {
      resultIcon = "✅";
      resultText = `<b>${undercoverName}</b> était l'Undergooner !`;
      subText = "Bravo, vous l'avez démasqué(e) à l'unanimité !";
    } else if (whoFoundUndercover.length === 0) {
      resultIcon = "✅";
      resultText = `<b>${undercoverName}</b> était l'Undergooner !`;
      subText = "Tu l'as démasqué(e) tout(e) seul(e) !";
    } else {
      resultIcon = "✅";
      resultText = `<b>${undercoverName}</b> était l'Undergooner !`;
      subText = `Tu l'as démasqué(e) avec <b>${whoFoundUndercover.join(", ")}</b> !`;
    }

  } else {
    resultIcon = "❌";
    const votedName = myVote || "?";
    resultText = `<b>${votedName}</b> était innocent(e)...`;
    subText = `L'Undergooner était <b>${undercoverName}</b>.`;
  }

  let html = `
    <div class="result-icon">${resultIcon}</div>
    <div class="result-main-text">${resultText}</div>
    <p style="color:rgba(255,255,255,0.65);font-size:16px;font-weight:600;margin:6px 0 10px;">${subText}</p>
    <div class="result-words">
      <span class="civil-word">🟢 Mot civil : <b>${civilWord}</b></span>
      <span class="undercover-word">🔴 Mot Undergooner : <b>${undercoverWord}</b></span>
    </div>
  `;

  if (mrWhiteGuess) {
    html += `<p style="color:rgba(255,255,255,0.4);font-size:13px;margin:4px 0;">
      Mr. White avait répondu : <b style="color:white;">${mrWhiteGuess}</b>
    </p>`;
  }

  html += `<div class="scores-zone">`;
  scores.forEach(p => {
    html += `
      <div class="score-card">
        <div class="score-card-emoji">${p.emoji}</div>
        <div class="score-card-name">${p.name}</div>
        <div class="score-card-pts">${p.score} pts</div>
      </div>
    `;
  });
  html += `</div>`;

  scores.forEach(p => {
    const scoreEl = document.getElementById("score-" + p.name);
    if (scoreEl) scoreEl.innerText = p.score + " pt" + (p.score > 1 ? "s" : "");
  });

  if (isHost) {
    html += `<button class="next-btn" id="nextRoundBtn">Suivant →</button>`;
  } else {
    html += `<p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:10px;">⏳ En attente du host...</p>`;
  }

  result.innerHTML = html;
  resultZone.appendChild(result);

  if (isHost) {
    document.getElementById("nextRoundBtn").onclick = () => {
      socket.emit("nextRound");
    };
  }
});


// 🔄 11. Nouveau round
socket.on("newRoundCountdown", ({ round }) => {
  currentRound = round;

  document.querySelectorAll(".word-cell").forEach(c => {
    c.className = "word-cell pending";
    c.innerText = "·";
  });

  document.getElementById("voteScreen").style.display = "none";
  document.getElementById("mrWhiteGuessScreen").style.display = "none";
  document.getElementById("resultZone").innerHTML = "";
  document.getElementById("inputZone").style.display = "none";
  document.querySelectorAll(".player-col").forEach(c => {
    c.style.opacity = "1";
    c.style.filter = "none";
    c.classList.remove("active");
  });

  const overlay = document.createElement("div");
  overlay.className = "new-round-overlay";
  const label = document.createElement("div");
  label.className = "new-round-label";
  label.innerText = "ROUND " + round + " / " + totalRoundsConfig;
  const num = document.createElement("div");
  num.className = "new-round-number";
  overlay.appendChild(label);
  overlay.appendChild(num);
  document.body.appendChild(overlay);

  const countSteps = ["3", "2", "1", "🔍"];
  let ci = 0;

  const ci_interval = setInterval(() => {
    num.innerText = countSteps[ci];
    num.style.animation = "none";
    num.offsetHeight;
    num.style.animation = "countPop 0.4s ease";
    ci++;
    if (ci === countSteps.length) {
      clearInterval(ci_interval);
      setTimeout(() => {
        overlay.remove();
        document.getElementById("roundLabel").innerText = "ROUND " + round + " / " + totalRoundsConfig;
        const updatedWord = localStorage.getItem("word");
        if (updatedWord) document.getElementById("wordDisplay").innerText = updatedWord;
      }, 500);
    }
  }, 800);
});


// 🏆 12. Fin de partie
socket.on("gameOver", ({ scores }) => {
  document.getElementById("voteScreen").style.display = "none";
  document.getElementById("mrWhiteGuessScreen").style.display = "none";
  document.getElementById("resultZone").innerHTML = "";
  document.getElementById("inputZone").style.display = "none";

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  let html = "<div class='gameover-screen'><h1>🏆 Fin de la partie !</h1><div class='scores-zone'>";
  sorted.forEach((p, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "";
    html += `
      <div class="score-card">
        <div class="score-card-emoji">${p.emoji}</div>
        <div class="score-card-name">${medal} ${p.name}</div>
        <div class="score-card-pts">${p.score} pts</div>
      </div>
    `;
  });
  html += "</div>";
  if (isHost) {
    html += `<button class="next-btn" id="restartBtn" style="margin-top:16px;">🔄 Rejouer</button>`;
  }
  html += "</div>";
  document.getElementById("resultZone").innerHTML = html;

  if (isHost) {
    document.getElementById("restartBtn").onclick = () => socket.emit("nextRound");
  }
});


// 🔙 13. Retour lobby
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


function showNotif(msg, color) {
  const notif = document.createElement("div");
  notif.className = "notif";
  notif.style.color = color;
  notif.style.border = `1px solid ${color}`;
  notif.innerText = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}