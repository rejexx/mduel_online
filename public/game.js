export const WORLD = { width: 640, height: 400 };

const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 56;
const GRAVITY = 900;
const RUN_SPEED = 96;
const JUMP_SPEED = 300;
const PLATFORMS = [
  ...[2, 3, 4, 5, 12, 13, 14, 15].map((column) => ({
    x: column * 32 + 32,
    y: 80,
    width: 32
  })),
  ...[0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 16, 17].map((column) => ({
    x: column * 32 + 32,
    y: 144,
    width: 32
  })),
  ...[0, 1, 2, 3, 7, 8, 9, 13, 14, 15, 16, 17].map((column) => ({
    x: column * 32 + 32,
    y: 208,
    width: 32
  })),
  ...[1, 2, 3, 4, 8, 9, 10, 13, 14, 15, 16].map((column) => ({
    x: column * 32 + 32,
    y: 272,
    width: 32
  })),
  ...[0, 1, 2, 3].map((column) => ({
    x: column * 32 + 48,
    y: 336,
    width: 32,
    spawn: true
  })),
  ...[13, 14, 15, 16].map((column) => ({
    x: column * 32 + 48,
    y: 336,
    width: 32,
    spawn: true
  }))
];
const ROPES = [160, 480].map((x) => ({ x, top: 8, bottom: 336 }));
const playerSprites = [1, 2].map((id) => {
  const image = new Image();
  image.src = `/assets/mduel/playerSprite${id}.png`;
  return image;
});
const platformSprite = new Image();
platformSprite.src = "/assets/mduel/main_platform.png";
const spawnPlatformSprite = new Image();
spawnPlatformSprite.src = "/assets/mduel/spawn_platform.png";
const powerupSprite = new Image();
powerupSprite.src = "/assets/mduel/powerup_spawn.png";
const ropeAnchorSprite = new Image();
ropeAnchorSprite.src = "/assets/mduel/rope_anchor.png";
const pitSprite = new Image();
pitSprite.src = "/assets/mduel/marshmallowSprites.png";
const pitFillerSprite = new Image();
pitFillerSprite.src = "/assets/mduel/mallow.png";

function createPlayer(id, x, color, facing) {
  return {
    id,
    x,
    y: 336 - PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    facing,
    color,
    grounded: true,
    stocks: 3,
    stun: 0,
    attackCooldown: 0,
    attackTimer: 0,
    attackHit: false,
    climbing: false
  };
}

export function createGame() {
  return {
    players: [
      createPlayer(1, 48, "#78c8ff", 1),
      createPlayer(2, 528, "#ffad73", -1)
    ],
    scores: [0, 0],
    winner: null,
    elapsed: 0
  };
}

function overlapsPlatform(player, platform) {
  return player.x + PLAYER_WIDTH > platform.x &&
    player.x < platform.x + platform.width;
}

function updatePlayer(player, input, opponent, delta) {
  if (player.stun > 0) {
    player.stun = Math.max(0, player.stun - delta);
  } else {
    const direction = Number(input.right === true) - Number(input.left === true);
    if (direction !== 0) {
      player.vx = direction * RUN_SPEED;
      player.facing = direction;
    } else {
      player.vx *= Math.pow(0.001, delta);
    }

    if (input.jump && player.grounded) {
      player.vy = -JUMP_SPEED;
      player.grounded = false;
    }

    if (input.attack && player.attackCooldown <= 0) {
      player.attackCooldown = 0.48;
      player.attackTimer = 0.18;
      player.attackHit = false;
    }
  }

  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.attackTimer = Math.max(0, player.attackTimer - delta);

  const rope = ROPES.find((item) =>
    Math.abs(player.x + PLAYER_WIDTH / 2 - item.x) < 9 &&
    player.y < item.bottom &&
    player.y + PLAYER_HEIGHT > item.top
  );
  player.climbing = Boolean(rope && (input.up || input.down));
  if (player.climbing) {
    player.vx = 0;
    player.vy = (Number(input.down) - Number(input.up)) * 155;
  } else {
    player.vy = Math.min(360, player.vy + GRAVITY * delta);
  }

  const previousBottom = player.y + PLAYER_HEIGHT;
  player.x += player.vx * delta;
  player.y += player.vy * delta;
  player.grounded = false;

  if (!player.climbing) {
    for (const platform of PLATFORMS) {
      const newBottom = player.y + PLAYER_HEIGHT;
      if (player.vy >= 0 &&
          previousBottom <= platform.y &&
          newBottom >= platform.y &&
          overlapsPlatform(player, platform)) {
        player.y = platform.y - PLAYER_HEIGHT;
        player.vy = 0;
        player.grounded = true;
        break;
      }
    }
  }

  if (player.climbing) {
    const activeRope = ROPES.find((item) => Math.abs(player.x + PLAYER_WIDTH / 2 - item.x) < 9);
    if (activeRope) {
      player.y = Math.max(activeRope.top, Math.min(activeRope.bottom - PLAYER_HEIGHT, player.y));
    }
  }

  if (player.x < 0) {
    player.x = 0;
    player.vx = Math.abs(player.vx) * 0.35;
    player.facing = 1;
  } else if (player.x + PLAYER_WIDTH > WORLD.width) {
    player.x = WORLD.width - PLAYER_WIDTH;
    player.vx = -Math.abs(player.vx) * 0.35;
    player.facing = -1;
  }

  if (player.attackTimer > 0 &&
      !player.attackHit &&
      Math.sign(opponent.x + PLAYER_WIDTH / 2 - (player.x + PLAYER_WIDTH / 2)) === player.facing &&
      Math.abs(opponent.x + PLAYER_WIDTH / 2 - (player.x + PLAYER_WIDTH / 2)) < 76 &&
      Math.abs(opponent.y - player.y) < 42) {
    opponent.vx = player.facing * 365;
    opponent.vy = -260;
    opponent.grounded = false;
    opponent.stun = 0.2;
    player.attackHit = true;
  }
}

export function stepGame(game, inputs, deltaSeconds) {
  if (game.winner) return game;

  const delta = Math.min(Math.max(deltaSeconds, 0), 0.04);
  game.elapsed += delta;
  updatePlayer(game.players[0], inputs[0] ?? {}, game.players[1], delta);
  updatePlayer(game.players[1], inputs[1] ?? {}, game.players[0], delta);

  for (const player of game.players) {
    if (player.y > WORLD.height + PLAYER_HEIGHT) {
      const lostPlayer = player.id - 1;
      const winner = 1 - lostPlayer;
      game.scores[winner] += 1;
      player.stocks -= 1;
      if (player.stocks <= 0) {
        game.winner = winner + 1;
      } else {
        const spawn = player.id === 1 ? 48 : 528;
        player.x = spawn;
        player.y = 336 - PLAYER_HEIGHT;
        player.vx = 0;
        player.vy = 0;
        player.facing = player.id === 1 ? 1 : -1;
        player.grounded = true;
        player.stun = 0;
      }
    }
  }

  return game;
}

function drawPlayer(context, player, elapsed) {
  const image = playerSprites[player.id - 1];
  const blink = player.stun > 0 && Math.floor(player.stun * 24) % 2 === 0;
  if (blink) return;

  let frame = 0;
  if (player.climbing) {
    frame = 39 + Math.floor(elapsed * 8) % 5;
  } else if (player.vy < -35) {
    frame = 11 + Math.floor(elapsed * 9) % 7;
  } else if (player.vy > 90) {
    frame = 21;
  } else if (Math.abs(player.vx) > 18) {
    frame = 1 + Math.floor(elapsed * 12) % 4;
  }

  if (image.complete && image.naturalWidth > 0) {
    context.save();
    if (player.facing < 0) {
      context.translate(player.x + PLAYER_WIDTH, 0);
      context.scale(-1, 1);
      context.drawImage(image, 0, frame * 64, 64, 64, 0, player.y - 4, 64, 64);
    } else {
      context.drawImage(image, 0, frame * 64, 64, 64, player.x, player.y - 4, 64, 64);
    }
    context.restore();
    return;
  }

  context.fillStyle = player.color;
  context.beginPath();
  context.ellipse(player.x + 32, player.y + 28, 18, 24, 0, 0, Math.PI * 2);
  context.fill();
}

export function drawGame(context, game, pixelRatio = 1) {
  context.canvas.dataset.player1X = game.players[0].x.toFixed(1);
  context.canvas.dataset.player2X = game.players[1].x.toFixed(1);
  context.canvas.dataset.player1Stocks = String(game.players[0].stocks);
  context.canvas.dataset.player2Stocks = String(game.players[1].stocks);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, WORLD.width, WORLD.height);

  const sky = context.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, "#24263a");
  sky.addColorStop(1, "#121722");
  context.fillStyle = sky;
  context.fillRect(0, 0, WORLD.width, WORLD.height);

  context.fillStyle = "#2a3041";
  for (let x = 22; x < WORLD.width; x += 54) {
    const height = 18 + ((x * 7) % 38);
    context.fillRect(x, 324 - height, 2, height);
  }

  for (const platform of PLATFORMS) {
    const sprite = platform.spawn ? spawnPlatformSprite : platformSprite;
    if (sprite.complete && sprite.naturalWidth > 0) {
      context.drawImage(sprite, platform.x, platform.y);
    } else {
      context.fillStyle = platform.spawn ? "#d2ba86" : "#d2ba86";
      context.fillRect(platform.x, platform.y, platform.width - 4, 8);
    }
  }

  for (const rope of ROPES) {
    context.strokeStyle = "#a57c4c";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(rope.x, rope.top);
    context.lineTo(rope.x, rope.bottom);
    context.stroke();
    if (ropeAnchorSprite.complete && ropeAnchorSprite.naturalWidth > 0) {
      context.drawImage(ropeAnchorSprite, rope.x - 5, rope.top);
    }
  }

  if (powerupSprite.complete && powerupSprite.naturalWidth > 0) {
    context.drawImage(powerupSprite, 310, 0);
    context.save();
    context.translate(0, 210);
    context.rotate(-Math.PI / 2);
    context.drawImage(powerupSprite, 0, 0);
    context.restore();
    context.save();
    context.translate(WORLD.width, 190);
    context.rotate(Math.PI / 2);
    context.drawImage(powerupSprite, 0, 0);
    context.restore();
  }

  if (pitSprite.complete && pitSprite.naturalWidth > 0) {
    const pitFrame = Math.floor(game.elapsed / 2.5) % 4;
    for (let x = 0; x < WORLD.width; x += 32) {
      context.drawImage(pitSprite, 0, pitFrame * 32, 32, 32, x, 368, 32, 32);
      context.drawImage(pitFillerSprite, x, 390);
    }
  } else {
    context.fillStyle = "#50374b";
    context.fillRect(0, 382, WORLD.width, 18);
  }

  if (!platformSprite.complete || platformSprite.naturalWidth === 0) {
    context.fillStyle = "#f08cab";
    context.fillText("THE PIT", WORLD.width / 2, 396);
  }

  for (const player of game.players) {
    drawPlayer(context, player, game.elapsed);
  }

  context.fillStyle = "#f4f0e8";
  context.font = "700 13px system-ui, sans-serif";
  context.textAlign = "left";
  context.fillText(`P1  ${game.players[0].stocks}`, 16, 25);
  context.textAlign = "right";
  context.fillText(`P2  ${game.players[1].stocks}`, WORLD.width - 16, 25);
  context.textAlign = "center";
  context.font = "600 11px system-ui, sans-serif";
  context.fillStyle = "#b0b2c1";
  context.fillText("THE PIT", WORLD.width / 2, 396);
}
