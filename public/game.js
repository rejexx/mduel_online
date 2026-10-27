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
const RUN_SPEED = 108;
const JUMP_SPEED = 300;
const MAX_FALL_SPEED = 360;
const JUMP_STANDING_FRAMES = [6, 12, 13, 14, 15, 16, 17, 21];
const JUMP_MOVING_FRAMES = [17, 18, 19, 20, 20, 21];
const JUMP_STANDING_FRAME_DURATION = 1 / 12;
const JUMP_MOVING_FRAME_DURATION = 1 / 6;
const CLIMB_UP_FRAMES = [39, 40, 41, 42];
const CLIMB_DOWN_FRAMES = [41, 40, 39, 42];
const CROUCH_FRAME = 5;
const ROLL_FRAMES = [7, 8, 9, 10, 5];
const ROLL_DURATION = 0.4;
const PIT_SURFACE_Y = 368;
const PIT_SPLASH_DURATION = 0.4;
const PIT_SINK_DURATION = 0.8;
const PIT_SPLASH_Y_OFFSET = 12;
const PIT_SPLASH_FRAMES = [4, 5, 6, 7];
const COLLISION_FRAMES = [26, 27, 26, 24];
const TRIP_FRAMES = [26, 27];
const COLLISION_RECOIL = 220;
const COLLISION_JUMP = -200;
const TRIP_SPEED = 220;
const COLLISION_DURATION = 0.28;
const PICKUP_BUBBLE_FRAMES = [0, 1, 2];
const SHIELD_FRAME = 31;
const PICKUP_TYPES = [
  { id: "gun", frame: 7, label: "GUN" },
  { id: "boots", frame: 9, label: "BOOTS" },
  { id: "shield", frame: 17, label: "SHIELD" }
];
const PICKUP_SPAWN_INTERVAL = 8;
const PICKUP_LIFETIME = 18;
const PICKUP_MAX_ACTIVE = 2;
const PROJECTILE_SPEED = 420;
const PROJECTILE_LIFETIME = 1.4;
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
const pickupSprite = new Image();
pickupSprite.src = "/assets/mduel/pickupSprites.png";
const ropeAnchorSprite = new Image();
ropeAnchorSprite.src = "/assets/mduel/rope_anchor.png";
const pitSprite = new Image();
pitSprite.src = "/assets/mduel/marshmallowSprites.png";
const pitFillerSprite = new Image();
pitFillerSprite.src = "/assets/mduel/mallow.png";
const effectSprite = new Image();
effectSprite.src = "/assets/mduel/effectSprites.gif";
let transparentEffectSprite = null;

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
    powerup: null,
    weaponAmmo: 0,
    climbing: false,
    climbAnimationDirection: 0,
    climbAnimationTime: 0,
    climbingFrame: CLIMB_UP_FRAMES[0],
    jumpAnimation: null,
    jumpAnimationTime: 0,
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
    pickups: [],
    projectiles: [],
    pickupSpawnTimer: 3,
    pickupSpawnIndex: 0,
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

function updatePlayer(player, input, delta, game) {
  if (player.inPit) {
    player.pitTimer += delta;
    player.y += player.vy * delta;
    player.vx = 0;
    player.climbAnimationDirection = 0;
    player.jumpAnimation = null;
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
  if (player.jumpAnimation) player.jumpAnimationTime += delta;
  if (player.rollTimer === 0) player.rolling = false;

  const rope = ROPES.find((item) =>
    Math.abs(player.x + PLAYER_WIDTH / 2 - item.x) < 9 &&
    player.y < item.bottom &&
    player.y + PLAYER_HEIGHT > item.top
  );
  const direction = Number(input.right === true) - Number(input.left === true);
  if (player.climbing && !rope) player.climbing = false;
  if (player.climbing && rope && direction !== 0) {
    player.climbing = false;
    player.climbAnimationDirection = 0;
    player.vx = direction * RUN_SPEED;
    player.vy = 0;
    player.facing = direction;
  } else if (!player.climbing && !stunned && !impacted && rope &&
      direction === 0 && (input.up === true || input.down === true) &&
      !player.crouching && !player.rolling) {
    player.climbing = true;
    player.x = rope.x - PLAYER_WIDTH / 2;
    player.climbAnimationDirection = input.down === true ? 1 : -1;
    player.climbAnimationTime = 0;
    player.climbingFrame = input.down === true
      ? CLIMB_DOWN_FRAMES[0]
      : CLIMB_UP_FRAMES[0];
  }
  const wantsCrouch = !player.climbing && player.grounded && input.down === true;
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
    } else if (player.climbing) {
      player.vx = 0;
    } else if (player.grounded) {
      player.vx = player.crouching ? 0 : direction * RUN_SPEED;
      if (!player.crouching && direction !== 0) player.facing = direction;
    }

    if (input.jump && player.grounded && !player.crouching && !player.rolling && !player.climbing) {
      player.vy = -JUMP_SPEED;
      player.grounded = false;
      player.jumpAnimation = player.vx === 0 ? "standing" : "moving";
      player.jumpAnimationTime = 0;
    }

    if (input.attack && player.attackCooldown <= 0 && !player.rolling) {
      player.attackCooldown = 0.48;
      if (player.powerup === "boots") {
        if (player.grounded && !player.crouching && !player.climbing) {
          player.vy = -JUMP_SPEED * 1.5;
          player.grounded = false;
          player.jumpAnimation = player.vx === 0 ? "standing" : "moving";
          player.jumpAnimationTime = 0;
        }
      } else if (player.powerup === "gun" && player.weaponAmmo > 0 &&
          player.grounded && !player.crouching) {
        game.projectiles.push({
          x: player.x + (player.facing > 0 ? PLAYER_WIDTH : 0),
          y: player.y + 46,
          vx: player.facing * PROJECTILE_SPEED,
          owner: player.id,
          life: PROJECTILE_LIFETIME
        });
        player.weaponAmmo -= 1;
        if (player.weaponAmmo === 0) player.powerup = null;
      } else if (player.powerup !== "gun") {
        player.attackTimer = 0.18;
        player.attackHit = false;
      }
    }
  } else if (player.crouching) {
    player.vx = 0;
  }

  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.attackTimer = Math.max(0, player.attackTimer - delta);

  if (player.climbing) {
    player.vx = 0;
    const climbVelocity =
      (Number(input.down === true) - Number(input.up === true)) * 155;
    const atRopeLimit = rope && (
      (player.y <= rope.top && climbVelocity < 0) ||
      (player.y >= rope.bottom - PLAYER_HEIGHT && climbVelocity > 0)
    );
    player.vy = atRopeLimit ? 0 : climbVelocity;
    if (player.vy !== 0) {
      const climbDirection = Math.sign(player.vy);
      if (player.climbAnimationDirection !== climbDirection) {
        player.climbAnimationDirection = climbDirection;
        player.climbAnimationTime = 0;
      }
      player.climbAnimationTime += delta;
      const frames = climbDirection > 0 ? CLIMB_DOWN_FRAMES : CLIMB_UP_FRAMES;
      const frameIndex = Math.floor(player.climbAnimationTime * 8) % frames.length;
      player.climbingFrame = frames[frameIndex];
    }
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
      player.jumpAnimation = null;
    }
  }
  if (!player.grounded) player.crouching = false;
  if (!player.grounded) player.rolling = false;
  if (player.grounded && player.impactTimer === 0) player.impactAnimation = null;

  if (player.climbing) {
    const activeRope = ROPES.find((item) => Math.abs(player.x + PLAYER_WIDTH / 2 - item.x) < 9);
    if (activeRope) {
      const clampedY = Math.max(
        activeRope.top,
        Math.min(activeRope.bottom - PLAYER_HEIGHT, player.y)
      );
      if (clampedY !== player.y) player.vy = 0;
      player.y = clampedY;
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

function separateFromCrouchedPlayer(standing, crouched) {
  const standingBounds = playerBounds(standing);
  const crouchedBounds = playerBounds(crouched);
  const overlapX = Math.min(standingBounds.right, crouchedBounds.right) -
    Math.max(standingBounds.left, crouchedBounds.left);
  if (overlapX <= 0) return;

  const standingCenter = (standingBounds.left + standingBounds.right) / 2;
  const crouchedCenter = (crouchedBounds.left + crouchedBounds.right) / 2;
  const direction = standingCenter < crouchedCenter ? -1 : 1;
  standing.x = Math.max(
    0,
    Math.min(
      WORLD.width - PLAYER_WIDTH,
      standing.x + direction * (overlapX + 0.1)
    )
  );
}

function launchPlayer(player, direction, verticalSpeed, animation, horizontalSpeed = COLLISION_RECOIL) {
  player.vx = direction * horizontalSpeed;
  player.vy = verticalSpeed;
  player.climbAnimationDirection = 0;
  player.jumpAnimation = null;
  player.grounded = false;
  player.crouching = false;
  player.rolling = false;
  player.rollTimer = 0;
  player.climbing = false;
  player.impactTimer = COLLISION_DURATION;
  player.impactAnimation = animation;
  player.facing = direction;
}

function shieldFaces(player, direction) {
  return player.powerup === "shield" && player.facing === direction;
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
  const firstLow = first.crouching || first.rolling;
  const secondLow = second.crouching || second.rolling;
  if (firstLow && secondLow) return;
  const croucher = firstLow ? first : secondLow ? second : null;
  const standing = croucher === first ? second : first;

  if (croucher) {
    const croucherBounds = playerBounds(croucher);
    const standingBounds = playerBounds(standing);
    const directionToCroucher = Math.sign(
      (croucherBounds.left + croucherBounds.right) / 2 -
      (standingBounds.left + standingBounds.right) / 2
    );
    if (shieldFaces(standing, directionToCroucher) && react) {
      separateFromCrouchedPlayer(standing, croucher);
      return;
    }
    if (standing.impactAnimation === "trip" && !standing.grounded) return;
    if (standing.impactTimer > 0) return;
    if (react && standing.grounded) {
      launchPlayer(
        standing,
        standing.facing,
        COLLISION_JUMP,
        "trip",
        TRIP_SPEED
      );
      return;
    }

    separateFromCrouchedPlayer(standing, croucher);
    return;
  }

  if (!react) {
    separatePlayers(first, second, direction, overlapX);
    return;
  }

  separatePlayers(first, second, direction, overlapX);
  const firstShielded = shieldFaces(first, -direction);
  const secondShielded = shieldFaces(second, direction);
  if (firstShielded || secondShielded) {
    if (!firstShielded) {
      launchPlayer(first, direction, COLLISION_JUMP, "knockback");
    }
    if (!secondShielded) {
      launchPlayer(second, -direction, COLLISION_JUMP, "knockback");
    }
    return;
  }
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
    const directionToAttacker = Math.sign(
      playerBounds.centerX - opponentBounds.centerX
    );
    if (shieldFaces(opponent, directionToAttacker)) {
      player.attackHit = true;
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

function updatePickups(game, delta) {
  game.pickupSpawnTimer -= delta;
  if (game.pickupSpawnTimer <= 0 && game.pickups.length < PICKUP_MAX_ACTIVE) {
    const spawnPoints = [
      { x: 320, y: 32, vx: 72, vy: 58 },
      { x: 20, y: 210, vx: 76, vy: -54 },
      { x: 620, y: 190, vx: -76, vy: 54 }
    ];
    const spawn = spawnPoints[game.pickupSpawnIndex % spawnPoints.length];
    const type = PICKUP_TYPES[Math.floor(Math.random() * PICKUP_TYPES.length)];
    game.pickups.push({
      type: type.id,
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx,
      vy: spawn.vy,
      life: PICKUP_LIFETIME,
      phase: game.elapsed
    });
    game.pickupSpawnIndex += 1;
    game.pickupSpawnTimer = PICKUP_SPAWN_INTERVAL;
  }

  for (const pickup of game.pickups) {
    pickup.x += pickup.vx * delta;
    pickup.y += pickup.vy * delta;
    pickup.life -= delta;
    if (pickup.x < 16 || pickup.x > WORLD.width - 16) {
      pickup.x = Math.max(16, Math.min(WORLD.width - 16, pickup.x));
      pickup.vx *= -1;
    }
    if (pickup.y < 24 || pickup.y > 320) {
      pickup.y = Math.max(24, Math.min(320, pickup.y));
      pickup.vy *= -1;
    }

    const pickupBounds = {
      left: pickup.x - 8,
      right: pickup.x + 8,
      top: pickup.y - 8,
      bottom: pickup.y + 8
    };
    for (const player of game.players) {
      if (player.inPit) continue;
      const bounds = playerBounds(player);
      if (bounds.left >= pickupBounds.right ||
          bounds.right <= pickupBounds.left ||
          bounds.top >= pickupBounds.bottom ||
          bounds.bottom <= pickupBounds.top) {
        continue;
      }

      player.powerup = pickup.type;
      player.weaponAmmo = pickup.type === "gun" ? 5 : 0;
      pickup.life = 0;
      break;
    }
  }
  game.pickups = game.pickups.filter((pickup) => pickup.life > 0);
}

function updateProjectiles(game, delta) {
  for (const projectile of game.projectiles) {
    projectile.x += projectile.vx * delta;
    projectile.life -= delta;
    const target = game.players.find((player) => player.id !== projectile.owner);
    if (!target || target.inPit || projectile.life <= 0 ||
        projectile.x < 0 || projectile.x > WORLD.width) {
      projectile.life = 0;
      continue;
    }

    const bounds = playerBounds(target);
    if (projectile.x < bounds.left || projectile.x > bounds.right ||
        projectile.y < bounds.top || projectile.y > bounds.bottom) {
      continue;
    }

    projectile.life = 0;
    if (shieldFaces(target, -Math.sign(projectile.vx))) {
      continue;
    }
    launchPlayer(target, Math.sign(projectile.vx), COLLISION_JUMP, "knockback", 300);
    target.stun = 0.15;
  }
  game.projectiles = game.projectiles.filter((projectile) => projectile.life > 0);
}

function getTransparentEffectSprite() {
  if (!effectSprite.complete || effectSprite.naturalWidth === 0) return null;
  if (transparentEffectSprite) return transparentEffectSprite;

  const canvas = document.createElement("canvas");
  canvas.width = effectSprite.naturalWidth;
  canvas.height = effectSprite.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the marshmallow splash sprite.");

  context.drawImage(effectSprite, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  // The DS palette's transparent black is flattened to near-black in the GIF.
  for (let index = 0; index < image.data.length; index += 4) {
    if (image.data[index] <= 1 &&
        image.data[index + 1] <= 1 &&
        image.data[index + 2] <= 1) {
      image.data[index + 3] = 0;
    }
  }
  context.putImageData(image, 0, 0);
  transparentEffectSprite = canvas;
  return transparentEffectSprite;
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
  updatePlayer(game.players[0], inputs[0] ?? {}, delta, game);
  updatePlayer(game.players[1], inputs[1] ?? {}, delta, game);
  const touchingPlayers = playersOverlap(game.players[0], game.players[1]);
  if (touchingPlayers) {
    resolvePlayerCollision(game.players[0], game.players[1], !game.playersTouching);
  }
  game.playersTouching = touchingPlayers;
  updatePickups(game, delta);
  updateProjectiles(game, delta);
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
    player.jumpAnimation = null;
    player.powerup = null;
    player.weaponAmmo = 0;
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
      player.vx = 0;
      player.rolling = false;
      player.crouching = false;
      player.jumpAnimation = null;
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
  if (player.inPit) {
    frame = 21;
  } else if (player.climbing) {
    frame = player.climbingFrame;
  } else if (player.impactAnimation === "trip" && !player.grounded) {
    frame = TRIP_FRAMES[Math.floor(elapsed * 12) % TRIP_FRAMES.length];
  } else if (player.impactTimer > 0) {
    const frames = player.impactAnimation === "trip" ? TRIP_FRAMES : COLLISION_FRAMES;
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
  } else if (player.jumpAnimation) {
    const frames = player.jumpAnimation === "standing"
      ? JUMP_STANDING_FRAMES
      : JUMP_MOVING_FRAMES;
    const frameDuration = player.jumpAnimation === "standing"
      ? JUMP_STANDING_FRAME_DURATION
      : JUMP_MOVING_FRAME_DURATION;
    const frameIndex = Math.min(
      frames.length - 1,
      Math.floor(player.jumpAnimationTime / frameDuration)
    );
    frame = frames[frameIndex];
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
  const sprite = getTransparentEffectSprite();
  if (!sprite) return;

  const frameIndex = Math.min(
    PIT_SPLASH_FRAMES.length - 1,
    Math.floor((splash.age / PIT_SPLASH_DURATION) * PIT_SPLASH_FRAMES.length)
  );
  const sourceY = PIT_SPLASH_FRAMES[frameIndex] * 32;
  const splashY = PIT_SURFACE_Y + PIT_SPLASH_Y_OFFSET;
  context.drawImage(
    sprite,
    0,
    sourceY,
    32,
    32,
    splash.x - 16,
    splashY - 16,
    32,
    32
  );
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
  context.canvas.dataset.player1Powerup = game.players[0].powerup ?? "";
  context.canvas.dataset.player2Powerup = game.players[1].powerup ?? "";
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, WORLD.width, WORLD.height);

  const sky = context.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, "#24263a");
  sky.addColorStop(1, "#121722");
  context.fillStyle = sky;
  context.fillRect(0, 0, WORLD.width, WORLD.height);

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

  for (const pickup of game.pickups) {
    const type = PICKUP_TYPES.find((item) => item.id === pickup.type);
    if (!type || !pickupSprite.complete || pickupSprite.naturalWidth === 0) continue;
    const bob = Math.sin((game.elapsed - pickup.phase) * 5) * 2;
    const bubbleFrame = PICKUP_BUBBLE_FRAMES[
      Math.floor(game.elapsed * 6) % PICKUP_BUBBLE_FRAMES.length
    ];
    context.drawImage(
      pickupSprite,
      0,
      bubbleFrame * 32,
      32,
      32,
      pickup.x - 8,
      pickup.y - 8 + bob,
      16,
      16
    );
    context.drawImage(
      pickupSprite,
      0,
      type.frame * 32,
      32,
      32,
      pickup.x - 8,
      pickup.y - 8 + bob,
      16,
      16
    );
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
    if (player.powerup === "shield" && !player.inPit) {
      const shieldSprite = getTransparentEffectSprite();
      if (shieldSprite) {
        context.save();
        context.translate(player.x + 32 + player.facing * 6, player.y + 29);
        context.scale(player.facing, 1);
        context.drawImage(
          shieldSprite,
          0,
          SHIELD_FRAME * 32,
          32,
          32,
          -16,
          -16,
          32,
          32
        );
        context.restore();
      }
    }
  }

  for (const projectile of game.projectiles) {
    context.fillStyle = projectile.owner === 1 ? "#9deaff" : "#ffe097";
    context.beginPath();
    context.ellipse(projectile.x, projectile.y, 5, 2.5, 0, 0, Math.PI * 2);
    context.fill();
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
  const playerOne = game.players[0];
  const playerTwo = game.players[1];
  const playerOneStatus = playerOne.powerup === "gun"
    ? `GUN ${playerOne.weaponAmmo}`
    : PICKUP_TYPES.find((item) => item.id === playerOne.powerup)?.label;
  const playerTwoStatus = playerTwo.powerup === "gun"
    ? `GUN ${playerTwo.weaponAmmo}`
    : PICKUP_TYPES.find((item) => item.id === playerTwo.powerup)?.label;
  context.fillText(`P1  ${playerOne.stocks}${playerOneStatus ? ` · ${playerOneStatus}` : ""}`, 16, 25);
  context.textAlign = "right";
  context.fillText(`P2  ${playerTwo.stocks}${playerTwoStatus ? ` · ${playerTwoStatus}` : ""}`, WORLD.width - 16, 25);
  context.textAlign = "center";
  context.font = "600 11px system-ui, sans-serif";
  context.fillStyle = "#b0b2c1";
}
