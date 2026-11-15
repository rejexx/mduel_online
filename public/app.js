import {
  createGame,
  drawGame,
  isPickupAvailable,
  isPlayerPowerupAvailable,
  isValidRuleset,
  stepGame,
  WORLD
} from "./game.js";

const elements = {
  lobby: document.querySelector("#lobby"),
  gamePanel: document.querySelector("#game-panel"),
  networkStatus: document.querySelector("#network-status"),
  localGame: document.querySelector("#local-game"),
  createRoom: document.querySelector("#create-room"),
  joinForm: document.querySelector("#join-form"),
  roomCode: document.querySelector("#room-code"),
  joinRoom: document.querySelector("#join-room"),
  rulesetSelect: document.querySelector("#ruleset-select"),
  rulesetStatus: document.querySelector("#ruleset-status"),
  invitePanel: document.querySelector("#invite-panel"),
  inviteCode: document.querySelector("#invite-code"),
  inviteLink: document.querySelector("#invite-link"),
  inviteStatus: document.querySelector("#invite-status"),
  copyInvite: document.querySelector("#copy-invite"),
  canvas: document.querySelector("#game-canvas"),
  matchType: document.querySelector("#match-type"),
  matchStatus: document.querySelector("#match-status"),
  leaveGame: document.querySelector("#leave-game"),
  matchResult: document.querySelector("#match-result"),
  winnerMessage: document.querySelector("#winner-message"),
  rematch: document.querySelector("#rematch")
};

const requiredElements = Object.values(elements);
if (requiredElements.some((element) => !element)) {
  throw new Error("The game page is missing a required element.");
}

const context = elements.canvas.getContext("2d");
if (!context) {
  throw new Error("This browser could not create a 2D canvas context.");
}

const GAME_ID_PREFIX = "mduel";
const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INPUT_KEYS = ["left", "right", "up", "down", "attack"];
const VALID_PLATFORM_ROWS = [80, 144, 208, 272, 336];
const REQUIRED_PLATFORM_ANCHORS = [
  ...[0, 1, 2, 15, 16, 17].map((column) => ({ column, y: 80 })),
  ...[0, 1, 2, 3, 13, 14, 15, 16].map((column) => ({ column, y: 336 }))
];
const controls = {
  1: {
    left: "ArrowLeft",
    right: "ArrowRight",
    up: "ArrowUp",
    down: "ArrowDown",
    attack: "Enter"
  },
  2: {
    left: "KeyA",
    right: "KeyD",
    up: "KeyW",
    down: "KeyS",
    attack: "KeyQ"
  }
};
const held = { 1: new Set(), 2: new Set() };
const pressed = { 1: new Set(), 2: new Set() };
const peerInputs = { held: {}, pressed: {} };

let mode = "lobby";
let role = null;
let selectedRuleset = elements.rulesetSelect.value;
let game = createGame(selectedRuleset);
let peer = null;
let connection = null;
let animationFrame = 0;
let lastFrame = 0;
let lastSync = 0;
let lastSentInput = "";
let connectTimeout = 0;
let onlineConnected = false;
let authoritativeRulesetReceived = false;

function setLobbyStatus(message, isError = false) {
  elements.networkStatus.textContent = message;
  elements.networkStatus.classList.toggle("error", isError);
}

function setMatchStatus(message) {
  elements.matchStatus.textContent = message;
}

function rulesetDescription(ruleset) {
  return ruleset === "original"
    ? "Original (6 power-ups)"
    : "Millennium Edition (18 power-ups)";
}

function updateRulesetStatus() {
  if (mode === "online" && role === "guest") {
    elements.rulesetSelect.disabled = true;
    elements.rulesetStatus.textContent = authoritativeRulesetReceived
      ? `Host ruleset: ${rulesetDescription(game.ruleset)}`
      : "Ruleset: waiting for host selection…";
    return;
  }

  elements.rulesetSelect.disabled = false;
  elements.rulesetStatus.textContent = `Ruleset: ${rulesetDescription(game.ruleset)}`;
}

function roomPeerId(code) {
  return `${GAME_ID_PREFIX}${code.toLowerCase()}`;
}

function createRoomCode() {
  const random = new Uint8Array(6);
  crypto.getRandomValues(random);
  return [...random].map((value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join("");
}

function showLobby() {
  elements.lobby.hidden = false;
  elements.gamePanel.hidden = true;
}

function showGame() {
  elements.lobby.hidden = true;
  elements.gamePanel.hidden = false;
  elements.matchResult.hidden = true;
}

function currentInput(playerNumber) {
  const keys = held[playerNumber];
  const tap = pressed[playerNumber];
  return {
    left: keys.has("left"),
    right: keys.has("right"),
    up: keys.has("up"),
    down: keys.has("down"),
    jump: tap.has("up"),
    roll: tap.has("down"),
    attack: tap.has("attack")
  };
}

function clearPressed() {
  pressed[1].clear();
  pressed[2].clear();
  peerInputs.pressed = {};
}

function postInput() {
  if (mode !== "online" || role !== "guest" || !connection?.open) return;
  const input = {
    held: {
      left: held[2].has("left"),
      right: held[2].has("right"),
      up: held[2].has("up"),
      down: held[2].has("down")
    },
    pressed: {
      jump: pressed[2].has("up"),
      roll: pressed[2].has("down"),
      attack: pressed[2].has("attack")
    }
  };
  const serialized = JSON.stringify(input);
  if (serialized !== lastSentInput) {
    connection.send({ type: "input", ...input });
    lastSentInput = serialized;
    pressed[2].clear();
  }
}

function normalizeInput(input) {
  return {
    left: input?.held?.left === true,
    right: input?.held?.right === true,
    up: input?.held?.up === true,
    down: input?.held?.down === true,
    jump: input?.pressed?.jump === true,
    roll: input?.pressed?.roll === true,
    attack: input?.pressed?.attack === true
  };
}

function sendGameState() {
  if (!connection?.open) return;
  connection.send({ type: "state", game });
}

function showWinner() {
  if ((!game.winner && !game.matchDraw) ||
      game.deathResolutionTimer > 0 ||
      game.roundPauseTimer > 0) return;
  elements.matchResult.hidden = false;
  elements.winnerMessage.textContent = game.matchDraw
    ? "Match tied!"
    : `Player ${game.winner} wins!`;
  elements.rematch.hidden = false;
  setMatchStatus("Match over");
}

function animationLoop(timestamp) {
  if (mode === "lobby") return;

  const delta = lastFrame === 0 ? 0 : Math.min((timestamp - lastFrame) / 1000, 0.04);
  lastFrame = timestamp;

  if (mode === "local" || (mode === "online" && role === "host" && onlineConnected)) {
    const inputs = [
      currentInput(1),
      mode === "local" ? currentInput(2) : normalizeInput(peerInputs)
    ];
    stepGame(game, inputs, delta);
    clearPressed();

    if (mode === "online" && onlineConnected && timestamp - lastSync > 50) {
      sendGameState();
      lastSync = timestamp;
    }
  }

  const scale = elements.canvas.width / WORLD.width;
  drawGame(context, game, scale);
  if ((game.winner || game.matchDraw) &&
      game.deathResolutionTimer === 0 &&
      game.roundPauseTimer === 0) {
    showWinner();
  }
  animationFrame = window.requestAnimationFrame(animationLoop);
}

function beginMatch(matchMode, matchRole = null, waiting = false) {
  mode = matchMode;
  role = matchRole;
  onlineConnected = matchMode === "local" || (matchMode === "online" && !waiting);
  authoritativeRulesetReceived = matchMode !== "online" || matchRole !== "guest";
  game = createGame(
    matchMode === "online" && matchRole === "guest" ? "millennium" : selectedRuleset
  );
  updateRulesetStatus();
  lastFrame = 0;
  lastSync = 0;
  lastSentInput = "";
  held[1].clear();
  held[2].clear();
  pressed[1].clear();
  pressed[2].clear();
  peerInputs.held = {};
  peerInputs.pressed = {};

  elements.matchType.textContent = matchMode === "local"
    ? "LOCAL MATCH"
    : matchRole === "host" ? "ONLINE · HOST" : "ONLINE · GUEST";
  for (const controlGroup of document.querySelectorAll("[data-touch-player]")) {
    controlGroup.hidden = matchMode === "online" &&
      Number(controlGroup.dataset.touchPlayer) !== (matchRole === "host" ? 1 : 2);
  }
  setMatchStatus(matchMode === "local"
    ? "First to three knockouts wins"
    : waiting
      ? matchRole === "host" ? "Waiting for the other player to join…" : "Connecting to host…"
      : "Connected · first to three knockouts wins");
  showGame();
  cancelAnimationFrame(animationFrame);
  animationFrame = window.requestAnimationFrame(animationLoop);
}

function validGameSnapshot(snapshot) {
  const validPlatforms = Array.isArray(snapshot?.platforms) &&
    snapshot.platforms.length >= REQUIRED_PLATFORM_ANCHORS.length &&
    snapshot.platforms.length <= 68 &&
    snapshot.platforms.every((platform) =>
      platform &&
      Number.isInteger(platform.x) &&
      platform.x >= 32 &&
      platform.x <= 576 &&
      (platform.x - 32) % 32 === 0 &&
      VALID_PLATFORM_ROWS.includes(platform.y) &&
      platform.width === 28 &&
      platform.spawn === (platform.y === 336)
    ) &&
    REQUIRED_PLATFORM_ANCHORS.every((anchor) =>
      snapshot.platforms.some((platform) =>
        platform.x === anchor.column * 32 + 32 &&
        platform.y === anchor.y
      )
    );

  return snapshot &&
    isValidRuleset(snapshot.ruleset) &&
    Number.isFinite(snapshot.elapsed) &&
    Number.isFinite(snapshot.deathResolutionTimer) &&
    snapshot.deathResolutionTimer >= 0 &&
    snapshot.deathResolutionTimer <= 1 &&
    Number.isFinite(snapshot.roundPauseTimer) &&
    snapshot.roundPauseTimer >= 0 &&
    snapshot.roundPauseTimer <= 1 &&
    typeof snapshot.matchDraw === "boolean" &&
    Array.isArray(snapshot.players) &&
    snapshot.players.length === 2 &&
    snapshot.players.every((player) =>
      player &&
      Number.isFinite(player.x) &&
      Number.isFinite(player.y) &&
      Number.isFinite(player.vx) &&
      Number.isFinite(player.vy) &&
      Number.isInteger(player.stocks) &&
      typeof player.falling === "boolean" &&
      typeof player.disintegrating === "boolean" &&
      Number.isFinite(player.disintegrateAge) &&
      player.disintegrateAge >= 0 &&
      player.disintegrateAge <= 0.5 &&
      Number.isInteger(player.disintegrateFrame) &&
      player.disintegrateFrame >= 0 &&
      player.disintegrateFrame < 64 &&
      Number.isInteger(player.disintegrateSeed) &&
      player.disintegrateSeed >= 0 &&
      player.disintegrateSeed <= 0xffffffff &&
      typeof player.deathRegistered === "boolean" &&
      Number.isFinite(player.gunFireTimer) &&
      player.gunFireTimer >= 0 &&
      player.gunFireTimer <= 1 &&
      isPlayerPowerupAvailable(snapshot.ruleset, player.powerup) &&
      Number.isInteger(player.weaponAmmo) &&
      player.weaponAmmo >= 0 &&
      player.weaponAmmo <= 5 &&
      Number.isFinite(player.powerupTimer) &&
      player.powerupTimer >= 0 &&
      player.powerupTimer <= 8 &&
      (player.powerupTimer === 0 ||
        player.powerup === "lightning" || player.powerup === "invisibility") &&
      Number.isFinite(player.nettedTimer) &&
      player.nettedTimer >= 0 &&
      player.nettedTimer <= 5 &&
      Number.isInteger(player.nettedEscapes) &&
      player.nettedEscapes >= 0 &&
      player.nettedEscapes <= 3 &&
      Number.isFinite(player.weaseledTimer) &&
      player.weaseledTimer >= 0 &&
      player.weaseledTimer <= 3 &&
      typeof player.chuteOpen === "boolean" &&
      (!player.chuteOpen || player.powerup === "chute") &&
      (player.hookTarget === null ||
        (player.hookTarget &&
          player.powerup === "hook" &&
          (player.hookTarget.kind === "platform" || player.hookTarget.kind === "rope") &&
          Number.isFinite(player.hookTarget.x) &&
          Number.isFinite(player.hookTarget.y))) &&
      Number.isFinite(player.hookTimer) &&
      player.hookTimer >= 0 &&
      player.hookTimer <= 1.5 &&
      (player.facing === 1 || player.facing === -1)
    ) &&
    Array.isArray(snapshot.scores) &&
    snapshot.scores.length === 2 &&
    snapshot.scores.every(Number.isInteger) &&
    validPlatforms &&
    Array.isArray(snapshot.pickups) &&
    snapshot.pickups.every((pickup) =>
      pickup &&
      isPickupAvailable(snapshot.ruleset, pickup.type) &&
      Number.isFinite(pickup.x) &&
      Number.isFinite(pickup.y) &&
      Number.isFinite(pickup.vx) &&
      Number.isFinite(pickup.vy) &&
      Number.isFinite(pickup.life)
    ) &&
    Array.isArray(snapshot.projectiles) &&
    snapshot.projectiles.length <= 128 &&
    snapshot.projectiles.every((projectile) =>
      projectile &&
      ["grenade", "puck", "net", "weasel", "boomerang"].includes(projectile.type) &&
      (projectile.ownerId === 1 || projectile.ownerId === 2) &&
      Number.isFinite(projectile.x) &&
      Number.isFinite(projectile.y) &&
      Number.isFinite(projectile.vx) &&
      Number.isFinite(projectile.vy) &&
      Number.isFinite(projectile.age) &&
      projectile.age >= 0 &&
      projectile.age <= 4 &&
      Number.isFinite(projectile.life) &&
      projectile.life >= 0 &&
      projectile.life <= 4 &&
      typeof projectile.returning === "boolean" &&
      (projectile.hitPlayerId === null ||
        projectile.hitPlayerId === 1 ||
        projectile.hitPlayerId === 2)
    ) &&
    Array.isArray(snapshot.mines) &&
    snapshot.mines.length <= 32 &&
    snapshot.mines.every((mine) =>
      mine &&
      (mine.ownerId === 1 || mine.ownerId === 2) &&
      Number.isFinite(mine.x) &&
      Number.isFinite(mine.y) &&
      Number.isFinite(mine.age) &&
      mine.age >= 0 &&
      mine.age <= 18 &&
      Number.isFinite(mine.life) &&
      mine.life >= 0 &&
      mine.life <= 18
    ) &&
    Array.isArray(snapshot.explosions) &&
    snapshot.explosions.length <= 128 &&
    snapshot.explosions.every((explosion) =>
      explosion &&
      Number.isFinite(explosion.x) &&
      Number.isFinite(explosion.y) &&
      Number.isFinite(explosion.age) &&
      explosion.age >= 0 &&
      Number.isFinite(explosion.life) &&
      explosion.life > 0 &&
      explosion.life <= 0.4
    ) &&
    Array.isArray(snapshot.pickupPops) &&
    snapshot.pickupPops.every((pop) =>
      pop &&
      Number.isFinite(pop.x) &&
      Number.isFinite(pop.y) &&
      Number.isFinite(pop.age) &&
      pop.age >= 0 &&
      pop.age <= 1
    ) &&
    (snapshot.winner === null || snapshot.winner === 1 || snapshot.winner === 2);
}

function handleConnectionMessage(message) {
  if (!message || typeof message !== "object") return;

  if (role === "host" && message.type === "input") {
    peerInputs.held = {
      left: message.held?.left === true,
      right: message.held?.right === true,
      up: message.held?.up === true,
      down: message.held?.down === true
    };
    if (message.pressed?.jump === true) peerInputs.pressed.jump = true;
    if (message.pressed?.roll === true) peerInputs.pressed.roll = true;
    if (message.pressed?.attack === true) peerInputs.pressed.attack = true;
    return;
  }

  if (role === "host" && message.type === "rematch") {
    beginMatch("online", "host");
    return;
  }

  if (role === "guest" && message.type === "state" && validGameSnapshot(message.game)) {
    game = message.game;
    authoritativeRulesetReceived = true;
    updateRulesetStatus();
    if ((game.winner || game.matchDraw) &&
        game.deathResolutionTimer === 0 &&
        game.roundPauseTimer === 0) {
      showWinner();
    } else {
      elements.matchResult.hidden = true;
      setMatchStatus("Connected · first to three knockouts wins");
    }
  }
}

function onConnectionOpen(nextConnection) {
  window.clearTimeout(connectTimeout);
  connectTimeout = 0;
  connection = nextConnection;
  connection.on("data", handleConnectionMessage);
  connection.on("close", () => {
    if (connection !== nextConnection) return;
    const wasHost = role === "host";
    connection = null;
    onlineConnected = false;
    peerInputs.held = {};
    peerInputs.pressed = {};
    if (wasHost) {
      elements.invitePanel.hidden = false;
      elements.inviteStatus.textContent = "Friend disconnected. Waiting for the other player to rejoin…";
      setMatchStatus("Waiting for the other player to rejoin…");
      return;
    }

    mode = "lobby";
    role = null;
    authoritativeRulesetReceived = false;
    cancelAnimationFrame(animationFrame);
    updateRulesetStatus();
    showLobby();
    elements.invitePanel.hidden = true;
    elements.createRoom.disabled = false;
    elements.localGame.disabled = false;
    elements.joinRoom.disabled = false;
    if (peer) {
      peer.destroy();
      peer = null;
    }
    setLobbyStatus("Friend disconnected");
  });
  connection.on("error", (error) => {
    setMatchStatus(`Connection error: ${error.message}`);
  });

  onlineConnected = true;
  elements.invitePanel.hidden = role !== "host";
  if (role === "host") {
    elements.inviteStatus.textContent = "Friend connected. The game has started.";
  }
  beginMatch("online", role);
  if (role === "host") sendGameState();
}

function closePeer() {
  if (connection) {
    connection.close();
    connection = null;
  }
  if (peer) {
    peer.destroy();
    peer = null;
  }
}

function failOnline(message) {
  window.clearTimeout(connectTimeout);
  connectTimeout = 0;
  closePeer();
  mode = "lobby";
  role = null;
  onlineConnected = false;
  authoritativeRulesetReceived = false;
  updateRulesetStatus();
  showLobby();
  elements.invitePanel.hidden = true;
  elements.createRoom.disabled = false;
  elements.localGame.disabled = false;
  elements.joinRoom.disabled = false;
  setLobbyStatus(message, true);
}

function createOnlineRoom() {
  if (typeof window.Peer !== "function") {
    setLobbyStatus("Online service did not load. Check your connection and try again.", true);
    return;
  }

  const code = createRoomCode();
  role = "host";
  elements.invitePanel.hidden = true;
  elements.copyInvite.textContent = "Copy invite link";
  setLobbyStatus("Creating room…");
  elements.createRoom.disabled = true;
  elements.localGame.disabled = true;
  elements.joinRoom.disabled = true;

  peer = new window.Peer(roomPeerId(code), { secure: true });
  peer.on("open", () => {
    elements.invitePanel.hidden = false;
    elements.inviteCode.textContent = code;
    const invite = new URL(window.location.href);
    invite.searchParams.set("room", code);
    elements.inviteLink.value = invite.href;
    elements.inviteStatus.textContent = "Waiting for your friend to join…";
    elements.createRoom.disabled = true;
    beginMatch("online", "host", true);
  });
  peer.on("connection", (incoming) => {
    if (connection) {
      incoming.close();
      return;
    }
    connection = incoming;
    incoming.on("open", () => onConnectionOpen(incoming));
  });
  peer.on("error", (error) => {
    failOnline(error.type === "unavailable-id"
      ? "That invite code is already in use. Create a new room."
      : `Could not create room: ${error.message}`);
  });
}

function joinOnlineRoom(code) {
  if (typeof window.Peer !== "function") {
    setLobbyStatus("Online service did not load. Check your connection and try again.", true);
    return;
  }

  role = "guest";
  elements.invitePanel.hidden = true;
  setLobbyStatus("Connecting to room…");
  elements.joinRoom.disabled = true;
  elements.createRoom.disabled = true;
  elements.localGame.disabled = true;
  beginMatch("online", "guest", true);

  peer = new window.Peer({ secure: true });
  peer.on("open", () => {
    connection = peer.connect(roomPeerId(code), { reliable: true });
    connection.on("open", () => onConnectionOpen(connection));
    connection.on("error", (error) => failOnline(`Could not join room: ${error.message}`));
  });
  peer.on("error", (error) => {
    failOnline(error.type === "peer-unavailable"
      ? "Room not found. Check the code and try again."
      : `Could not join room: ${error.message}`);
  });
  connectTimeout = window.setTimeout(() => {
    if (!connection?.open) failOnline("Could not connect. Check the room code and try again.");
  }, 20000);
}

function leaveMatch() {
  window.clearTimeout(connectTimeout);
  connectTimeout = 0;
  cancelAnimationFrame(animationFrame);
  closePeer();
  mode = "lobby";
  role = null;
  onlineConnected = false;
  authoritativeRulesetReceived = false;
  updateRulesetStatus();
  showLobby();
  elements.invitePanel.hidden = true;
  elements.createRoom.disabled = false;
  elements.localGame.disabled = false;
  elements.joinRoom.disabled = false;
  setLobbyStatus("Ready");
}

function requestRematch() {
  if (mode === "online" && role === "guest") {
    connection?.send({ type: "rematch" });
    return;
  }
  if (mode !== "lobby") beginMatch(mode, role);
}

function submitControl(playerNumber, control, isDown) {
  if (mode === "lobby") return;
  if (mode === "online" && ((role === "host" && playerNumber !== 1) ||
      (role === "guest" && playerNumber !== 2))) return;

  if (!INPUT_KEYS.includes(control)) return;
  if (isDown) {
    if (!held[playerNumber].has(control) &&
        (control === "up" || control === "down" || control === "attack")) {
      pressed[playerNumber].add(control);
    }
    held[playerNumber].add(control);
  } else {
    held[playerNumber].delete(control);
  }
  if (role === "guest") postInput();
}

function findPlayerForKey(code) {
  for (const playerNumber of [1, 2]) {
    for (const [control, keyCode] of Object.entries(controls[playerNumber])) {
      if (keyCode === code) return { playerNumber, control };
    }
  }
  return null;
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Enter" && !event.repeat) {
    if ((game.winner || game.matchDraw) &&
        game.deathResolutionTimer === 0 &&
        game.roundPauseTimer === 0) {
      event.preventDefault();
      requestRematch();
      return;
    }
    if (mode === "lobby" && event.target === document.body) {
      event.preventDefault();
      elements.localGame.click();
      return;
    }
  }

  const mapped = findPlayerForKey(event.code);
  if (!mapped || mode === "lobby") return;
  event.preventDefault();
  submitControl(mapped.playerNumber, mapped.control, true);
});

window.addEventListener("keyup", (event) => {
  const mapped = findPlayerForKey(event.code);
  if (!mapped) return;
  submitControl(mapped.playerNumber, mapped.control, false);
});

window.addEventListener("blur", () => {
  held[1].clear();
  held[2].clear();
  if (role === "guest") postInput();
});

for (const button of document.querySelectorAll("[data-player][data-key]")) {
  const playerNumber = Number(button.dataset.player);
  const control = button.dataset.key;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    submitControl(playerNumber, control, true);
  });
  for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(eventName, () => submitControl(playerNumber, control, false));
  }
}

elements.localGame.addEventListener("click", () => {
  closePeer();
  beginMatch("local");
});
elements.rulesetSelect.addEventListener("change", () => {
  selectedRuleset = elements.rulesetSelect.value;
  game = createGame(selectedRuleset);
  updateRulesetStatus();
});
elements.createRoom.addEventListener("click", createOnlineRoom);
elements.joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = elements.roomCode.value.trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
    setLobbyStatus("Enter the 6-character room code.", true);
    elements.roomCode.focus();
    return;
  }
  joinOnlineRoom(code);
});
elements.copyInvite.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(elements.inviteLink.value);
    elements.copyInvite.textContent = "Copied";
    elements.inviteStatus.textContent = "Invite link copied. Send it to your friend.";
  } catch (error) {
    elements.inviteLink.select();
    elements.inviteStatus.textContent = "Copy is unavailable. Select and copy the invite link.";
    console.error("Could not copy the invite link.", error);
  }
});
elements.leaveGame.addEventListener("click", leaveMatch);
elements.rematch.addEventListener("click", requestRematch);

const roomFromLink = new URL(window.location.href).searchParams.get("room");
if (roomFromLink && /^[A-HJ-NP-Z2-9]{6}$/i.test(roomFromLink)) {
  joinOnlineRoom(roomFromLink.toUpperCase());
}

drawGame(context, game, elements.canvas.width / WORLD.width);
updateRulesetStatus();
