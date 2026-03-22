const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function generateCode() {
  let code;
  do { code = Math.random().toString(36).substring(2, 7).toUpperCase(); }
  while (rooms[code]);
  return code;
}

const wordPairs = [
  // 🐾 Animaux
  { civil: "CHAT", undercover: "RENARD" },
  { civil: "CHIEN", undercover: "LOUP" },
  { civil: "LION", undercover: "TIGRE" },
  { civil: "DAUPHIN", undercover: "REQUIN" },
  { civil: "AIGLE", undercover: "FAUCON" },
  { civil: "LAPIN", undercover: "LIÈVRE" },
  { civil: "MOUTON", undercover: "CHÈVRE" },
  { civil: "CROCODILE", undercover: "ALLIGATOR" },
  { civil: "PINGOUIN", undercover: "MANCHOT" },
  { civil: "PANTHÈRE", undercover: "GUÉPARD" },
  { civil: "GORILLE", undercover: "CHIMPANZÉ" },
  { civil: "PIEUVRE", undercover: "SEICHE" },

  // 🍕 Nourriture
  { civil: "PIZZA", undercover: "FOCACCIA" },
  { civil: "SUSHI", undercover: "MAKI" },
  { civil: "CRÊPE", undercover: "PANCAKE" },
  { civil: "BURGER", undercover: "SANDWICH" },
  { civil: "CROISSANT", undercover: "PAIN AU CHOCOLAT" },
  { civil: "COOKIE", undercover: "SABLÉ" },
  { civil: "RAMEN", undercover: "PHO" },
  { civil: "TACO", undercover: "BURRITO" },
  { civil: "GLACE", undercover: "SORBET" },
  { civil: "MIEL", undercover: "SIROP D'ÉRABLE" },
  { civil: "COUSCOUS", undercover: "TAJINE" },
  { civil: "FONDUE", undercover: "RACLETTE" },
  { civil: "TIRAMISU", undercover: "PANNA COTTA" },
  { civil: "KEBAB", undercover: "SHAWARMA" },
  { civil: "SAUMON", undercover: "THON" },
  { civil: "CAMEMBERT", undercover: "BRIE" },

  // 📱 Tech / Réseaux
  { civil: "NETFLIX", undercover: "DISNEY+" },
  { civil: "SPOTIFY", undercover: "DEEZER" },
  { civil: "INSTAGRAM", undercover: "SNAPCHAT" },
  { civil: "TIKTOK", undercover: "REELS" },
  { civil: "TWITCH", undercover: "YOUTUBE" },
  { civil: "WHATSAPP", undercover: "TELEGRAM" },
  { civil: "IPHONE", undercover: "PIXEL" },
  { civil: "PLAYSTATION", undercover: "XBOX" },
  { civil: "CHATGPT", undercover: "GEMINI" },
  { civil: "AMAZON", undercover: "ALIBABA" },

  // 🏙️ Villes
  { civil: "PARIS", undercover: "LYON" },
  { civil: "BARCELONE", undercover: "MADRID" },
  { civil: "TOKYO", undercover: "OSAKA" },
  { civil: "NEW YORK", undercover: "CHICAGO" },
  { civil: "DUBAI", undercover: "ABU DHABI" },
  { civil: "AMSTERDAM", undercover: "BRUXELLES" },
  { civil: "ROME", undercover: "MILAN" },
  { civil: "SYDNEY", undercover: "MELBOURNE" },
  { civil: "MIAMI", undercover: "LOS ANGELES" },
  { civil: "MOSCOU", undercover: "SAINT-PÉTERSBOURG" },

  // ⚽ Sport
  { civil: "FOOTBALL", undercover: "RUGBY" },
  { civil: "TENNIS", undercover: "BADMINTON" },
  { civil: "BASKETBALL", undercover: "HANDBALL" },
  { civil: "BOXE", undercover: "MMA" },
  { civil: "SKI", undercover: "SNOWBOARD" },
  { civil: "SURF", undercover: "WAKEBOARD" },
  { civil: "JUDO", undercover: "KARATÉ" },
  { civil: "NATATION", undercover: "WATER-POLO" },

  // 🎬 Séries / Films
  { civil: "BREAKING BAD", undercover: "NARCOS" },
  { civil: "GAME OF THRONES", undercover: "HOUSE OF THE DRAGON" },
  { civil: "STRANGER THINGS", undercover: "DARK" },
  { civil: "LA CASA DE PAPEL", undercover: "SQUID GAME" },
  { civil: "FRIENDS", undercover: "HOW I MET YOUR MOTHER" },
  { civil: "THE OFFICE", undercover: "PARKS AND RECREATION" },
  { civil: "PEAKY BLINDERS", undercover: "BOARDWALK EMPIRE" },
  { civil: "BLACK MIRROR", undercover: "WESTWORLD" },
  { civil: "LUPIN", undercover: "SHERLOCK" },
  { civil: "AVATAR", undercover: "DUNE" },
  { civil: "TITANIC", undercover: "PEARL HARBOR" },
  { civil: "INTERSTELLAR", undercover: "GRAVITY" },
  { civil: "INCEPTION", undercover: "TENET" },
  { civil: "LE PARRAIN", undercover: "SCARFACE" },
  { civil: "MATRIX", undercover: "TOTAL RECALL" },

  // 🎵 Musique / Artistes
  { civil: "BOOBA", undercover: "KAARIS" },
  { civil: "DRAKE", undercover: "KENDRICK LAMAR" },
  { civil: "BEYONCÉ", undercover: "RIHANNA" },
  { civil: "TAYLOR SWIFT", undercover: "ARIANA GRANDE" },
  { civil: "THE WEEKND", undercover: "POST MALONE" },
  { civil: "DAFT PUNK", undercover: "JUSTICE" },
  { civil: "NIRVANA", undercover: "PEARL JAM" },
  { civil: "METALLICA", undercover: "AC/DC" },
  { civil: "MICHAEL JACKSON", undercover: "PRINCE" },
  { civil: "EMINEM", undercover: "JAY-Z" },
  { civil: "COLDPLAY", undercover: "U2" },
  { civil: "THE BEATLES", undercover: "THE ROLLING STONES" },
  { civil: "ANGÈLE", undercover: "STROMAE" },
  { civil: "PNL", undercover: "NEKFEU" },
  { civil: "SCH", undercover: "NINHO" },
  { civil: "KANYE WEST", undercover: "TRAVIS SCOTT" },
  { civil: "NICKI MINAJ", undercover: "CARDI B" },

  // 🦸 Super-héros / Vilains
  { civil: "BATMAN", undercover: "IRON MAN" },
  { civil: "SUPERMAN", undercover: "THOR" },
  { civil: "SPIDER-MAN", undercover: "DAREDEVIL" },
  { civil: "HULK", undercover: "THING" },
  { civil: "WONDER WOMAN", undercover: "BLACK WIDOW" },
  { civil: "DEADPOOL", undercover: "WOLVERINE" },
  { civil: "JOKER", undercover: "BANE" },
  { civil: "THANOS", undercover: "DARKSEID" },
  { civil: "VENOM", undercover: "CARNAGE" },
  { civil: "DOCTEUR STRANGE", undercover: "LOKI" },

  // 🌍 Nature
  { civil: "SOLEIL", undercover: "LUNE" },
  { civil: "ORAGE", undercover: "TEMPÊTE" },
  { civil: "VOLCAN", undercover: "GEYSER" },
  { civil: "FLEUVE", undercover: "RIVIÈRE" },
  { civil: "OCÉAN", undercover: "MER" },
  { civil: "DÉSERT", undercover: "STEPPE" },
  { civil: "JUNGLE", undercover: "FORÊT TROPICALE" },
  { civil: "GLACIER", undercover: "BANQUISE" },
  { civil: "ÉCLAIR", undercover: "TONNERRE" },
  { civil: "TREMBLEMENT DE TERRE", undercover: "TSUNAMI" },
  { civil: "COMÈTE", undercover: "MÉTÉORITE" },
  { civil: "ARC-EN-CIEL", undercover: "AURORE BORÉALE" },

  // 🎭 Célébrités
  { civil: "CRISTIANO RONALDO", undercover: "NEYMAR" },
  { civil: "MESSI", undercover: "MBAPPÉ" },
  { civil: "LEBRON JAMES", undercover: "KEVIN DURANT" },
  { civil: "ELON MUSK", undercover: "MARK ZUCKERBERG" },
  { civil: "OBAMA", undercover: "CLINTON" },
  { civil: "MACRON", undercover: "SARKOZY" },
  { civil: "EINSTEIN", undercover: "NEWTON" },
  { civil: "NAPOLÉON", undercover: "CÉSAR" },
  { civil: "CLÉOPÂTRE", undercover: "NÉFERTITI" },
  { civil: "PICASSO", undercover: "DALÍ" },
  { civil: "SHAKESPEARE", undercover: "MOLIÈRE" },
  { civil: "JOHNNY DEPP", undercover: "BRAD PITT" },
  { civil: "LEONARDO DICAPRIO", undercover: "TOM HANKS" },

  // 🏠 Quotidien
  { civil: "CANAPÉ", undercover: "FAUTEUIL" },
  { civil: "DOUCHE", undercover: "BAIGNOIRE" },
  { civil: "LAMPE", undercover: "BOUGIE" },
  { civil: "OREILLER", undercover: "COUSSIN" },
  { civil: "CAFETIÈRE", undercover: "BOUILLOIRE" },
  { civil: "FRIGO", undercover: "CONGÉLATEUR" },
  { civil: "ASPIRATEUR", undercover: "BALAI" },

  // 🚗 Transport
  { civil: "MÉTRO", undercover: "RER" },
  { civil: "AVION", undercover: "HÉLICOPTÈRE" },
  { civil: "BATEAU", undercover: "FERRY" },
  { civil: "MOTO", undercover: "SCOOTER" },
  { civil: "TAXI", undercover: "VTC" },

  // 😈 Vicieux mais jouables
  { civil: "CAUCHEMAR", undercover: "HALLUCINATION" },
  { civil: "JUMEAU", undercover: "CLONE" },
  { civil: "SOSIE", undercover: "IMPOSTEUR" },
  { civil: "LABYRINTHE", undercover: "PIÈGE" },
  { civil: "TRAHISON", undercover: "COMPLOT" },
  { civil: "ÉPIDÉMIE", undercover: "PANDÉMIE" },
  { civil: "RÉVOLUTION", undercover: "INSURRECTION" },
  { civil: "AMNÉSIE", undercover: "COMA" },
  { civil: "FRISSON", undercover: "VERTIGE" },
  { civil: "JALOUSIE", undercover: "OBSESSION" },
  { civil: "HONTE", undercover: "REGRET" },
  { civil: "COURAGE", undercover: "TÉMÉRITÉ" },
  { civil: "NAUFRAGE", undercover: "NOYADE" },
  { civil: "MIRAGE", undercover: "ILLUSION D'OPTIQUE" },

  // 🎮 Jeux vidéo
  { civil: "MARIO", undercover: "SONIC" },
  { civil: "POKEMON", undercover: "YU-GI-OH" },
  { civil: "FORTNITE", undercover: "APEX LEGENDS" },
  { civil: "CALL OF DUTY", undercover: "BATTLEFIELD" },
  { civil: "GTA", undercover: "RED DEAD REDEMPTION" },
  { civil: "MINECRAFT", undercover: "ROBLOX" },
  { civil: "LEAGUE OF LEGENDS", undercover: "VALORANT" },
  { civil: "FIFA", undercover: "NBA 2K" },
  { civil: "THE LAST OF US", undercover: "RESIDENT EVIL" },
  { civil: "ASSASSIN'S CREED", undercover: "SPIDER-MAN" },
  { civil: "ZELDA", undercover: "ELDEN RING" },
  { civil: "AMONG US", undercover: "LOUP GAROU" },
  { civil: "OVERWATCH", undercover: "FORTNITE" },
  { civil: "ANIMAL CROSSING", undercover: "LES SIMS" },
  { civil: "PUBG", undercover: "CALL OF DUTY" },
  { civil: "DARK SOULS", undercover: "SEKIRO" },
  { civil: "CRASH BANDICOOT", undercover: "RAYMAN" },
  { civil: "MORTAL KOMBAT", undercover: "STREET FIGHTER" },
  { civil: "GRAND THEFT AUTO", undercover: "WATCH DOGS" },
  { civil: "CYBERPUNK 2077", undercover: "NO MAN'S SKY" },
];

io.on("connection", (socket) => {

  console.log("Socket connecté :", socket.id);

  socket.on("createRoom", ({ name, room, emoji }) => {
    const code = generateCode();
    rooms[code] = {
      name: room,
      players: [],
      started: false,
      votes: {},
      votesSnapshot: {},
      currentPlayerIndex: 0,
      currentRound: 1,
      totalRounds: 10,
      wordsPerRound: 3,
      currentWordIndex: 0,
      turnTimer: null,
      mrWhiteTimer: null,
      words: {},
      pendingReveal: null,
      settings: {
        maxPlayers: 8,
        timer: 30,
        mrWhite: false,
        mrBlack: false,
        totalRounds: 10,
        wordsPerRound: 3,
      }
    };

    rooms[code].players.push({
      id: socket.id,
      name, emoji,
      host: true,
      eliminated: false,
      warned: false,
      hasUsedPower: false,
      score: 0,
      role: null,
      word: null,
    });

    socket.join(code);
    socket.emit("roomCreated", { code, room });
    io.to(code).emit("updateLobby", rooms[code].players);
  });

  socket.on("joinRoom", ({ playerName, code, emoji }) => {
    console.log("joinRoom reçu :", playerName, code);
    const room = rooms[code];

    if (!room) { console.log("Room introuvable :", code); socket.emit("roomNotFound"); return; }
    if (room.started) { socket.emit("gameAlreadyStarted"); return; }

    const already = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (already) {
      already.id = socket.id;
      socket.join(code);
      socket.emit("updateLobby", room.players);
      return;
    }

    if (room.players.length >= room.settings.maxPlayers) { socket.emit("roomFull"); return; }

    room.players.push({
      id: socket.id,
      name: playerName,
      emoji,
      host: false,
      eliminated: false,
      warned: false,
      hasUsedPower: false,
      score: 0,
      role: null,
      word: null,
    });

    socket.join(code);
    room.players.forEach((p, index) => { p.host = index === 0; });
    socket.emit("roomJoined", { roomName: room.name });
    io.to(code).emit("updateLobby", room.players);
  });

  socket.on("rejoinGame", ({ playerName, code }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (player) {
      player.id = socket.id;
      socket.join(code);
      console.log("Joueur rejoint game :", playerName);
    }
  });

  socket.on("updateSettings", ({ code, settings }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.host) return;

    room.settings = {
      maxPlayers: settings.maxPlayers || 8,
      timer: settings.timer || 30,
      mrWhite: settings.mrWhite || false,
      mrBlack: settings.mrBlack || false,
      totalRounds: settings.totalRounds || 10,
      wordsPerRound: settings.wordsPerRound || 3,
    };

    io.to(code).emit("settingsUpdated", room.settings);
  });

  socket.on("startGame", () => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.find(p => p.id === socket.id)
    );
    if (!roomCode) return;
    const room = rooms[roomCode];
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.host) return;
    startRound(roomCode);
  });

  socket.on("nextRound", () => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.find(p => p.id === socket.id)
    );
    if (!roomCode) return;
    const room = rooms[roomCode];
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.host) return;

    room.currentRound++;

    if (room.currentRound > room.totalRounds) {
      io.to(roomCode).emit("gameOver", {
        scores: room.players.map(p => ({ name: p.name, emoji: p.emoji, score: p.score }))
      });
      return;
    }

    io.to(roomCode).emit("newRoundCountdown", { round: room.currentRound });
    setTimeout(() => startRound(roomCode), 4000);
  });

  socket.on("wordSent", ({ word }) => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.find(p => p.id === socket.id)
    );
    if (!roomCode) return;
    const room = rooms[roomCode];
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (room.turnTimer) { clearTimeout(room.turnTimer); room.turnTimer = null; }

    const wi = room.currentWordIndex;
    if (!room.words[wi]) room.words[wi] = {};
    room.words[wi][player.name] = word;

    io.to(roomCode).emit("wordPlayed", { playerName: player.name, word, wordIndex: wi });
    advanceTurn(roomCode);
  });

  socket.on("vote", ({ target }) => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.find(p => p.id === socket.id)
    );
    if (!roomCode) return;
    const room = rooms[roomCode];
    if (!room.votes) room.votes = {};

    room.votes[socket.id] = target;

    const alivePlayers = room.players.filter(p => !p.eliminated);
    const totalVotes = Object.keys(room.votes).length;
    if (totalVotes < alivePlayers.length) return;

    resolveVote(roomCode);
  });

  socket.on("mrWhiteGuess", ({ guess, code }) => {
    const room = rooms[code];
    if (!room || !room.pendingReveal) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== "mrwhite") return;

    if (room.mrWhiteTimer) { clearTimeout(room.mrWhiteTimer); room.mrWhiteTimer = null; }

    const civilWord = room.pendingReveal.civilWord;
    const correct = guess.toLowerCase().trim() === civilWord.toLowerCase().trim();
    const r = room.pendingReveal;

    if (correct) {
      player.score += r.votesAgainstMrWhite;
      if (r.mrWhiteVotedForUndercover) player.score += 1;
    } else {
      room.players.forEach(p => {
        if (r.whoVotedMrWhite.includes(p.name)) p.score += 1;
      });
    }

    room.pendingReveal.mrWhiteGuessCorrect = correct;
    room.pendingReveal.mrWhiteGuess = guess;
    room.pendingReveal.scores = room.players.map(p => ({
      name: p.name, emoji: p.emoji, score: p.score
    }));

    revealResult(code);
  });

  socket.on("spyPlayer", ({ target }) => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.find(p => p.id === socket.id)
    );
    if (!roomCode) return;
    const room = rooms[roomCode];
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== "mrblack") return;
    if (player.hasUsedPower) return;
    const targetPlayer = room.players.find(p => p.name === target);
    if (!targetPlayer) return;
    player.hasUsedPower = true;
    socket.emit("spyResult", { targetName: target, word: targetPlayer.word });
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      const room = rooms[code];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1) continue;
      if (room.started) { console.log("Partie en cours, joueur gardé"); continue; }
      room.players.splice(playerIndex, 1);
      room.players.forEach((p, index) => { p.host = index === 0; });
      if (room.players.length === 0) {
        if (room.turnTimer) clearTimeout(room.turnTimer);
        setTimeout(() => {
          if (rooms[code] && rooms[code].players.length === 0) delete rooms[code];
        }, 5000);
      } else {
        io.to(code).emit("updateLobby", room.players);
      }
    }
    console.log("Déconnecté :", socket.id);
  });
});


function startRound(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.started = true;
  room.currentPlayerIndex = 0;
  room.currentWordIndex = 0;
  room.votes = {};
  room.votesSnapshot = {};
  room.pendingReveal = null;
  room.words = {};
  room.totalRounds = room.settings.totalRounds || 10;
  room.wordsPerRound = room.settings.wordsPerRound || 3;

  room.players.forEach(p => {
    p.eliminated = false;
    p.warned = false;
    p.hasUsedPower = false;
    p.role = null;
    p.word = null;
  });

  const { mrWhite, mrBlack, timer } = room.settings;
  const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);

  let roleIndex = 0;
  shuffled[roleIndex].role = "undercover";
  shuffled[roleIndex].word = pair.undercover;
  roleIndex++;

  if (mrWhite && shuffled.length > roleIndex) {
    shuffled[roleIndex].role = "mrwhite";
    shuffled[roleIndex].word = "❓";
    roleIndex++;
  }

  if (mrBlack && shuffled.length > roleIndex) {
    shuffled[roleIndex].role = "mrblack";
    shuffled[roleIndex].word = pair.civil;
    shuffled[roleIndex].hasUsedPower = false;
    roleIndex++;
  }

  shuffled.slice(roleIndex).forEach(p => {
    p.role = "civil";
    p.word = pair.civil;
  });

  room.players.forEach(p => {
    io.to(p.id).emit("startCountdown", {
      word: p.word,
      role: p.role,
      timer,
      round: room.currentRound,
      totalRounds: room.totalRounds,
      wordsPerRound: room.wordsPerRound,
      players: room.players.map(pl => ({
        name: pl.name,
        emoji: pl.emoji,
        score: pl.score,
      }))
    });
  });

  setTimeout(() => startTurn(roomCode), 6000);
}


function startTurn(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const alivePlayers = room.players.filter(p => !p.eliminated);
  if (alivePlayers.length === 0) return;

  if (room.currentWordIndex >= room.wordsPerRound) {
    io.to(roomCode).emit("startVote", {
      players: room.players.map(p => ({
        name: p.name,
        emoji: p.emoji,
        eliminated: p.eliminated
      }))
    });
    return;
  }

  room.currentPlayerIndex = room.currentPlayerIndex % alivePlayers.length;
  const player = alivePlayers[room.currentPlayerIndex];
  if (!player) return;

  io.to(roomCode).emit("newTurn", {
    playerName: player.name,
    wordIndex: room.currentWordIndex,
    wordsPerRound: room.wordsPerRound,
    timer: room.settings.timer,
  });

  room.turnTimer = setTimeout(() => {
    if (player.warned) {
      player.eliminated = true;
      io.to(roomCode).emit("playerAutoEliminated", { playerName: player.name });
      if (!room.words[room.currentWordIndex]) room.words[room.currentWordIndex] = {};
      room.words[room.currentWordIndex][player.name] = "...";
      io.to(roomCode).emit("wordPlayed", { playerName: player.name, word: "...", wordIndex: room.currentWordIndex });
      setTimeout(() => advanceTurn(roomCode), 2000);
    } else {
      player.warned = true;
      io.to(roomCode).emit("playerWarned", { playerName: player.name });
      if (!room.words[room.currentWordIndex]) room.words[room.currentWordIndex] = {};
      room.words[room.currentWordIndex][player.name] = "...";
      io.to(roomCode).emit("wordPlayed", { playerName: player.name, word: "...", wordIndex: room.currentWordIndex });
      setTimeout(() => advanceTurn(roomCode), 1500);
    }
  }, room.settings.timer * 1000);
}

function advanceTurn(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  const alivePlayers = room.players.filter(p => !p.eliminated);
  room.currentPlayerIndex++;
  if (room.currentPlayerIndex >= alivePlayers.length) {
    room.currentPlayerIndex = 0;
    room.currentWordIndex++;
  }
  startTurn(roomCode);
}


function resolveVote(roomCode) {
  const room = rooms[roomCode];

  const count = {};
  Object.values(room.votes).forEach(name => {
    count[name] = (count[name] || 0) + 1;
  });

  const voteMap = {};
  Object.entries(room.votes).forEach(([socketId, targetName]) => {
    const voter = room.players.find(p => p.id === socketId);
    if (voter) voteMap[voter.name] = targetName;
  });

  const undercover = room.players.find(p => p.role === "undercover");
  const civilWord = room.players.find(p => p.role === "civil")?.word;
  const undercoverWord = undercover?.word;
  const undercoverName = undercover?.name;

  const votesAgainstUndercover = undercoverName ? (count[undercoverName] || 0) : 0;
  const unanimous = votesAgainstUndercover === room.players.length;

  const mrWhitePlayer = room.players.find(p => p.role === "mrwhite");
  const whoVotedMrWhite = mrWhitePlayer
    ? Object.entries(voteMap).filter(([_, t]) => t === mrWhitePlayer.name).map(([v]) => v)
    : [];

  // 🔥 points civils qui ont voté undergooner
  room.players.forEach(p => {
    if (p.role !== "undercover" && p.role !== "mrwhite") {
      if (voteMap[p.name] === undercoverName) {
        p.score += 1;
      }
    }
  });

  // 🔥 undergooner : +1 par joueur qui n'a pas voté contre lui
  if (undercover) {
    const notVotedAgainst = room.players.filter(p =>
      p.name !== undercover.name && voteMap[p.name] !== undercover.name
    ).length;
    undercover.score += notVotedAgainst;
  }

  room.votesSnapshot = { ...count };
  room.votes = {};

  // 🔥 Mr. White a reçu des votes → phase guess
  if (mrWhitePlayer && whoVotedMrWhite.length > 0) {

    room.pendingReveal = {
      civilWord,
      undercoverWord,
      undercoverName,
      unanimous,
      voteMap,
      whoVotedMrWhite,
      votesAgainstMrWhite: whoVotedMrWhite.length,
      mrWhiteVotedForUndercover: voteMap[mrWhitePlayer.name] === undercoverName,
      scores: room.players.map(p => ({ name: p.name, emoji: p.emoji, score: p.score })),
      wasMrWhite: true,
      wasUndercover: false,
      eliminated: mrWhitePlayer.name,
    };

    io.to(roomCode).emit("mrWhiteGuessPhase", {
      playerName: mrWhitePlayer.name,
      timer: 30,
    });

    room.mrWhiteTimer = setTimeout(() => {
      room.players.forEach(p => {
        if (room.pendingReveal.whoVotedMrWhite.includes(p.name)) p.score += 1;
      });
      room.pendingReveal.mrWhiteGuessCorrect = false;
      room.pendingReveal.mrWhiteGuess = null;
      room.pendingReveal.scores = room.players.map(p => ({
        name: p.name, emoji: p.emoji, score: p.score
      }));
      revealResult(roomCode);
    }, 31000);

    return;
  }

  // 🔥 reveal direct
  io.to(roomCode).emit("voteResult", {
    wasUndercover: false,
    wasMrWhite: false,
    civilWord,
    undercoverWord,
    undercoverName,
    unanimous,
    voteMap,
    scores: room.players.map(p => ({ name: p.name, emoji: p.emoji, score: p.score })),
    mrWhiteGuessCorrect: null,
    mrWhiteGuess: null,
  });
}

function revealResult(roomCode) {
  const room = rooms[roomCode];
  if (!room || !room.pendingReveal) return;
  const r = room.pendingReveal;
  io.to(roomCode).emit("voteResult", {
    wasUndercover: r.wasUndercover,
    wasMrWhite: r.wasMrWhite,
    civilWord: r.civilWord,
    undercoverWord: r.undercoverWord,
    undercoverName: r.undercoverName,
    unanimous: r.unanimous,
    voteMap: r.voteMap || {},
    scores: r.scores,
    mrWhiteGuessCorrect: r.mrWhiteGuessCorrect,
    mrWhiteGuess: r.mrWhiteGuess,
  });
  room.pendingReveal = null;
}


server.listen(3000, () => {
  console.log("http://localhost:3000");
});