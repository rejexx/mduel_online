export const WORLD = { width: 640, height: 400 };

const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 56;
const PLAYER_BOUNDS = {
  standing: { left: 10, right: 54 },
  crouching: { left: 28, right: 54 },
  standingFeet: { left: 20, right: 44 },
  crouchingFeet: { left: 14, right: 40 }
};
const GRAVITY = 900;
const RUN_SPEED = 96;
const JUMP_SPEED = 300;
const MAX_FALL_SPEED = 360;
const CROUCH_FRAME = 5;
const ROLL_FRAMES = [7, 8, 9, 10, 5];
const ROLL_DURATION = 0.4;
const PIT_SURFACE_Y = 368;
const PIT_SPLASH_DURATION = 0.72;
const PIT_SINK_DURATION = 0.8;
const PIT_SINK_SPEED = 52;
const COLLISION_FRAMES = [26, 27, 26, 24];
const BOUNCE_FRAMES = [21, 21, 26, 27];
const COLLISION_RECOIL = 220;
const COLLISION_JUMP = -200;
const COLLISION_DURATION = 0.28;
const PLATFORMS = [
  ...[2, 3, 4, 5, 12, 13, 14, 15].map((column) => ({
    x: column * 32 + 32,
    y: 80,
    width: 28
  })),
  ...[0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 16, 17].map((column) => ({
    x: column * 32 + 32,
    y: 144,
    width: 28
  })),
  ...[0, 1, 2, 3, 7, 8, 9, 13, 14, 15, 16, 17].map((column) => ({
    x: column * 32 + 32,
    y: 208,
    width: 28
  })),
  ...[1, 2, 3, 4, 8, 9, 10, 13, 14, 15, 16].map((column) => ({
    x: column * 32 + 32,
    y: 272,
    width: 28
  })),
  ...[0, 1, 2, 3].map((column) => ({
    x: column * 32 + 48,
    y: 336,
    width: 28,
    spawn: true
  })),
  ...[13, 14, 15, 16].map((column) => ({
    x: column * 32 + 48,
    y: 336,
    width: 28,
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
    impactTimer: 0,
    impactAnimation: null,
    inPit: false,
    pitTimer: 0,
    rolling: false,
    rollTimer: 0,
    attackCooldown: 0,
    attackTimer: 0,
    attackHit: false,
    climbing: false,
    crouching: false
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
    elapsed: 0,
    playersTouching: false,
    pitSplashes: []
  };
}

function playerBounds(player) {
  const dimensions = player.crouching
    || player.rolling
    ? player.facing > 0
      ? PLAYER_BOUNDS.crouching
      : {
        left: PLAYER_WIDTH - PLAYER_BOUNDS.crouching.right,
        right: PLAYER_WIDTH - PLAYER_BOUNDS.crouching.left
      }
    : PLAYER_BOUNDS.standing;
  return {
    left: player.x + dimensions.left,
    right: player.x + dimensions.right,
    top: player.y + 36,
    bottom: player.y + PLAYER_HEIGHT
  };
}

function playerFeet(player) {
  const bounds = player.crouching || player.rolling
    ? PLAYER_BOUNDS.crouchingFeet
    : PLAYER_BOUNDS.standingFeet;
  const left = player.facing > 0
    ? bounds.left
    : PLAYER_WIDTH - bounds.right;
  const right = player.facing > 0
    ? bounds.right
    : PLAYER_WIDTH - bounds.left;
  return {
    left: player.x + left,
    right: player.x + right
  };
}

function updatePlayer(player, input, delta) {
  if (player.inPit) {
    player.pitTimer += delta;
    player.y += PIT_SINK_SPEED * delta;
    player.vx = 0;
    player.vy = PIT_SINK_SPEED;
    player.grounded = false;
    player.crouching = false;
    player.rolling = false;
    player.climbing = false;
    return;
  }

  const stunned = player.stun > 0;
  const impacted = player.impactTimer > 0;
  player.stun = Math.max(0, player.stun - delta);
  player.impactTimer = Math.max(0, player.impactTimer - delta);
  player.rollTimer = Math.max(0, player.rollTimer - delta);
  if (player.rollTimer === 0) player.rolling = false;

  const rope = ROPES.find((item) =>
    Math.abs(player.x + PLAYER_WIDTH / 2 - item.x) < 9 &&
    player.y < item.bottom &&
    player.y + PLAYER_HEIGHT > item.top
  );
  player.climbing = Boolean(rope &&
    ((input.up && player.y > rope.top) ||
      (input.down && player.y + PLAYER_HEIGHT < rope.bottom)));
  const wantsCrouch = !player.climbing && player.grounded && input.down === true;
  const direction = Number(input.right === true) - Number(input.left === true);
  if (!stunned && !impacted && player.grounded && !player.climbing &&
      input.roll === true && direction !== 0) {
    player.rolling = true;
    player.rollTimer = ROLL_DURATION;
    player.facing = direction;
  }
  player.crouching = Boolean(
    !stunned && !impacted && !player.rolling && wantsCrouch
  );

  if (!stunned && !impacted) {
    if (player.rolling) {
      player.vx = player.facing * RUN_SPEED;
    } else if (player.crouching || player.climbing) {
      player.vx = 0;
    } else {
      player.vx = direction * RUN_SPEED;
      if (direction !== 0) player.facing = direction;
    }

    if (input.jump && player.grounded && !player.crouching && !player.rolling && !player.climbing) {
      player.vy = -JUMP_SPEED;
      player.grounded = false;
    }

    if (input.attack && player.attackCooldown <= 0 && !player.rolling) {
      player.attackCooldown = 0.48;
      player.attackTimer = 0.18;
      player.attackHit = false;
    }
  } else if (player.crouching) {
    player.vx = 0;
  }

  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.attackTimer = Math.max(0, player.attackTimer - delta);

  if (player.climbing) {
    player.vx = 0;
    player.vy = (Number(input.down === true) - Number(input.up === true)) * 155;
  } else {
    player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * delta);
  }

  const previousBottom = player.y + PLAYER_HEIGHT;
  player.x += player.vx * delta;
  player.y += player.vy * delta;
  player.grounded = false;

  if (!player.climbing) {
    let landingY = Infinity;
    for (const platform of PLATFORMS) {
      const newBottom = player.y + PLAYER_HEIGHT;
      const feet = playerFeet(player);
      if (player.vy >= 0 &&
          previousBottom <= platform.y &&
          newBottom >= platform.y &&
          feet.right > platform.x &&
          feet.left < platform.x + platform.width &&
          platform.y < landingY) {
        landingY = platform.y;
      }
    }
    if (landingY !== Infinity) {
      player.y = landingY - PLAYER_HEIGHT;
      player.vy = 0;
      player.grounded = true;
      player.crouching = Boolean(!stunned && !player.rolling && input.down === true);
    }
  }
  if (!player.grounded) player.crouching = false;
  if (!player.grounded) player.rolling = false;

  if (player.climbing) {
    const activeRope = ROPES.find((item) => Math.abs(player.x + PLAYER_WIDTH / 2 - item.x) < 9);
    if (activeRope) {
      player.y = Math.max(activeRope.top, Math.min(activeRope.bottom - PLAYER_HEIGHT, player.y));
    }
  }

  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
    player.facing = 1;
  } else if (player.x + PLAYER_WIDTH > WORLD.width) {
    player.x = WORLD.width - PLAYER_WIDTH;
    player.vx = 0;
    player.facing = -1;
  }
}

function playersOverlap(first, second) {
  if (first.inPit || second.inPit) return false;

  const firstBounds = playerBounds(first);
  const secondBounds = playerBounds(second);
  return firstBounds.left < secondBounds.right &&
    firstBounds.right > secondBounds.left &&
    firstBounds.top < secondBounds.bottom &&
    firstBounds.bottom > secondBounds.top;
}

function separatePlayers(first, second, direction, overlapX) {
  first.x += direction * overlapX / 2;
  second.x -= direction * overlapX / 2;

  first.x = Math.max(0, Math.min(WORLD.width - PLAYER_WIDTH, first.x));
  second.x = Math.max(0, Math.min(WORLD.width - PLAYER_WIDTH, second.x));

  const firstBounds = playerBounds(first);
  const secondBounds = playerBounds(second);
  const remainingOverlap = Math.min(firstBounds.right, secondBounds.right) -
    Math.max(firstBounds.left, secondBounds.left);
  if (remainingOverlap <= 0) return;

  if (direction < 0) {
    const movedSecond = Math.min(
      remainingOverlap,
      WORLD.width - PLAYER_WIDTH - second.x
    );
    second.x += movedSecond;
    first.x = Math.max(0, first.x - (remainingOverlap - movedSecond));
  } else {
    const movedFirst = Math.min(
      remainingOverlap,
      WORLD.width - PLAYER_WIDTH - first.x
    );
    first.x += movedFirst;
    second.x = Math.max(0, second.x - (remainingOverlap - movedFirst));
  }
}

function launchPlayer(player, direction, verticalSpeed, animation) {
  player.vx = direction * COLLISION_RECOIL;
  player.vy = verticalSpeed;
  player.grounded = false;
  player.crouching = false;
  player.rolling = false;
  player.rollTimer = 0;
  player.climbing = false;
  player.impactTimer = COLLISION_DURATION;
  player.impactAnimation = animation;
  player.facing = direction;
}

function resolvePlayerCollision(first, second, react) {
  let firstBounds = playerBounds(first);
  let secondBounds = playerBounds(second);
  const overlapX = Math.min(firstBounds.right, secondBounds.right) -
    Math.max(firstBounds.left, secondBounds.left);
  const overlapY = Math.min(firstBounds.bottom, secondBounds.bottom) -
    Math.max(firstBounds.top, secondBounds.top);
  if (overlapX <= 0 || overlapY <= 0) return;

  const firstCenter = (firstBounds.left + firstBounds.right) / 2;
  const secondCenter = (secondBounds.left + secondBounds.right) / 2;
  const direction = firstCenter === secondCenter
    ? (first.id < second.id ? -1 : 1)
    : Math.sign(firstCenter - secondCenter);
  if (!react) {
    const firstLow = first.crouching || first.rolling;
    const secondLow = second.crouching || second.rolling;
    const croucher = firstLow ? first : secondLow ? second : null;
    const standing = croucher === first ? second : first;
    if (croucher && standing.impactTimer > 0) return;
    separatePlayers(first, second, direction, overlapX);
    return;
  }

  const firstLow = first.crouching || first.rolling;
  const secondLow = second.crouching || second.rolling;
  if (firstLow && secondLow) return;

  const croucher = firstLow ? first : secondLow ? second : null;
  const standing = croucher === first ? second : first;
  if (croucher && standing.grounded) {
    launchPlayer(
      standing,
      standing === first ? direction : -direction,
      COLLISION_JUMP,
      "pop"
    );
    return;
  }

  separatePlayers(first, second, direction, overlapX);
  launchPlayer(first, direction, COLLISION_JUMP, "knockback");
  launchPlayer(second, -direction, COLLISION_JUMP, "knockback");
}

function resolveAttacks(players) {
  for (const player of players) {
    const opponent = players.find((candidate) => candidate !== player);
    if (player.inPit || opponent.inPit) continue;
    const playerBounds = getAttackBounds(player);
    const opponentBounds = getAttackBounds(opponent);
    if (player.attackTimer <= 0 ||
        player.attackHit ||
        Math.sign(opponentBounds.centerX - playerBounds.centerX) !== player.facing ||
        Math.abs(opponentBounds.centerX - playerBounds.centerX) >= 76 ||
        Math.abs(opponentBounds.centerY - playerBounds.centerY) >= 42) {
      continue;
    }
    opponent.vx = player.facing * 365;
    opponent.vy = -260;
    opponent.grounded = false;
    opponent.crouching = false;
    opponent.rolling = false;
    opponent.stun = 0.2;
    player.attackHit = true;
  }
}

function getAttackBounds(player) {
  const bounds = playerBounds(player);
  return {
    centerX: (bounds.left + bounds.right) / 2,
    centerY: (bounds.top + bounds.bottom) / 2
  };
}

export function stepGame(game, inputs, deltaSeconds) {
  if (game.winner) return game;

  const delta = Math.min(Math.max(deltaSeconds, 0), 0.04);
  game.elapsed += delta;
  updatePlayer(game.players[0], inputs[0] ?? {}, delta);
  updatePlayer(game.players[1], inputs[1] ?? {}, delta);
  const touchingPlayers = playersOverlap(game.players[0], game.players[1]);
  if (touchingPlayers) {
    resolvePlayerCollision(game.players[0], game.players[1], !game.playersTouching);
  }
  game.playersTouching = touchingPlayers;
  resolveAttacks(game.players);

  const respawnPlayer = (player) => {
    const lostPlayer = player.id - 1;
    const winner = 1 - lostPlayer;
    game.scores[winner] += 1;
    player.stocks -= 1;
    if (player.stocks <= 0) {
      game.winner = winner + 1;
      return;
    }

    player.x = player.id === 1 ? 48 : 528;
    player.y = 336 - PLAYER_HEIGHT;
    player.vx = 0;
    player.vy = 0;
    player.facing = player.id === 1 ? 1 : -1;
    player.grounded = true;
    player.stun = 0;
    player.impactTimer = 0;
    player.impactAnimation = null;
    player.inPit = false;
    player.pitTimer = 0;
    player.rolling = false;
    player.rollTimer = 0;
    player.climbing = false;
    player.crouching = false;
  };

  for (const player of game.players) {
    if (!player.inPit && player.y + PLAYER_HEIGHT >= PIT_SURFACE_Y) {
      player.inPit = true;
      player.pitTimer = 0;
      player.y = PIT_SURFACE_Y - PLAYER_HEIGHT;
      player.vy = PIT_SINK_SPEED;
      player.vx = 0;
      player.rolling = false;
      player.crouching = false;
      game.pitSplashes.push({
        x: player.x + PLAYER_WIDTH / 2,
        age: 0
      });
    }

    if (player.inPit && player.pitTimer >= PIT_SINK_DURATION) {
      respawnPlayer(player);
    } else if (!player.inPit && player.y > WORLD.height + PLAYER_HEIGHT) {
      respawnPlayer(player);
    }
  }

  for (const splash of game.pitSplashes) splash.age += delta;
  game.pitSplashes = game.pitSplashes.filter((splash) => splash.age < PIT_SPLASH_DURATION);

  return game;
}

function drawPlayer(context, player, elapsed) {
  const image = playerSprites[player.id - 1];
  const blink = player.stun > 0 && Math.floor(player.stun * 24) % 2 === 0;
  if (blink) return;

  let frame = 0;
  if (player.climbing) {
    frame = 39 + Math.floor(elapsed * 8) % 5;
  } else if (player.impactTimer > 0) {
    const frames = player.impactAnimation === "pop" ? BOUNCE_FRAMES : COLLISION_FRAMES;
    const frameIndex = Math.min(
      frames.length - 1,
      Math.floor(((COLLISION_DURATION - player.impactTimer) / COLLISION_DURATION) * frames.length)
    );
    frame = frames[frameIndex];
  } else if (player.crouching) {
    frame = CROUCH_FRAME;
  } else if (player.rolling) {
    const frameIndex = Math.min(
      ROLL_FRAMES.length - 1,
      Math.floor(((ROLL_DURATION - player.rollTimer) / ROLL_DURATION) * ROLL_FRAMES.length)
    );
    frame = ROLL_FRAMES[frameIndex];
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
      context.drawImage(image, 0, frame * 64, 64, 64, 0, player.y, 64, 64);
    } else {
      context.drawImage(image, 0, frame * 64, 64, 64, player.x, player.y, 64, 64);
    }
    context.restore();
    return;
  }

  context.fillStyle = player.color;
  context.beginPath();
  context.ellipse(player.x + 32, player.y + 30, 18, 26, 0, 0, Math.PI * 2);
  context.fill();
}

function drawPitSplash(context, splash) {
  const progress = splash.age / PIT_SPLASH_DURATION;
  const spread = 8 + progress * 26;
  const rise = Math.sin(progress * Math.PI) * 18;
  const opacity = Math.sin(progress * Math.PI);
  const droplets = [
    { x: -1, y: -1, size: 5 },
    { x: -0.68, y: -0.72, size: 3 },
    { x: -0.35, y: -1.15, size: 4 },
    { x: 0.38, y: -1.12, size: 4 },
    { x: 0.7, y: -0.7, size: 3 },
    { x: 1, y: -0.95, size: 5 }
  ];

  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = "#fff4e5";
  context.beginPath();
  context.ellipse(splash.x, PIT_SURFACE_Y + 2, 12 + progress * 16, 4, 0, 0, Math.PI * 2);
  context.fill();

  for (const droplet of droplets) {
    const x = splash.x + droplet.x * spread;
    const y = PIT_SURFACE_Y - 2 + droplet.y * rise;
    const size = droplet.size * (1 - progress * 0.45);
    context.fillStyle = droplet.size > 4 ? "#fff8ed" : "#f5d7e8";
    context.beginPath();
    context.ellipse(x, y, size, size * 0.72, droplet.x * 0.4, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

export function drawGame(context, game, pixelRatio = 1) {
  context.canvas.dataset.player1X = game.players[0].x.toFixed(1);
  context.canvas.dataset.player2X = game.players[1].x.toFixed(1);
  context.canvas.dataset.player1Stocks = String(game.players[0].stocks);
  context.canvas.dataset.player2Stocks = String(game.players[1].stocks);
  context.canvas.dataset.player1Crouching = String(game.players[0].crouching);
  context.canvas.dataset.player2Crouching = String(game.players[1].crouching);
  context.canvas.dataset.player1Rolling = String(game.players[0].rolling);
  context.canvas.dataset.player2Rolling = String(game.players[1].rolling);
  context.canvas.dataset.player1InPit = String(game.players[0].inPit);
  context.canvas.dataset.player2InPit = String(game.players[1].inPit);
  context.canvas.dataset.player1Y = game.players[0].y.toFixed(1);
  context.canvas.dataset.player2Y = game.players[1].y.toFixed(1);
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
      context.fillRect(platform.x, platform.y, platform.width, 8);
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
      context.drawImage(pitFillerSprite, x, 390);
    }
  } else {
    context.fillStyle = "#50374b";
    context.fillRect(0, PIT_SURFACE_Y, WORLD.width, WORLD.height - PIT_SURFACE_Y);
  }

  for (const player of game.players) {
    drawPlayer(context, player, game.elapsed);
  }

  if (pitSprite.complete && pitSprite.naturalWidth > 0) {
    const pitFrame = Math.floor(game.elapsed / 2.5) % 4;
    for (let x = 0; x < WORLD.width; x += 32) {
      context.drawImage(pitSprite, 0, pitFrame * 32, 32, 32, x, PIT_SURFACE_Y, 32, 32);
    }
  }

  for (const splash of game.pitSplashes) drawPitSplash(context, splash);

  context.fillStyle = "#f4f0e8";
  context.font = "700 13px system-ui, sans-serif";
  context.textAlign = "left";
  context.fillText(`P1  ${game.players[0].stocks}`, 16, 25);
  context.textAlign = "right";
  context.fillText(`P2  ${game.players[1].stocks}`, WORLD.width - 16, 25);
  context.textAlign = "center";
  context.font = "600 11px system-ui, sans-serif";
  context.fillStyle = "#b0b2c1";
}
