const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// 🔥 URLs propres — /[code] redirige vers lobby
app.get("/:code([A-Z0-9]{5})", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "lobby.html"));
});

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
  { civil: "PIZZA", undercover: "LASAGNE" },
  { civil: "SUSHI", undercover: "MAKI" },
  { civil: "CRÊPE", undercover: "PANCAKE" },
  { civil: "BURGER", undercover: "SANDWICH" },
  { civil: "CROISSANT", undercover: "PAIN AU CHOCOLAT" },
  { civil: "COOKIE", undercover: "SABLÉ" },
  { civil: "RAMEN", undercover: "PHO" },
  { civil: "TACO", undercover: "BURRITO" },
  { civil: "GLACE", undercover: "SORBET" },
  { civil: "MIEL", undercover: "CONFITURE" },
  { civil: "COUSCOUS", undercover: "TAJINE" },
  { civil: "FONDUE", undercover: "RACLETTE" },
  { civil: "TIRAMISU", undercover: "PANNA COTTA" },
  { civil: "KEBAB", undercover: "HAMBURGER" },
  { civil: "SAUMON", undercover: "THON" },
  { civil: "CAMEMBERT", undercover: "BRIE" },
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
  { civil: "SKI", undercover: "JETSKI" },
  { civil: "SURF", undercover: "WAKEBOARD" },
  { civil: "JUDO", undercover: "KARATÉ" },
  { civil: "NATATION", undercover: "WATER-POLO" },
  { civil: "SAUT EN HAUTEUR", undercover: "SAUT EN LONGUEUR" },
  { civil: "TROTTINETTE", undercover: "SKATEBOARD" },
  // 🎬 Séries / Films
  { civil: "BREAKING BAD", undercover: "NARCOS" },
  { civil: "GAME OF THRONES", undercover: "HOUSE OF THE DRAGON" },
  { civil: "STRANGER THINGS", undercover: "SEX EDUCATION" },
  { civil: "LA CASA DE PAPEL", undercover: "SQUID GAME" },
  { civil: "MALCOLM", undercover: "FRIENDS" },
  { civil: "POWER RANGERS", undercover: "AVENGERS" },
  { civil: "KIRIKOU", undercover: "BLACK PANTHER" },
  { civil: "JACK SPARROW", undercover: "BARBE NOIRE" },
  { civil: "LUPIN", undercover: "SHERLOCK" },
  { civil: "AVATAR", undercover: "DUNE" },
  { civil: "TITANIC", undercover: "PEARL HARBOR" },
  { civil: "INTERSTELLAR", undercover: "GRAVITY" },
  { civil: "INCEPTION", undercover: "TENET" },
  { civil: "LE PARRAIN", undercover: "SCARFACE" },
  { civil: "HARRY POTTER", undercover: "HERMIONE GRANGER" },
  { civil: "LE LABYRINTHE", undercover: "HUNGER GAMES" },
  // 🎵 Musique
  { civil: "MISTER V", undercover: "MASTU" },
  { civil: "DRAKE", undercover: "KENDRICK LAMAR" },
  { civil: "BEYONCÉ", undercover: "RIHANNA" },
  { civil: "TAYLOR SWIFT", undercover: "ARIANA GRANDE" },
  { civil: "THE WEEKND", undercover: "POST MALONE" },
  { civil: "COLDPLAY", undercover: "MAROON 5" },
  { civil: "NIRVANA", undercover: "ARCTIC MONKEYS" },
  { civil: "METALLICA", undercover: "AC/DC" },
  { civil: "AMIXEM", undercover: "JOYCA" },
  { civil: "ANGÈLE", undercover: "STROMAE" },
  { civil: "PNL", undercover: "NEKFEU" },
  { civil: "SCH", undercover: "NINHO" },
  { civil: "NICKI MINAJ", undercover: "CARDI B" },
  { civil: "KANYE WEST", undercover: "TRAVIS SCOTT" },
  // 🦸 Super-héros
  { civil: "BATMAN", undercover: "IRON MAN" },
  { civil: "SUPERMAN", undercover: "THOR" },
  { civil: "SPIDER-MAN", undercover: "DAREDEVIL" },
  { civil: "HULK", undercover: "THANOS" },
  { civil: "WONDER WOMAN", undercover: "BLACK WIDOW" },
  { civil: "DEADPOOL", undercover: "WOLVERINE" },
  { civil: "LE JOKER", undercover: "BOUFFON VERT" },
  { civil: "X-MEN", undercover: "4 FANTASTIQUES" },
  { civil: "JUSTICE LEAGUE", undercover: "GARDIENS DE LA GALAXIE" },
  { civil: "DOCTEUR STRANGE", undercover: "LOKI" },
  { civil: "INFINITY WAR", undercover: "ENDGAME" },
  { civil: "KING ANDERSON", undercover: "PRODIGY6464" },
  // 🌍 Nature
  { civil: "SOLEIL", undercover: "LUNE" },
  { civil: "ORAGE", undercover: "TEMPÊTE" },
  { civil: "VOLCAN", undercover: "MONTAGNE" },
  { civil: "FLEUVE", undercover: "RIVIÈRE" },
  { civil: "OCÉAN", undercover: "MER" },
  { civil: "FORÊT", undercover: "JUNGLE" },
  { civil: "BUISSON", undercover: "ARBRE" },
  { civil: "HIVER", undercover: "AUTOMNE" },
  { civil: "ÉCLAIR", undercover: "TONNERRE" },
  { civil: "SÉISME", undercover: "TSUNAMI" },
  { civil: "CRÉPUSCULE", undercover: "AUBE" },
  { civil: "ARC-EN-CIEL", undercover: "AURORE BORÉALE" },
  // 🎭 Célébrités
  { civil: "CRISTIANO RONALDO", undercover: "NEYMAR" },
  { civil: "MESSI", undercover: "MBAPPÉ" },
  { civil: "HELYDIA", undercover: "ELSA BOIS" },
  { civil: "LEBRON JAMES", undercover: "MICHAEL JORDAN" },
  { civil: "ELON MUSK", undercover: "MARK ZUCKERBERG" },
  { civil: "BARACK OBAMA", undercover: "DONALD TRUMP" },
  { civil: "MACRON", undercover: "SARKOZY" },
  { civil: "EINSTEIN", undercover: "NEWTON" },
  { civil: "NAPOLÉON", undercover: "CÉSAR" },
  { civil: "CLÉOPÂTRE", undercover: "NÉFERTITI" },
  { civil: "PICASSO", undercover: "VAN GOGH" },
  { civil: "MACRON", undercover: "MÉLENCHON" },
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
  // 🎲 Divers
  { civil: "NETFLIX", undercover: "DISNEY+" },
  { civil: "SPOTIFY", undercover: "DEEZER" },
  { civil: "INSTAGRAM", undercover: "SNAPCHAT" },
  { civil: "TIKTOK", undercover: "REELS" },
  { civil: "TWITCH", undercover: "YOUTUBE" },
  { civil: "WHATSAPP", undercover: "TELEGRAM" },
  { civil: "IPHONE", undercover: "SAMSUNG" },
  { civil: "PLAYSTATION", undercover: "XBOX" },
  { civil: "CHATGPT", undercover: "GEMINI" },
  { civil: "AMAZON", undercover: "ALIBABA" },
  { civil: "NIKE", undercover: "ASICS" },
  { civil: "COCA COLA", undercover: "PEPSI" },
  { civil: "OREO", undercover: "GRANOLA" },
  { civil: "CLAVIER", undercover: "PIANO" },
  { civil: "TATOUAGE", undercover: "CICATRICE" },
  { civil: "BOUTEILLE", undercover: "GOURDE" },
  { civil: "PARAPLUIE", undercover: "PARASOL" },
  { civil: "CHIPS", undercover: "POP-CORN" },
  { civil: "CINÉMA", undercover: "THÉÂTRE" },
  { civil: "TUNNEL", undercover: "PONT" },
  { civil: "WIFI", undercover: "BLUETOOTH" },
  // 🚗 Transport
  { civil: "MÉTRO", undercover: "RER" },
  { civil: "AVION", undercover: "HÉLICOPTÈRE" },
  { civil: "BATEAU", undercover: "RADEAU" },
  { civil: "MOTO", undercover: "SCOOTER" },
  { civil: "TAXI", undercover: "VTC" },
  // 😈 Vicieux
  { civil: "CAUCHEMAR", undercover: "HALLUCINATION" },
  { civil: "JUMEAU", undercover: "CLONE" },
  { civil: "SOSIE", undercover: "IMPOSTEUR" },
  { civil: "SURPRISE", undercover: "PIÈGE" },
  { civil: "TRAHISON", undercover: "COMPLOT" },
  { civil: "ÉPIDÉMIE", undercover: "PANDÉMIE" },
  { civil: "RÉVOLUTION", undercover: "SOUMISSION" },
  { civil: "AMNÉSIE", undercover: "COMA" },
  { civil: "FRISSON", undercover: "VERTIGE" },
  { civil: "JALOUSIE", undercover: "OBSESSION" },
  { civil: "HONTE", undercover: "REGRET" },
  { civil: "COURAGE", undercover: "LÂCHETÉ" },
  { civil: "NAUFRAGE", undercover: "NOYADE" },
  { civil: "MIRAGE", undercover: "ILLUSION D'OPTIQUE" },
  { civil: "ÉPÉE", undercover: "KATANA" },
  // 🎮 Jeux vidéo
  { civil: "MARIO", undercover: "SONIC" },
  { civil: "POKEMON", undercover: "YU-GI-OH" },
  { civil: "FORTNITE", undercover: "APEX LEGENDS" },
  { civil: "CALL OF DUTY", undercover: "BATTLEFIELD" },
  { civil: "GTA", undercover: "RED DEAD REDEMPTION" },
  { civil: "MINECRAFT", undercover: "ROBLOX" },
  { civil: "LEAGUE OF LEGENDS", undercover: "DOTA 2" },
  { civil: "FIFA", undercover: "NBA 2K" },
  { civil: "AMONG US", undercover: "LOUP-GAROU" },
  { civil: "ASSASSIN'S CREED", undercover: "PRINCE OF PERSIA" },
  { civil: "ZELDA", undercover: "ELDEN RING" },
  { civil: "OVERWATCH", undercover: "VALORANT" },
  { civil: "ANIMAL CROSSING", undercover: "LES SIMS" },
  { civil: "PUBG", undercover: "WARZONE" },
  { civil: "DARK SOULS", undercover: "SKYRIM" },
  { civil: "MORTAL KOMBAT", undercover: "STREET FIGHTER" },
  { civil: "VALORANT", undercover: "COUNTER-STRIKE" },
  // 🏥 Anatomie
  { civil: "CLAVICULE", undercover: "OMOPLATE" },
  { civil: "ESTOMAC", undercover: "FOIE" },
  { civil: "CHEVILLE", undercover: "GENOU" },
  { civil: "VIRUS", undercover: "CANCER" },
  { civil: "UTÉRUS", undercover: "CÔLON" },
  { civil: "MIGRAINE", undercover: "FIÈVRE" },
  { civil: "MYOPE", undercover: "AVEUGLE" },
  { civil: "ALLERGIE", undercover: "ADDICTION" },
  { civil: "AVC", undercover: "INFARCTUS" },
  { civil: "PARKINSON", undercover: "ALZHEIMER" },
];

io.on("connection", (socket) => {

  socket.on("createRoom", ({ name, room, emoji }) => {
    const code = generateCode();
    rooms[code] = {
      name: room,
      players: [],
      started: false,
      votes: {},
      votesSnapshot: {},
      currentPlayerIndex: 0,
      roundStartPlayerIndex: 0,
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
      disconnected: false,
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
    const room = rooms[code];
    if (!room) { socket.emit("roomNotFound"); return; }
    if (room.started) { socket.emit("gameAlreadyStarted"); return; }

    const already = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (already) {
      if (already.id === socket.id) {
        socket.join(code);
        socket.emit("updateLobby", room.players);
        return;
      }
      socket.emit("nameTaken");
      return;
    }

    if (room.players.length >= room.settings.maxPlayers) { socket.emit("roomFull"); return; }

    room.players.push({
      id: socket.id,
      name: playerName,
      emoji,
      host: false,
      eliminated: false,
      disconnected: false,
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
      player.disconnected = false;
      socket.join(code);

      // 🔥 Renvoyer l'état actuel du jeu au joueur qui rejoint
      socket.emit("startCountdown", {
        word: player.word,
        role: player.role,
        timer: room.settings.timer,
        round: room.currentRound,
        totalRounds: room.totalRounds,
        wordsPerRound: room.wordsPerRound,
        players: room.players.map(pl => ({
          name: pl.name,
          emoji: pl.emoji,
          score: pl.score,
        }))
      });

      // 🔥 Renvoyer les mots déjà joués
      socket.emit("restoreGameState", {
        words: room.words,
        currentWordIndex: room.currentWordIndex,
        wordsPerRound: room.wordsPerRound,
        players: room.players.map(pl => ({
          name: pl.name,
          emoji: pl.emoji,
          score: pl.score,
        }))
      });

      io.to(code).emit("playerReconnected", { playerName: player.name });
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

  socket.on("updateEmoji", ({ code, emoji }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    player.emoji = emoji;
    io.to(code).emit("updateLobby", room.players);
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

  socket.on("backToLobbyRequest", () => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.find(p => p.id === socket.id)
    );
    if (!roomCode) return;
    const room = rooms[roomCode];

    room.started = false;
    room.currentRound = 1;
    room.roundStartPlayerIndex = 0;
    room.votes = {};
    room.words = {};
    room.pendingReveal = null;
    if (room.turnTimer) clearTimeout(room.turnTimer);
    if (room.mrWhiteTimer) clearTimeout(room.mrWhiteTimer);

    room.players.forEach(p => {
      p.score = 0;
      p.eliminated = false;
      p.disconnected = false;
      p.role = null;
      p.word = null;
    });

    io.to(roomCode).emit("backToLobby");
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

    // 🔥 Notifier que ce joueur a voté
    const voter = room.players.find(p => p.id === socket.id);
    if (voter) {
      io.to(roomCode).emit("playerVoted", { playerName: voter.name });
    }

    const activePlayers = room.players.filter(p => !p.disconnected);
    const totalVotes = Object.keys(room.votes).length;
    if (totalVotes < activePlayers.length) return;

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
      const pts = Math.min(r.votesAgainstMrWhite, 2);
      player.score += pts;
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
      const player = room.players.find(p => p.id === socket.id);
      if (!player) continue;

      if (room.started) {
        player.disconnected = true;
        io.to(code).emit("playerDisconnected", { playerName: player.name });
        continue;
      }

      const playerIndex = room.players.findIndex(p => p.id === socket.id);
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
  });
});


function startRound(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.started = true;
  room.currentWordIndex = 0;
  room.votes = {};
  room.votesSnapshot = {};
  room.pendingReveal = null;
  room.words = {};
  room.totalRounds = room.settings.totalRounds || 10;
  room.wordsPerRound = room.settings.wordsPerRound || 3;

  const activePlayers = room.players.filter(p => !p.disconnected);
  room.roundStartPlayerIndex = room.roundStartPlayerIndex % activePlayers.length;
  room.currentPlayerIndex = 0; // 🔥 Fix : on repart de 0 à chaque round

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

  const activePlayers = room.players.filter(p => !p.disconnected);
  if (activePlayers.length === 0) return;

  if (room.currentWordIndex >= room.wordsPerRound) {
    io.to(roomCode).emit("startVote", {
      players: room.players.map(p => ({
        name: p.name,
        emoji: p.emoji,
        disconnected: p.disconnected
      }))
    });
    return;
  }

  // 🔥 Fix rotation simple et fiable
  const playerIndex = (room.roundStartPlayerIndex + room.currentPlayerIndex) % activePlayers.length;
  const player = activePlayers[playerIndex];
  if (!player) return;

  io.to(roomCode).emit("newTurn", {
    playerName: player.name,
    wordIndex: room.currentWordIndex,
    wordsPerRound: room.wordsPerRound,
    timer: room.settings.timer,
  });

  room.turnTimer = setTimeout(() => {
    player.score -= 1;

    if (!room.words[room.currentWordIndex]) room.words[room.currentWordIndex] = {};
    room.words[room.currentWordIndex][player.name] = "...";

    io.to(roomCode).emit("wordPlayed", {
      playerName: player.name,
      word: "...",
      wordIndex: room.currentWordIndex,
    });

    io.to(roomCode).emit("playerPenalty", {
      playerName: player.name,
      score: player.score,
    });

    setTimeout(() => advanceTurn(roomCode), 1500);

  }, room.settings.timer * 1000);
}


function advanceTurn(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const activePlayers = room.players.filter(p => !p.disconnected);
  if (activePlayers.length === 0) return;

  room.currentPlayerIndex++;

  // 🔥 Fix : quand tout le monde a joué → mot suivant
  if (room.currentPlayerIndex % activePlayers.length === 0) {
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
  const totalVoters = room.players.filter(p => !p.disconnected).length;
  const unanimous = votesAgainstUndercover === totalVoters;

  const mrWhitePlayer = room.players.find(p => p.role === "mrwhite");
  const whoVotedMrWhite = mrWhitePlayer
    ? Object.entries(voteMap).filter(([_, t]) => t === mrWhitePlayer.name).map(([v]) => v)
    : [];

  room.players.forEach(p => {
    if (p.role !== "undercover" && p.role !== "mrwhite") {
      if (voteMap[p.name] === undercoverName) p.score += 1;
    }
  });

  if (undercover) {
    const notVotedAgainst = room.players.filter(p =>
      p.name !== undercover.name && voteMap[p.name] !== undercover.name
    ).length;
    undercover.score += Math.min(notVotedAgainst, 2);
  }

  // 🔥 Stocker les rôles pour le récap
  const rolesMap = {};
  room.players.forEach(p => { rolesMap[p.name] = p.role; });

  room.votesSnapshot = { ...count };
  room.votes = {};

  if (mrWhitePlayer && whoVotedMrWhite.length > 0) {
    room.pendingReveal = {
      civilWord, undercoverWord, undercoverName, unanimous, voteMap, rolesMap,
      whoVotedMrWhite,
      votesAgainstMrWhite: whoVotedMrWhite.length,
      mrWhiteVotedForUndercover: voteMap[mrWhitePlayer.name] === undercoverName,
      scores: room.players.map(p => ({ name: p.name, emoji: p.emoji, score: p.score })),
      wasMrWhite: true, wasUndercover: false, eliminated: mrWhitePlayer.name,
    };

    io.to(roomCode).emit("mrWhiteGuessPhase", { playerName: mrWhitePlayer.name, timer: 30 });

    room.mrWhiteTimer = setTimeout(() => {
      room.players.forEach(p => {
        if (room.pendingReveal.whoVotedMrWhite.includes(p.name)) p.score += 1;
      });
      room.pendingReveal.mrWhiteGuessCorrect = false;
      room.pendingReveal.mrWhiteGuess = null;
      room.pendingReveal.scores = room.players.map(p => ({ name: p.name, emoji: p.emoji, score: p.score }));
      revealResult(roomCode);
    }, 31000);

    return;
  }

  io.to(roomCode).emit("voteResult", {
    wasUndercover: false, wasMrWhite: false,
    civilWord, undercoverWord, undercoverName, unanimous, voteMap, rolesMap,
    scores: room.players.map(p => ({ name: p.name, emoji: p.emoji, score: p.score })),
    mrWhiteGuessCorrect: null, mrWhiteGuess: null,
  });
}

function revealResult(roomCode) {
  const room = rooms[roomCode];
  if (!room || !room.pendingReveal) return;
  const r = room.pendingReveal;
  io.to(roomCode).emit("voteResult", {
    wasUndercover: r.wasUndercover, wasMrWhite: r.wasMrWhite,
    civilWord: r.civilWord, undercoverWord: r.undercoverWord,
    undercoverName: r.undercoverName, unanimous: r.unanimous,
    voteMap: r.voteMap || {}, rolesMap: r.rolesMap || {},
    scores: r.scores,
    mrWhiteGuessCorrect: r.mrWhiteGuessCorrect, mrWhiteGuess: r.mrWhiteGuess,
  });
  room.pendingReveal = null;
}

server.listen(3000, () => {
  console.log("http://localhost:3000");
});