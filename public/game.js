export const WORLD = { width: 640, height: 400 };

const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 56;
const PLAYER_BOUNDS = {
  standing: { left: 18, right: 46 },
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
const PIT_SPLASH_Y_OFFSET = 12;
const PIT_SPLASH_FRAMES = [4, 5, 6, 7];
const PIT_FRAME_DURATION = 1.25;
const COLLISION_FRAMES = [26, 27, 26, 24];
const TRIP_FRAMES = [26, 27];
const GUN_FIRE_FRAMES = [30, 31, 31, 30];
const GUN_FIRE_FRAME_DURATION = 1 / 15;
const GUN_FIRE_DURATION = GUN_FIRE_FRAMES.length * GUN_FIRE_FRAME_DURATION;
const GUN_HEIGHT = 16;
const DEATH_RESOLUTION_DELAY = 1;
const DEATH_SINK_SPEED = MAX_FALL_SPEED * 0.9;
const DISINTEGRATE_DURATION = 0.5;
const DISINTEGRATE_FALL_DURATION = 0.3;
const DISINTEGRATE_FALL_FRAMES = [17, 18, 19, 20, 20, 21];
const DISINTEGRATE_PIXEL_SIZE = 4;
const DISINTEGRATE_PIXEL_COUNT =
  (PLAYER_WIDTH / DISINTEGRATE_PIXEL_SIZE) ** 2;
const ROUND_PAUSE_DURATION = 1;
const POWERUP_DURATION = 8;
const INVISIBILITY_DURATION = 8;
const PROJECTILE_LIFETIME = 4;
const PROJECTILE_SPEED = 300;
const GRENADE_SPEED = 240;
const MINE_ARM_DELAY = 0.45;
const MINE_LIFETIME = 18;
const NET_DURATION = 5;
const HOOK_RANGE = 224;
const HOOK_SPEED = 420;
const CHUTE_GRAVITY = 210;
const CHUTE_MAX_FALL_SPEED = 120;
const MAGNET_RANGE = 230;
const COLLISION_RECOIL = 220;
const COLLISION_JUMP = -200;
const TRIP_SPEED = 220;
const COLLISION_DURATION = 0.28;
const PICKUP_BUBBLE_FRAMES = [0, 1, 2];
const PICKUP_BUBBLE_ANIMATION_FPS = 10;
const PICKUP_POP_FRAMES = [16, 17];
const PICKUP_POP_FRAME_DURATION = 1 / 15;
const PICKUP_POP_DURATION = PICKUP_POP_FRAMES.length * PICKUP_POP_FRAME_DURATION;
const SHIELD_FRAME = 31;
const PICKUP_TYPES = [
  { id: "skull", frame: 3, label: "SKULL" },
  { id: "lightning", frame: 4, label: "1000V" },
  { id: "invisibility", frame: 5, label: "INVIS" },
  { id: "mine", frame: 6, label: "MINE" },
  { id: "gun", frame: 7, label: "GUN" },
  { id: "tnt", frame: 8, label: "TNT" },
  { id: "boots", frame: 9, label: "BOOTS" },
  { id: "grenade", frame: 10, label: "GRENADE" },
  { id: "puck", frame: 11, label: "PUCK" },
  { id: "chute", frame: 12, label: "CHUTE" },
  { id: "hook", frame: 13, label: "HOOK" },
  { id: "warp", frame: 14, label: "WARP" },
  { id: "magnet", frame: 15, label: "MAGNET" },
  { id: "net", frame: 16, label: "NET" },
  { id: "shield", frame: 17, label: "SHIELD" },
  { id: "dunce", frame: 18, label: "DUNCE" },
  { id: "weasel", frame: 19, label: "WEASEL" },
  { id: "boomerang", frame: 20, label: "BOOMERANG" }
];
const ORIGINAL_PICKUP_IDS = [
  "skull",
  "lightning",
  "invisibility",
  "mine",
  "gun",
  "tnt"
];
const NON_EQUIPPABLE_PICKUP_IDS = ["skull", "tnt"];
const PICKUP_TYPES_BY_RULESET = {
  original: PICKUP_TYPES.filter((pickup) => ORIGINAL_PICKUP_IDS.includes(pickup.id)),
  millennium: PICKUP_TYPES
};
const PICKUP_SPAWN_INTERVAL_MIN_TENTHS = 26;
const PICKUP_SPAWN_INTERVAL_MAX_TENTHS = 50;
const PICKUP_LIFETIME_MIN = 10;
const PICKUP_LIFETIME_MAX = 25;
const PICKUP_MAX_ACTIVE = 3;
const PICKUP_SPEED_MIN = 64;
const PICKUP_SPEED_MAX = 144;
const REFERENCE_TICKS_PER_SECOND = 60;
const REFERENCE_SPEED_SCALE = 1 / 256;
const REFERENCE_WORLD_WIDTH = 256;
const REFERENCE_WORLD_HEIGHT = 192;
const PICKUP_BOUNDS = {
  left: 20,
  right: WORLD.width - 20,
  top: 17,
  bottom: 367
};
const PICKUP_RADIUS = 16;
const PLATFORM_TILE_WIDTH = 28;
const PLATFORM_GRID_COLUMNS = 18;
const PLATFORM_ROWS = [144, 208, 272];
const PLATFORM_SPAWN_COLUMNS = [0, 1, 2, 3, 13, 14, 15, 16];
const PLATFORM_EDGE_COLUMNS = [0, 1, 2, 15, 16, 17];

function generatePlatforms() {
  const platforms = [];
  const addPlatform = (column, y, spawn = false) => {
    platforms.push({
      x: column * 32 + 32,
      y,
      width: PLATFORM_TILE_WIDTH,
      spawn
    });
  };

  for (const column of PLATFORM_EDGE_COLUMNS) addPlatform(column, 80);
  for (const column of PLATFORM_SPAWN_COLUMNS) addPlatform(column, 336, true);

  for (const y of PLATFORM_ROWS) {
    let consecutiveGaps = 0;
    for (let column = 0; column < PLATFORM_GRID_COLUMNS; column += 1) {
      const placePlatform = consecutiveGaps >= 2 || Math.random() < 0.7;
      if (placePlatform) {
        addPlatform(column, y);
        consecutiveGaps = 0;
      } else {
        consecutiveGaps += 1;
      }
    }
  }

  return platforms;
}

const ROPES = [160, 480].map((x) => ({ x, top: 8, bottom: 336 }));
const playerSprites = [1, 2].map((id) => {
  const image = new Image();
  image.src = `/assets/mduel/playerSprite${id}.png`;
  return image;
});
const invisiblePlayerSprite = new Image();
invisiblePlayerSprite.src = "/assets/mduel/playerSpriteInvisible.png";
const lightningPlayerSprite = new Image();
lightningPlayerSprite.src = "/assets/mduel/playerSprite1000V.png";
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
    falling: false,
    inPit: false,
    pitTimer: 0,
    rolling: false,
    rollTimer: 0,
    attackCooldown: 0,
    attackTimer: 0,
    attackHit: false,
    gunFireTimer: 0,
    disintegrating: false,
    disintegrateAge: 0,
    disintegrateFrame: 0,
    disintegrateSeed: 0,
    deathRegistered: false,
    powerup: null,
    weaponAmmo: 0,
    powerupTimer: 0,
    nettedTimer: 0,
    nettedEscapes: 0,
    weaseledTimer: 0,
    chuteOpen: false,
    hookTarget: null,
    hookTimer: 0,
    climbing: false,
    climbAnimationDirection: 0,
    climbAnimationTime: 0,
    climbingFrame: CLIMB_UP_FRAMES[0],
    jumpAnimation: null,
    jumpAnimationTime: 0,
    crouching: false
  };
}

function pickupTypesForRuleset(ruleset) {
  if (!isValidRuleset(ruleset)) {
    throw new RangeError(`Unsupported ruleset: ${ruleset}`);
  }
  const pickupTypes = PICKUP_TYPES_BY_RULESET[ruleset];
  return pickupTypes;
}

export function isValidRuleset(ruleset) {
  return Object.prototype.hasOwnProperty.call(PICKUP_TYPES_BY_RULESET, ruleset);
}

export function isPickupAvailable(ruleset, pickupType) {
  return isValidRuleset(ruleset) &&
    typeof pickupType === "string" &&
    pickupTypesForRuleset(ruleset).some((pickup) => pickup.id === pickupType);
}

export function isPlayerPowerupAvailable(ruleset, powerup) {
  return isValidRuleset(ruleset) &&
    (powerup === null ||
      (isPickupAvailable(ruleset, powerup) &&
        !NON_EQUIPPABLE_PICKUP_IDS.includes(powerup)));
}

export function createGame(ruleset = "millennium") {
  pickupTypesForRuleset(ruleset);
  return {
    ruleset,
    platforms: generatePlatforms(),
    players: [
      createPlayer(1, 48, "#78c8ff", 1),
      createPlayer(2, 528, "#ffad73", -1)
    ],
    scores: [0, 0],
    winner: null,
    matchDraw: false,
    elapsed: 0,
    deathResolutionTimer: 0,
    roundPauseTimer: 0,
    playersTouching: false,
    pickups: [],
    pickupPops: [],
    projectiles: [],
    mines: [],
    explosions: [],
    pickupSpawnTimer: 3,
    pickupSpawnIndex: 0,
    pitSplashes: []
  };
}

const disintegrationCanvases = [];

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

function bounceOffWall(player, direction) {
  player.vx = -player.vx;
  player.facing = direction;
  player.grounded = false;
  player.falling = true;
  player.jumpAnimation = null;
  player.rolling = false;
  player.rollTimer = 0;
  player.climbAnimationDirection = 0;
  player.climbing = false;
  player.crouching = false;
  player.impactTimer = COLLISION_DURATION;
  player.impactAnimation = "wall";
}

function updatePlayer(player, input, delta, game) {
  player.gunFireTimer = Math.max(0, player.gunFireTimer - delta);
  player.powerupTimer = Math.max(0, player.powerupTimer - delta);
  player.nettedTimer = Math.max(0, player.nettedTimer - delta);
  player.weaseledTimer = Math.max(0, player.weaseledTimer - delta);
  player.hookTimer = Math.max(0, player.hookTimer - delta);
  if (player.hookTimer === 0) player.hookTarget = null;
  if (player.powerupTimer === 0 &&
      (player.powerup === "lightning" || player.powerup === "invisibility")) {
    player.powerup = null;
  }
  if (player.grounded) player.chuteOpen = false;
  if (player.disintegrating) {
    player.disintegrateAge = Math.min(
      DISINTEGRATE_DURATION,
      player.disintegrateAge + delta
    );
    const frameIndex = Math.min(
      DISINTEGRATE_FALL_FRAMES.length - 1,
      Math.floor(
        player.disintegrateAge /
        (DISINTEGRATE_FALL_DURATION / DISINTEGRATE_FALL_FRAMES.length)
      )
    );
    player.disintegrateFrame = DISINTEGRATE_FALL_FRAMES[frameIndex];
  }
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
    player.hookTarget = null;
    return;
  }

  const stunned = player.stun > 0;
  const netted = player.nettedTimer > 0;
  const impacted = player.impactTimer > 0;
  const firingLocked = player.gunFireTimer > 0;
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
  let direction = Number(input.right === true) - Number(input.left === true);
  if (player.weaseledTimer > 0) direction *= -1;
  if (netted && input.jump === true) {
    player.nettedEscapes = Math.max(0, player.nettedEscapes - 1);
    if (player.grounded) player.vy = -120;
    if (player.nettedEscapes === 0) player.nettedTimer = 0;
  }
  if (player.climbing && !rope) player.climbing = false;
  if (player.climbing && rope && direction !== 0) {
    player.climbing = false;
    player.climbAnimationDirection = 0;
    player.vx = direction * RUN_SPEED;
    player.vy = 0;
    player.facing = direction;
  } else if (!netted && !firingLocked && !player.climbing &&
      !stunned && !impacted && rope &&
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
  const wantsCrouch = !netted && !firingLocked && !player.climbing &&
    player.grounded && input.down === true;
  if (!netted && !firingLocked && !stunned && !impacted && player.grounded && !player.climbing &&
      input.roll === true && direction !== 0) {
    player.rolling = true;
    player.rollTimer = ROLL_DURATION;
    player.facing = direction;
  }
  player.crouching = Boolean(
    !netted && !stunned && !impacted && !player.rolling && wantsCrouch
  );

  if (player.nettedTimer > 0) {
    player.vx *= Math.max(0, 1 - delta * 6);
  } else if (!stunned && !impacted) {
    if (firingLocked) {
      player.vx = 0;
    } else if (player.hookTarget) {
      player.climbing = false;
    } else if (player.rolling) {
      player.vx = player.facing * RUN_SPEED;
    } else if (player.climbing) {
      player.vx = 0;
    } else if (player.grounded) {
      player.vx = player.crouching ? 0 : direction * RUN_SPEED;
      if (!player.crouching && direction !== 0) player.facing = direction;
    }

    if (!player.hookTarget && !firingLocked && input.jump && player.grounded &&
        !player.crouching && !player.rolling && !player.climbing) {
      player.vy = -JUMP_SPEED;
      player.grounded = false;
      player.falling = false;
      player.jumpAnimation = player.vx === 0 ? "standing" : "moving";
      player.jumpAnimationTime = 0;
    }

    if (!player.hookTarget && !firingLocked && input.attack &&
        player.attackCooldown <= 0 && !player.rolling && !netted) {
      player.attackCooldown = 0.48;
      if (!activatePowerup(game, player)) {
        player.attackTimer = 0.18;
        player.attackHit = false;
      }
    }
  } else if (player.crouching) {
    player.vx = 0;
  }

  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.attackTimer = Math.max(0, player.attackTimer - delta);

  const hookTarget = player.hookTarget;
  let hookArrived = false;
  if (hookTarget) {
    const dx = hookTarget.x - player.x;
    const dy = hookTarget.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= HOOK_SPEED * delta || distance === 0) {
      player.vx = 0;
      player.vy = 0;
      hookArrived = true;
    } else {
      player.vx = dx / distance * HOOK_SPEED;
      player.vy = dy / distance * HOOK_SPEED;
    }
  } else if (player.climbing) {
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
  } else if (player.chuteOpen && player.vy >= 0) {
    player.vy = Math.min(CHUTE_MAX_FALL_SPEED, player.vy + CHUTE_GRAVITY * delta);
  } else {
    player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * delta);
  }

  const previousBottom = player.y + PLAYER_HEIGHT;
  player.x += player.vx * delta;
  player.y += player.vy * delta;
  player.grounded = false;

  if (!player.climbing) {
    let landingY = Infinity;
    for (const platform of game.platforms) {
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
    if (hookArrived) {
      player.x = hookTarget.x;
      player.y = hookTarget.y;
      player.vx = 0;
      player.vy = 0;
      player.hookTarget = null;
      player.hookTimer = 0;
      if (hookTarget.kind === "rope") {
        player.climbing = true;
        player.grounded = false;
      } else {
        player.grounded = true;
        player.falling = false;
      }
    }
    if (landingY !== Infinity) {
      const fallDirection = Math.sign(player.vx) || player.facing;
      player.y = landingY - PLAYER_HEIGHT;
      player.vy = 0;
      player.grounded = true;
      player.crouching = Boolean(!stunned && !player.rolling && input.down === true);
      player.jumpAnimation = null;
      if (player.falling) {
        player.falling = false;
        player.impactTimer = 0;
        player.impactAnimation = null;
        player.facing = fallDirection;
        player.rolling = true;
        player.rollTimer = ROLL_DURATION;
      }
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
    if (player.vx < 0) {
      bounceOffWall(player, 1);
    } else {
      player.vx = 0;
    }
  } else if (player.x + PLAYER_WIDTH > WORLD.width) {
    player.x = WORLD.width - PLAYER_WIDTH;
    if (player.vx > 0) {
      bounceOffWall(player, -1);
    } else {
      player.vx = 0;
    }
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

function separatePushedPlayer(moving, pushed) {
  const movingBounds = playerBounds(moving);
  const pushedBounds = playerBounds(pushed);
  const overlapX = Math.min(movingBounds.right, pushedBounds.right) -
    Math.max(movingBounds.left, pushedBounds.left);
  if (overlapX <= 0) return;

  const movingCenter = (movingBounds.left + movingBounds.right) / 2;
  const pushedCenter = (pushedBounds.left + pushedBounds.right) / 2;
  const direction = pushedCenter === movingCenter
    ? Math.sign(moving.vx)
    : pushedCenter > movingCenter ? 1 : -1;
  pushed.x = Math.max(
    0,
    Math.min(
      WORLD.width - PLAYER_WIDTH,
      pushed.x + direction * (overlapX + 0.1)
    )
  );
}

function launchPlayer(player, direction, verticalSpeed, animation, horizontalSpeed = COLLISION_RECOIL) {
  player.vx = direction * horizontalSpeed;
  player.vy = verticalSpeed;
  player.climbAnimationDirection = 0;
  player.jumpAnimation = null;
  player.grounded = false;
  player.falling = true;
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

function fireGun(game, player) {
  player.vx = 0;
  player.gunFireTimer = GUN_FIRE_DURATION;
  player.weaponAmmo -= 1;
  if (player.weaponAmmo === 0) player.powerup = null;

  const target = game.players.find((candidate) => candidate.id !== player.id);
  if (!target || target.inPit) return;

  const sourceBounds = playerBounds(player);
  const targetBounds = playerBounds(target);
  const targetIsAhead = player.facing > 0
    ? targetBounds.right > sourceBounds.right
    : targetBounds.left < sourceBounds.left;
  const beamY = player.y + PLAYER_HEIGHT - GUN_HEIGHT;
  const targetVerticalBounds = target.crouching || target.rolling
    ? { ...targetBounds, top: target.y + 28 }
    : targetBounds;
  if (!targetIsAhead ||
      beamY < targetVerticalBounds.top ||
      beamY > targetVerticalBounds.bottom ||
      shieldFaces(target, -player.facing)) {
    return;
  }

  knockOut(game, target, true);
}

function clearPowerup(player) {
  player.powerup = null;
  player.weaponAmmo = 0;
  player.powerupTimer = 0;
  player.chuteOpen = false;
  player.hookTarget = null;
  player.hookTimer = 0;
}

function spawnProjectile(game, player, type, speed, verticalSpeed, life = PROJECTILE_LIFETIME) {
  game.projectiles.push({
    type,
    ownerId: player.id,
    x: player.x + PLAYER_WIDTH / 2 + player.facing * 22,
    y: player.y + 24,
    vx: player.facing * speed,
    vy: verticalSpeed,
    age: 0,
    life,
    returning: false,
    hitPlayerId: null
  });
}

function findHookTarget(game, player) {
  const playerCenter = player.x + PLAYER_WIDTH / 2;
  const candidates = [];
  for (const rope of ROPES) {
    const dx = rope.x - playerCenter;
    if (dx * player.facing <= 0) continue;
    const y = Math.max(rope.top, Math.min(rope.bottom - PLAYER_HEIGHT, player.y));
    const distance = Math.hypot(dx, y - player.y);
    if (distance <= HOOK_RANGE) {
      candidates.push({ x: rope.x - PLAYER_WIDTH / 2, y, kind: "rope", distance });
    }
  }
  for (const platform of game.platforms) {
    const x = platform.x + platform.width / 2 - PLAYER_WIDTH / 2;
    const dx = x + PLAYER_WIDTH / 2 - playerCenter;
    if (dx * player.facing <= 0) continue;
    const y = platform.y - PLAYER_HEIGHT;
    const distance = Math.hypot(dx, y - player.y);
    if (distance > 18 && distance <= HOOK_RANGE) {
      candidates.push({ x, y, kind: "platform", distance });
    }
  }
  candidates.sort((first, second) => first.distance - second.distance);
  if (candidates.length === 0) return null;
  const { distance, ...target } = candidates[0];
  return target;
}

function warpPlayer(game, player) {
  const opponent = game.players.find((candidate) => candidate !== player);
  const destinations = game.platforms
    .map((platform) => ({
      x: platform.x + platform.width / 2 - PLAYER_WIDTH / 2,
      y: platform.y - PLAYER_HEIGHT
    }))
    .filter((destination) =>
      opponent.inPit ||
      Math.abs(destination.x - opponent.x) > PLAYER_WIDTH + 20
    );
  if (destinations.length === 0) return false;
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  game.explosions.push({ x: player.x + 32, y: player.y + 28, age: 0, life: 0.3 });
  player.x = destination.x;
  player.y = destination.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.falling = false;
  player.climbing = false;
  player.rolling = false;
  player.crouching = false;
  player.impactTimer = 0;
  player.impactAnimation = null;
  game.explosions.push({ x: player.x + 32, y: player.y + 28, age: 0, life: 0.3 });
  return true;
}

function activatePowerup(game, player) {
  switch (player.powerup) {
    case "boots":
      if (player.grounded && !player.crouching && !player.climbing) {
        player.vy = -JUMP_SPEED * 1.5;
        player.grounded = false;
        player.falling = false;
        player.jumpAnimation = player.vx === 0 ? "standing" : "moving";
        player.jumpAnimationTime = 0;
      }
      return true;
    case "gun":
      if (player.weaponAmmo > 0 && player.grounded &&
          !player.crouching && !player.climbing) {
        fireGun(game, player);
      }
      return true;
    case "mine":
      if (player.grounded) {
        game.mines.push({
          ownerId: player.id,
          x: player.x + PLAYER_WIDTH / 2,
          y: player.y + PLAYER_HEIGHT - 4,
          age: 0,
          life: MINE_LIFETIME
        });
        clearPowerup(player);
      }
      return true;
    case "grenade":
      spawnProjectile(game, player, "grenade", GRENADE_SPEED, -190, 2.4);
      clearPowerup(player);
      return true;
    case "puck":
      spawnProjectile(game, player, "puck", 390, -25, 3.5);
      clearPowerup(player);
      return true;
    case "net":
      spawnProjectile(game, player, "net", PROJECTILE_SPEED, -30, 2.8);
      clearPowerup(player);
      return true;
    case "weasel":
      spawnProjectile(game, player, "weasel", PROJECTILE_SPEED, -40, 3);
      clearPowerup(player);
      return true;
    case "boomerang":
      spawnProjectile(game, player, "boomerang", PROJECTILE_SPEED, -55, 4);
      clearPowerup(player);
      return true;
    case "chute":
      if (!player.grounded) player.chuteOpen = true;
      return true;
    case "hook": {
      const target = findHookTarget(game, player);
      if (target) {
        player.hookTarget = target;
        player.hookTimer = 1.5;
        player.grounded = false;
        player.climbing = false;
        player.falling = true;
      }
      return true;
    }
    case "warp":
      if (warpPlayer(game, player)) clearPowerup(player);
      return true;
    case "magnet": {
      const target = game.players.find((candidate) => candidate !== player);
      const targetCenter = target.x + PLAYER_WIDTH / 2;
      const distance = Math.abs(targetCenter - (player.x + PLAYER_WIDTH / 2));
      if (distance <= MAGNET_RANGE &&
          Math.sign(targetCenter - (player.x + PLAYER_WIDTH / 2)) === player.facing &&
          !shieldFaces(target, -player.facing)) {
        clearPowerup(target);
      }
      return true;
    }
    default:
      return false;
  }
}

function resolvePlayerCollision(game, first, second, react) {
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
  const firstHasLightning = first.powerup === "lightning";
  const secondHasLightning = second.powerup === "lightning";
  if (firstHasLightning && secondHasLightning) {
    clearPowerup(first);
    clearPowerup(second);
  } else if (firstHasLightning &&
      !shieldFaces(second, direction)) {
    knockOut(game, second);
    return;
  } else if (secondHasLightning &&
      !shieldFaces(first, -direction)) {
    knockOut(game, first);
    return;
  }

  const firstLow = first.crouching || first.rolling;
  const secondLow = second.crouching || second.rolling;
  const firstMoving = Math.abs(first.vx) > 18;
  const secondMoving = Math.abs(second.vx) > 18;
  if (firstLow && secondLow && !firstMoving && !secondMoving) return;
  const croucher = firstLow === secondLow
    ? null
    : firstLow ? first : second;
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
        -JUMP_SPEED,
        "trip",
        TRIP_SPEED
      );
      if (firstMoving && secondMoving) {
        launchPlayer(
          croucher,
          croucher === first ? direction : -direction,
          COLLISION_JUMP,
          "knockback"
        );
      }
      return;
    }

    separateFromCrouchedPlayer(standing, croucher);
    return;
  }

  if (!react) {
    separatePlayers(first, second, direction, overlapX);
    return;
  }

  const firstShielded = shieldFaces(first, -direction);
  const secondShielded = shieldFaces(second, direction);
  if (firstShielded || secondShielded) {
    separatePlayers(first, second, direction, overlapX);
    if (!firstShielded) {
      launchPlayer(first, direction, COLLISION_JUMP, "knockback");
    }
    if (!secondShielded) {
      launchPlayer(second, -direction, COLLISION_JUMP, "knockback");
    }
    return;
  }

  if (firstMoving !== secondMoving) {
    const moving = firstMoving ? first : second;
    const pushed = firstMoving ? second : first;
    const movingBounds = playerBounds(moving);
    const pushedBounds = playerBounds(pushed);
    const movingCenter = (movingBounds.left + movingBounds.right) / 2;
    const pushedCenter = (pushedBounds.left + pushedBounds.right) / 2;
    const directionToPushed = pushedCenter === movingCenter
      ? Math.sign(moving.vx)
      : Math.sign(pushedCenter - movingCenter);
    if (Math.sign(moving.vx) === directionToPushed) {
      separatePushedPlayer(moving, pushed);
      launchPlayer(pushed, directionToPushed, COLLISION_JUMP, "knockback");
    } else {
      separatePlayers(first, second, direction, overlapX);
    }
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
    const directionToAttacker = Math.sign(
      playerBounds.centerX - opponentBounds.centerX
    );
    if (shieldFaces(opponent, directionToAttacker)) {
      player.attackHit = true;
      continue;
    }
    opponent.vx = player.facing * 365;
    opponent.vy = -260;
    opponent.falling = true;
    opponent.facing = Math.sign(opponent.vx);
    opponent.grounded = false;
    opponent.crouching = false;
    opponent.rolling = false;
    opponent.stun = 0.2;
    player.attackHit = true;
  }
}

function detonateGrenade(game, projectile) {
  const radius = 92;
  game.explosions.push({
    x: projectile.x,
    y: projectile.y,
    age: 0,
    life: 0.38
  });
  for (const player of game.players) {
    if (player.inPit) continue;
    const centerX = player.x + PLAYER_WIDTH / 2;
    const centerY = player.y + PLAYER_HEIGHT / 2;
    const distance = Math.hypot(centerX - projectile.x, centerY - projectile.y);
    if (distance > radius) continue;
    const direction = Math.sign(centerX - projectile.x) || (player.id === projectile.ownerId ? -1 : 1);
    if (shieldFaces(player, Math.sign(projectile.x - centerX))) continue;
    launchPlayer(player, direction, -220, "explosion", 280);
    player.stun = Math.max(player.stun, 0.16);
  }
}

function hitByProjectile(game, projectile, target) {
  const direction = Math.sign(target.x + PLAYER_WIDTH / 2 - projectile.x) ||
    (projectile.vx < 0 ? -1 : 1);
  if (shieldFaces(target, -direction)) {
    if (projectile.type === "boomerang") {
      projectile.returning = true;
      projectile.hitPlayerId = target.id;
      return false;
    }
    return true;
  }
  if (projectile.type === "grenade") {
    detonateGrenade(game, projectile);
    return true;
  }
  if (projectile.type === "net") {
    target.nettedTimer = NET_DURATION;
    target.nettedEscapes = 3;
    target.climbing = false;
    target.hookTarget = null;
    target.hookTimer = 0;
    target.rolling = false;
    target.crouching = false;
    target.vx *= 0.35;
    return true;
  }
  if (projectile.type === "weasel") {
    target.weaseledTimer = 3;
    target.stun = Math.max(target.stun, 0.12);
    launchPlayer(target, direction, -125, "weasel", 165);
    return true;
  }
  if (projectile.type === "boomerang") {
    if (projectile.hitPlayerId !== target.id) {
      launchPlayer(target, direction, -170, "boomerang", 230);
      projectile.hitPlayerId = target.id;
    }
    projectile.returning = true;
    return false;
  }

  launchPlayer(
    target,
    direction,
    projectile.type === "puck" ? -205 : -160,
    "projectile",
    projectile.type === "puck" ? 300 : 220
  );
  return true;
}

function updateProjectiles(game, delta) {
  const remaining = [];
  for (const projectile of game.projectiles) {
    const owner = game.players.find((player) => player.id === projectile.ownerId);
    projectile.age += delta;
    projectile.life -= delta;

    if (projectile.type === "boomerang" && projectile.age >= 0.8) {
      projectile.returning = true;
    }
    if (projectile.returning && owner && !owner.inPit) {
      const dx = owner.x + PLAYER_WIDTH / 2 - projectile.x;
      const dy = owner.y + PLAYER_HEIGHT / 2 - projectile.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 18 || projectile.life <= 0) {
        if (distance < 18 && projectile.type === "boomerang" && !owner.powerup) {
          owner.powerup = "boomerang";
        }
        continue;
      }
      projectile.vx = dx / distance * 360;
      projectile.vy = dy / distance * 360;
    } else if (projectile.type === "grenade" || projectile.type === "puck") {
      projectile.vy = Math.min(MAX_FALL_SPEED, projectile.vy + GRAVITY * delta);
    }

    const previousY = projectile.y;
    projectile.x += projectile.vx * delta;
    projectile.y += projectile.vy * delta;
    if (projectile.x < 8 || projectile.x > WORLD.width - 8) {
      if (projectile.type === "puck") {
        projectile.x = Math.max(8, Math.min(WORLD.width - 8, projectile.x));
        projectile.vx *= -1;
      } else if (projectile.type === "boomerang") {
        projectile.returning = true;
      } else if (projectile.type === "grenade") {
        detonateGrenade(game, projectile);
        continue;
      } else {
        continue;
      }
    }

    let hitPlatform = false;
    if (projectile.type === "grenade" || projectile.type === "puck") {
      hitPlatform = game.platforms.some((platform) =>
        projectile.x >= platform.x - 8 &&
        projectile.x <= platform.x + platform.width + 8 &&
        previousY + 8 <= platform.y &&
        projectile.y + 8 >= platform.y &&
        projectile.vy > 0
      );
    }
    if (hitPlatform && projectile.type === "grenade") {
      detonateGrenade(game, projectile);
      continue;
    }
    if (hitPlatform && projectile.type === "puck") {
      projectile.y -= projectile.y + 8 -
        game.platforms.find((platform) =>
          projectile.x >= platform.x - 8 &&
          projectile.x <= platform.x + platform.width + 8 &&
          previousY + 8 <= platform.y &&
          projectile.y + 8 >= platform.y
        ).y;
      projectile.vy = -Math.max(90, Math.abs(projectile.vy) * 0.72);
    }

    let consumed = false;
    for (const target of game.players) {
      if (target.inPit || target.id === projectile.ownerId ||
          (projectile.type === "boomerang" &&
            projectile.returning && projectile.hitPlayerId === target.id)) {
        continue;
      }
      const bounds = playerBounds(target);
      if (projectile.x < bounds.left - 10 ||
          projectile.x > bounds.right + 10 ||
          projectile.y < bounds.top - 10 ||
          projectile.y > bounds.bottom + 10) {
        continue;
      }
      consumed = hitByProjectile(game, projectile, target);
      if (consumed) break;
    }
    if (!consumed && projectile.life > 0 &&
        projectile.y < WORLD.height + 24 && game.deathResolutionTimer === 0) {
      remaining.push(projectile);
    }
  }
  game.projectiles = game.deathResolutionTimer === 0 ? remaining : [];
}

function updateMines(game, delta) {
  const remaining = [];
  for (const mine of game.mines) {
    mine.age += delta;
    mine.life -= delta;
    if (mine.life <= 0) continue;
    const target = game.players.find((player) =>
      player.id !== mine.ownerId &&
      !player.inPit &&
      player.grounded &&
      Math.abs(player.x + PLAYER_WIDTH / 2 - mine.x) < 22 &&
      Math.abs(player.y + PLAYER_HEIGHT - mine.y) < 16
    );
    if (mine.age >= MINE_ARM_DELAY && target) {
      game.explosions.push({ x: mine.x, y: mine.y, age: 0, life: 0.38 });
      knockOut(game, target, true);
      continue;
    }
    remaining.push(mine);
  }
  game.mines = game.deathResolutionTimer === 0 ? remaining : [];
}

function updateExplosions(game, delta) {
  for (const explosion of game.explosions) explosion.age += delta;
  game.explosions = game.explosions.filter((explosion) => explosion.age < explosion.life);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomIntegerBetween(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function pickupVelocity(speed, dimension, direction = 1) {
  const referenceDimension = dimension === "x"
    ? REFERENCE_WORLD_WIDTH
    : REFERENCE_WORLD_HEIGHT;
  const worldDimension = dimension === "x" ? WORLD.width : WORLD.height;
  // Convert DS fixed-point pixels per frame into browser-world pixels per second.
  return speed * REFERENCE_SPEED_SCALE *
    (worldDimension / referenceDimension) *
    REFERENCE_TICKS_PER_SECOND * direction;
}

function updatePickups(game, delta) {
  const startingPickupCount = game.pickups.length;
  game.pickupSpawnTimer -= delta;
  if (game.pickupSpawnTimer <= 0 && game.pickups.length < PICKUP_MAX_ACTIVE) {
    const spawnPoints = [
      { x: 320, y: 32, edge: "top" },
      { x: 20, y: 210, edge: "left" },
      { x: 620, y: 190, edge: "right" }
    ];
    const spawn = spawnPoints[game.pickupSpawnIndex % spawnPoints.length];
    const pickupTypes = pickupTypesForRuleset(game.ruleset);
    const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
    const horizontalSpeed = spawn.edge === "top"
      ? randomIntegerBetween(0, PICKUP_SPEED_MAX) *
        (Math.random() < 0.5 ? -1 : 1)
      : randomIntegerBetween(PICKUP_SPEED_MIN, PICKUP_SPEED_MAX) *
        (spawn.edge === "left" ? 1 : -1);
    const verticalSpeed = spawn.edge === "top"
      ? randomIntegerBetween(PICKUP_SPEED_MIN, PICKUP_SPEED_MAX)
      : randomIntegerBetween(0, PICKUP_SPEED_MAX) *
        (Math.random() < 0.5 ? -1 : 1);
    game.pickups.push({
      type: type.id,
      x: spawn.x,
      y: spawn.y,
      vx: pickupVelocity(horizontalSpeed, "x"),
      vy: pickupVelocity(verticalSpeed, "y"),
      life: randomIntegerBetween(PICKUP_LIFETIME_MIN, PICKUP_LIFETIME_MAX),
      phase: game.elapsed
    });
    game.pickupSpawnIndex += 1;
    game.pickupSpawnTimer = randomIntegerBetween(
      PICKUP_SPAWN_INTERVAL_MIN_TENTHS,
      PICKUP_SPAWN_INTERVAL_MAX_TENTHS
    ) / 10;
  }

  for (const pickup of game.pickups) {
    for (const player of game.players) {
      if (player.powerup !== "magnet" || player.inPit) continue;
      const dx = player.x + PLAYER_WIDTH / 2 - pickup.x;
      const dy = player.y + PLAYER_HEIGHT / 2 - pickup.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < MAGNET_RANGE) {
        pickup.vx += dx / distance * 380 * delta;
        pickup.vy += dy / distance * 380 * delta;
        pickup.vx = Math.max(-180, Math.min(180, pickup.vx));
        pickup.vy = Math.max(-180, Math.min(180, pickup.vy));
      }
    }

    pickup.x += pickup.vx * delta;
    pickup.y += pickup.vy * delta;
    pickup.life -= delta;
    if (pickup.x < PICKUP_BOUNDS.left || pickup.x > PICKUP_BOUNDS.right) {
      pickup.x = Math.max(
        PICKUP_BOUNDS.left,
        Math.min(PICKUP_BOUNDS.right, pickup.x)
      );
      pickup.vx *= -1;
    }
    if (pickup.y < PICKUP_BOUNDS.top || pickup.y > PICKUP_BOUNDS.bottom) {
      pickup.y = Math.max(
        PICKUP_BOUNDS.top,
        Math.min(PICKUP_BOUNDS.bottom, pickup.y)
      );
      pickup.vy *= -1;
    }

    if (pickup.type === "tnt") {
      const platform = game.platforms.find((candidate) =>
        !candidate.spawn &&
        Math.abs(pickup.y - candidate.y) <= 18 &&
        pickup.x + PICKUP_RADIUS >= candidate.x &&
        pickup.x - PICKUP_RADIUS <= candidate.x + candidate.width
      );
      if (platform) {
        const platformCenter = platform.x + platform.width / 2;
        const destroyed = game.platforms.filter((candidate) =>
          !candidate.spawn &&
          candidate.y === platform.y &&
          Math.abs(candidate.x + candidate.width / 2 - platformCenter) <= 32
        );
        const destroyedSet = new Set(destroyed);
        game.platforms = game.platforms.filter((candidate) => !destroyedSet.has(candidate));
        for (const player of game.players) {
          if (!player.grounded || Math.abs(player.y + PLAYER_HEIGHT - platform.y) > 2) {
            continue;
          }
          const feet = playerFeet(player);
          if (destroyed.some((tile) =>
            feet.right > tile.x && feet.left < tile.x + tile.width
          )) {
            player.grounded = false;
            player.falling = true;
            player.impactAnimation = "fall";
          }
        }
        game.explosions.push({
          x: pickup.x,
          y: pickup.y,
          age: 0,
          life: 0.4
        });
        pickup.life = 0;
      }
      continue;
    }

    const pickupBounds = {
      left: pickup.x - PICKUP_RADIUS,
      right: pickup.x + PICKUP_RADIUS,
      top: pickup.y - PICKUP_RADIUS,
      bottom: pickup.y + PICKUP_RADIUS
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

      if (pickup.type === "skull") {
        game.pickupPops.push({ x: pickup.x, y: pickup.y, age: 0 });
        pickup.life = 0;
        knockOut(game, player, true);
        break;
      }

      player.powerup = pickup.type;
      player.weaponAmmo = pickup.type === "gun" ? 5 : 0;
      player.powerupTimer = pickup.type === "lightning" ||
        pickup.type === "invisibility"
        ? POWERUP_DURATION
        : 0;
      player.nettedTimer = 0;
      player.nettedEscapes = 0;
      player.weaseledTimer = 0;
      player.chuteOpen = false;
      player.hookTarget = null;
      player.hookTimer = 0;
      game.pickupPops.push({ x: pickup.x, y: pickup.y, age: 0 });
      pickup.life = 0;
      break;
    }
    if (game.deathResolutionTimer > 0) break;
  }
  game.pickups = game.pickups.filter((pickup) => pickup.life > 0);
  if (game.pickups.length < startingPickupCount) {
    game.pickupSpawnTimer = randomIntegerBetween(
      PICKUP_SPAWN_INTERVAL_MIN_TENTHS,
      PICKUP_SPAWN_INTERVAL_MAX_TENTHS
    ) / 10;
  }
}

function updatePickupPops(game, delta) {
  for (const pop of game.pickupPops) pop.age += delta;
  game.pickupPops = game.pickupPops.filter((pop) => pop.age < PICKUP_POP_DURATION);
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

function registerDeath(game, player) {
  const winnerIndex = player.id === 1 ? 1 : 0;
  game.scores[winnerIndex] += 1;
  player.stocks = Math.max(0, player.stocks - 1);
}

function beginDeathResolution(game, deadPlayers) {
  game.playersTouching = false;
  if (game.deathResolutionTimer === 0) {
    game.deathResolutionTimer = DEATH_RESOLUTION_DELAY;
    game.pickups = [];
    game.projectiles = [];
    game.mines = [];
    for (const player of game.players) {
      clearPowerup(player);
    }
  }

  for (const player of deadPlayers) {
    if (!player.deathRegistered) {
      registerDeath(game, player);
      player.deathRegistered = true;
    }
    if (!player.inPit) {
      player.inPit = true;
      player.pitTimer = 0;
      player.y = PIT_SURFACE_Y - PLAYER_HEIGHT;
      game.pitSplashes.push({ x: player.x + PLAYER_WIDTH / 2, age: 0 });
    }
    player.vy = player.disintegrating ? 0 : DEATH_SINK_SPEED;
    player.vx = 0;
    player.rolling = false;
    player.rollTimer = 0;
    player.crouching = false;
    player.climbing = false;
    player.attackTimer = 0;
    player.attackHit = false;
  }
}

function knockOut(game, player, disintegrate = false) {
  if (player.inPit || player.deathRegistered) return;
  if (disintegrate) {
    player.disintegrateFrame = DISINTEGRATE_FALL_FRAMES[0];
    player.disintegrating = true;
    player.disintegrateAge = 0;
    player.disintegrateSeed = Math.floor(Math.random() * 0x100000000);
  }
  beginDeathResolution(game, [player]);
}

function collectDeadPlayers(game) {
  return game.players.filter((player) =>
    !player.inPit &&
    (player.y + PLAYER_HEIGHT >= PIT_SURFACE_Y ||
      player.y > WORLD.height + PLAYER_HEIGHT)
  );
}

function beginRoundPause(game) {
  game.roundPauseTimer = ROUND_PAUSE_DURATION;
  game.deathResolutionTimer = 0;
  const [first, second] = game.players;
  if (first.stocks === 0 && second.stocks === 0) {
    game.matchDraw = true;
  } else if (first.stocks === 0) {
    game.winner = second.id;
  } else if (second.stocks === 0) {
    game.winner = first.id;
  }
  for (const player of game.players) player.vy = 0;
}

function resetPlayerForRound(player) {
  player.x = player.id === 1 ? 48 : 528;
  player.y = 336 - PLAYER_HEIGHT;
  player.vx = 0;
  player.vy = 0;
  player.facing = player.id === 1 ? 1 : -1;
  player.grounded = true;
  player.stun = 0;
  player.impactTimer = 0;
  player.impactAnimation = null;
  player.falling = false;
  player.inPit = false;
  player.pitTimer = 0;
  player.rolling = false;
  player.rollTimer = 0;
  player.attackCooldown = 0;
  player.attackTimer = 0;
  player.attackHit = false;
  player.gunFireTimer = 0;
  player.disintegrating = false;
  player.disintegrateAge = 0;
  player.disintegrateFrame = 0;
  player.disintegrateSeed = 0;
  player.deathRegistered = false;
  player.powerup = null;
  player.weaponAmmo = 0;
  player.powerupTimer = 0;
  player.nettedTimer = 0;
  player.nettedEscapes = 0;
  player.weaseledTimer = 0;
  player.chuteOpen = false;
  player.hookTarget = null;
  player.hookTimer = 0;
  player.climbing = false;
  player.climbAnimationDirection = 0;
  player.climbAnimationTime = 0;
  player.climbingFrame = CLIMB_UP_FRAMES[0];
  player.jumpAnimation = null;
  player.jumpAnimationTime = 0;
  player.crouching = false;
}

function advanceRoundPause(game, delta) {
  game.elapsed += delta;
  game.roundPauseTimer = Math.max(0, game.roundPauseTimer - delta);
  for (const player of game.players) {
    player.gunFireTimer = Math.max(0, player.gunFireTimer - delta);
  }
  for (const splash of game.pitSplashes) splash.age += delta;
  game.pitSplashes = game.pitSplashes.filter((splash) => splash.age < PIT_SPLASH_DURATION);
  updatePickupPops(game, delta);
  updateExplosions(game, delta);

  if (game.roundPauseTimer === 0) {
    for (const player of game.players) resetPlayerForRound(player);
    if (!game.winner && !game.matchDraw) game.platforms = generatePlatforms();
    game.playersTouching = false;
    game.pickups = [];
    game.projectiles = [];
    game.mines = [];
    game.explosions = [];
    game.pitSplashes = [];
    game.pickupSpawnTimer = 3;
  }
  return game;
}

function advanceDeathResolution(game, inputs, delta) {
  game.elapsed += delta;
  updatePlayer(game.players[0], inputs[0] ?? {}, delta, game);
  updatePlayer(game.players[1], inputs[1] ?? {}, delta, game);
  const deadPlayers = collectDeadPlayers(game);
  if (deadPlayers.length > 0) beginDeathResolution(game, deadPlayers);
  for (const splash of game.pitSplashes) splash.age += delta;
  game.pitSplashes = game.pitSplashes.filter((splash) => splash.age < PIT_SPLASH_DURATION);
  updatePickupPops(game, delta);
  updateExplosions(game, delta);
  game.deathResolutionTimer = Math.max(0, game.deathResolutionTimer - delta);
  if (game.deathResolutionTimer === 0) beginRoundPause(game);
  return game;
}

export function stepGame(game, inputs, deltaSeconds) {
  const delta = Math.min(Math.max(deltaSeconds, 0), 0.04);
  if (game.deathResolutionTimer > 0) {
    return advanceDeathResolution(game, inputs, delta);
  }
  if (game.roundPauseTimer > 0) return advanceRoundPause(game, delta);
  if (game.winner || game.matchDraw) return game;

  game.elapsed += delta;
  updatePlayer(game.players[0], inputs[0] ?? {}, delta, game);
  updatePlayer(game.players[1], inputs[1] ?? {}, delta, game);
  const touchingPlayers = playersOverlap(game.players[0], game.players[1]);
  if (touchingPlayers) {
    resolvePlayerCollision(
      game,
      game.players[0],
      game.players[1],
      !game.playersTouching
    );
  }
  game.playersTouching = touchingPlayers;
  updatePickupPops(game, delta);
  if (game.deathResolutionTimer === 0) {
    updateProjectiles(game, delta);
    if (game.deathResolutionTimer === 0) updateMines(game, delta);
    if (game.deathResolutionTimer === 0) updatePickups(game, delta);
    if (game.deathResolutionTimer === 0) resolveAttacks(game.players);
  }
  updateExplosions(game, delta);

  const deadPlayers = collectDeadPlayers(game);
  if (deadPlayers.length > 0) {
    beginDeathResolution(game, deadPlayers);
    return game;
  }
  if (game.deathResolutionTimer > 0) return game;

  for (const splash of game.pitSplashes) splash.age += delta;
  game.pitSplashes = game.pitSplashes.filter((splash) => splash.age < PIT_SPLASH_DURATION);

  return game;
}

function getPlayerFrame(player, elapsed) {
  let frame = 0;
  if (player.inPit) {
    frame = 21;
  } else if (player.gunFireTimer > 0) {
    const frameIndex = Math.min(
      GUN_FIRE_FRAMES.length - 1,
      Math.floor((GUN_FIRE_DURATION - player.gunFireTimer) / GUN_FIRE_FRAME_DURATION)
    );
    frame = GUN_FIRE_FRAMES[frameIndex];
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
  return frame;
}

function drawPlayer(context, player, elapsed) {
  if (player.disintegrating) return;
  const image = player.powerup === "invisibility"
    ? invisiblePlayerSprite
    : player.powerup === "lightning"
      ? lightningPlayerSprite
      : playerSprites[player.id - 1];
  const blink = player.stun > 0 && Math.floor(player.stun * 24) % 2 === 0;
  if (blink) return;
  const frame = getPlayerFrame(player, elapsed);

  if (image.complete && image.naturalWidth > 0) {
    context.save();
    if (player.powerup === "invisibility") context.globalAlpha = 0.2;
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

  context.save();
  if (player.powerup === "invisibility") context.globalAlpha = 0.2;
  context.fillStyle = player.color;
  context.beginPath();
  context.ellipse(player.x + 32, player.y + 30, 18, 26, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPlayerEffects(context, player, elapsed) {
  const centerX = player.x + PLAYER_WIDTH / 2;
  const top = player.y;
  if (player.powerup === "dunce" && !player.inPit) {
    context.fillStyle = "#e9c85d";
    context.beginPath();
    context.moveTo(centerX - 11, top + 8);
    context.lineTo(centerX + 11, top + 8);
    context.lineTo(centerX, top - 15);
    context.closePath();
    context.fill();
    context.fillStyle = "#a23d4a";
    context.fillRect(centerX - 11, top + 7, 22, 4);
  }
  if (player.chuteOpen && !player.inPit) {
    context.strokeStyle = "#f4f0e8";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(centerX, top - 8, 24, Math.PI, 0);
    context.moveTo(centerX - 24, top - 8);
    context.lineTo(player.x + 17, top + 5);
    context.moveTo(centerX + 24, top - 8);
    context.lineTo(player.x + 47, top + 5);
    context.stroke();
    context.fillStyle = "#e879a5";
    context.beginPath();
    context.arc(centerX, top - 8, 24, Math.PI, 0);
    context.closePath();
    context.fill();
  }
  if (player.powerup === "lightning" && !player.inPit) {
    context.strokeStyle = "#fff37a";
    context.lineWidth = 2;
    for (let arc = 0; arc < 3; arc += 1) {
      const startY = top + 6 + arc * 16;
      const offset = Math.sin(elapsed * 24 + arc * 2) * 5;
      context.beginPath();
      context.moveTo(player.x + 8 + offset, startY);
      context.lineTo(player.x + 1 - offset, startY + 7);
      context.lineTo(player.x + 8 + offset, startY + 12);
      context.stroke();
    }
  }
  if (player.nettedTimer > 0 && !player.inPit) {
    context.strokeStyle = "#f2f4ff";
    context.lineWidth = 1.5;
    for (let offset = -24; offset <= 24; offset += 12) {
      context.beginPath();
      context.moveTo(centerX - 24, player.y + 8 + offset);
      context.lineTo(centerX + 24, player.y + 8 - offset);
      context.moveTo(centerX + offset, player.y + 8);
      context.lineTo(centerX + offset + 24, player.y + 48);
      context.stroke();
    }
  }
  if (player.hookTarget) {
    context.strokeStyle = "#b9e57a";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX, top + 20);
    context.lineTo(player.hookTarget.x + PLAYER_WIDTH / 2, player.hookTarget.y + 20);
    context.stroke();
  }
}

function drawWorldEffects(context, game) {
  for (const mine of game.mines) {
    context.fillStyle = mine.age < MINE_ARM_DELAY ? "#b9e57a" : "#4d5366";
    context.strokeStyle = "#f4f0e8";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(mine.x, mine.y, 8, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    for (let spike = 0; spike < 4; spike += 1) {
      const angle = spike * Math.PI / 2;
      context.beginPath();
      context.moveTo(mine.x + Math.cos(angle) * 6, mine.y + Math.sin(angle) * 6);
      context.lineTo(mine.x + Math.cos(angle) * 12, mine.y + Math.sin(angle) * 12);
      context.stroke();
    }
  }

  for (const projectile of game.projectiles) {
    context.fillStyle = {
      grenade: "#e8794f",
      puck: "#d8edf4",
      net: "#b9e57a",
      weasel: "#b88b55",
      boomerang: "#e3bf58"
    }[projectile.type] || "#f4f0e8";
    context.strokeStyle = "#171a22";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(projectile.x, projectile.y, projectile.type === "grenade" ? 8 : 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    if (projectile.type === "net") {
      context.beginPath();
      context.moveTo(projectile.x - 8, projectile.y - 8);
      context.lineTo(projectile.x + 8, projectile.y + 8);
      context.moveTo(projectile.x + 8, projectile.y - 8);
      context.lineTo(projectile.x - 8, projectile.y + 8);
      context.stroke();
    }
  }

  for (const explosion of game.explosions) {
    const progress = explosion.age / explosion.life;
    context.save();
    context.globalAlpha = 1 - progress;
    context.fillStyle = "#ffd76b";
    context.strokeStyle = "#ee734f";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(explosion.x, explosion.y, 10 + progress * 34, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }
}

function drawDisintegration(context, player) {
  if (!player.disintegrating || player.disintegrateAge >= DISINTEGRATE_DURATION) return;
  const image = playerSprites[player.id - 1];
  if (!image.complete || image.naturalWidth === 0) return;

  const canvasIndex = player.id - 1;
  if (!disintegrationCanvases[canvasIndex]) {
    disintegrationCanvases[canvasIndex] = document.createElement("canvas");
    disintegrationCanvases[canvasIndex].width = PLAYER_WIDTH;
    disintegrationCanvases[canvasIndex].height = PLAYER_WIDTH;
  }
  const canvas = disintegrationCanvases[canvasIndex];
  const offscreen = canvas.getContext("2d");
  if (!offscreen) throw new Error("Could not prepare the disintegration sprite.");

  offscreen.clearRect(0, 0, canvas.width, canvas.height);
  offscreen.drawImage(
    image,
    0,
    player.disintegrateFrame * PLAYER_WIDTH,
    PLAYER_WIDTH,
    PLAYER_WIDTH,
    0,
    0,
    PLAYER_WIDTH,
    PLAYER_WIDTH
  );
  offscreen.globalCompositeOperation = "destination-out";
  const progress = player.disintegrateAge / DISINTEGRATE_DURATION;
  for (let pixel = 0; pixel < DISINTEGRATE_PIXEL_COUNT; pixel += 1) {
    let value = (pixel ^ player.disintegrateSeed) >>> 0;
    value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
    value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
    value = (value ^ (value >>> 16)) >>> 0;
    if (value / 0x100000000 >= progress) continue;

    const x = (pixel % (PLAYER_WIDTH / DISINTEGRATE_PIXEL_SIZE)) *
      DISINTEGRATE_PIXEL_SIZE;
    const y = Math.floor(pixel / (PLAYER_WIDTH / DISINTEGRATE_PIXEL_SIZE)) *
      DISINTEGRATE_PIXEL_SIZE;
    offscreen.fillRect(x, y, DISINTEGRATE_PIXEL_SIZE, DISINTEGRATE_PIXEL_SIZE);
  }
  offscreen.globalCompositeOperation = "source-over";
  context.drawImage(canvas, player.x, player.y);
}

function drawPitSplash(context, splash) {
  const sprite = getTransparentEffectSprite();
  if (!sprite) {
    const progress = splash.age / PIT_SPLASH_DURATION;
    const spread = 6 + progress * 14;
    context.save();
    context.globalAlpha = 1 - progress;
    context.fillStyle = "#f4d6e8";
    context.beginPath();
    context.ellipse(
      splash.x,
      PIT_SURFACE_Y + 3,
      spread,
      3,
      0,
      Math.PI,
      Math.PI * 2
    );
    context.fill();
    for (const direction of [-1, 1]) {
      context.beginPath();
      context.arc(
        splash.x + direction * spread,
        PIT_SURFACE_Y - 6 - 8 * (1 - progress),
        2,
        0,
        Math.PI * 2
      );
      context.fill();
    }
    context.restore();
    return;
  }

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
  context.canvas.dataset.score = `${game.scores[0]}-${game.scores[1]}`;
  context.canvas.dataset.roundPauseTimer = game.roundPauseTimer.toFixed(2);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, WORLD.width, WORLD.height);

  const sky = context.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, "#24263a");
  sky.addColorStop(1, "#121722");
  context.fillStyle = sky;
  context.fillRect(0, 0, WORLD.width, WORLD.height);

  for (const platform of game.platforms) {
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
    const pickupAge = game.elapsed - pickup.phase;
    const bob = Math.sin(pickupAge * 5) * 2;
    const bubbleFrame = PICKUP_BUBBLE_FRAMES[
      Math.floor(pickupAge * PICKUP_BUBBLE_ANIMATION_FPS) %
      PICKUP_BUBBLE_FRAMES.length
    ];
    context.drawImage(
      pickupSprite,
      0,
      bubbleFrame * 32,
      32,
      32,
      pickup.x - 16,
      pickup.y - 16 + bob,
      32,
      32
    );
    context.drawImage(
      pickupSprite,
      0,
      type.frame * 32,
      32,
      32,
      pickup.x - 16,
      pickup.y - 16 + bob,
      32,
      32
    );
  }

  if (pitSprite.complete && pitSprite.naturalWidth > 0) {
    const pitFrame = Math.floor(game.elapsed / PIT_FRAME_DURATION) % 4;
    for (let x = 0; x < WORLD.width; x += 32) {
      context.drawImage(pitFillerSprite, x, 390);
    }
  } else {
    context.fillStyle = "#50374b";
    context.fillRect(0, PIT_SURFACE_Y, WORLD.width, WORLD.height - PIT_SURFACE_Y);
  }

  for (const player of game.players) {
    drawPlayer(context, player, game.elapsed);
    drawDisintegration(context, player);
    drawPlayerEffects(context, player, game.elapsed);
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

  drawWorldEffects(context, game);

  if (pitSprite.complete && pitSprite.naturalWidth > 0) {
    const pitFrame = Math.floor(game.elapsed / PIT_FRAME_DURATION) % 4;
    for (let x = 0; x < WORLD.width; x += 32) {
      context.drawImage(
        pitSprite,
        0,
        pitFrame * 32 + 1,
        32,
        31,
        x,
        PIT_SURFACE_Y + 1,
        32,
        31
      );
    }
  }

  for (const splash of game.pitSplashes) drawPitSplash(context, splash);
  const effectSpriteSheet = getTransparentEffectSprite();
  if (effectSpriteSheet) {
    for (const pop of game.pickupPops) {
      const frameIndex = Math.min(
        PICKUP_POP_FRAMES.length - 1,
        Math.floor(pop.age / PICKUP_POP_FRAME_DURATION)
      );
      context.drawImage(
        effectSpriteSheet,
        0,
        PICKUP_POP_FRAMES[frameIndex] * 32,
        32,
        32,
        pop.x - 16,
        pop.y - 16,
        32,
        32
      );
    }
  }

  context.fillStyle = "#f4f0e8";
  context.font = "700 13px system-ui, sans-serif";
  context.textAlign = "left";
  const playerOne = game.players[0];
  const playerTwo = game.players[1];
  const powerupStatus = (player) => {
    if (player.nettedTimer > 0) return "NETTED";
    if (player.weaseledTimer > 0) return "WEASELED";
    if (player.powerup === "gun") return `GUN ${player.weaponAmmo}`;
    const type = PICKUP_TYPES.find((item) => item.id === player.powerup);
    if (!type) return "";
    if (player.powerupTimer > 0) {
      return `${type.label} ${Math.ceil(player.powerupTimer)}s`;
    }
    return type.label;
  };
  const playerOneStatus = powerupStatus(playerOne);
  const playerTwoStatus = powerupStatus(playerTwo);
  context.fillText(`P1  ${playerOne.stocks}${playerOneStatus ? ` · ${playerOneStatus}` : ""}`, 16, 25);
  context.textAlign = "right";
  context.fillText(`P2  ${playerTwo.stocks}${playerTwoStatus ? ` · ${playerTwoStatus}` : ""}`, WORLD.width - 16, 25);
  context.textAlign = "center";
  context.font = "600 11px system-ui, sans-serif";
  context.fillStyle = "#b0b2c1";
  if (game.roundPauseTimer > 0) {
    context.fillStyle = "#11131bf2";
    context.fillRect(WORLD.width / 2 - 112, WORLD.height / 2 - 46, 224, 92);
    context.strokeStyle = "#b9e57a";
    context.lineWidth = 2;
    context.strokeRect(WORLD.width / 2 - 112, WORLD.height / 2 - 46, 224, 92);
    context.fillStyle = "#b9e57a";
    context.font = "800 12px system-ui, sans-serif";
    context.textBaseline = "middle";
    context.fillText("MATCH SCORE", WORLD.width / 2, WORLD.height / 2 - 22);
    context.fillStyle = "#f4f5f8";
    context.font = "900 30px system-ui, sans-serif";
    context.fillText(
      `${game.scores[0]}  -  ${game.scores[1]}`,
      WORLD.width / 2,
      WORLD.height / 2 + 15
    );
    context.textBaseline = "alphabetic";
  }
}
