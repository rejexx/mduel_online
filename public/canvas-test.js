const PLAYER_RADIUS = 18;
const MOVE_STEP = 16;

const PLAYER_CONTROLS = [
  {
    color: "#79c7ff",
    keys: { up: "KeyW", left: "KeyA", down: "KeyS", right: "KeyD" },
    x: 0.3,
    y: 0.5
  },
  {
    color: "#ffad73",
    keys: { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight" },
    x: 0.7,
    y: 0.5
  }
];

export function createCanvasTest(canvas) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("This browser could not create a 2D canvas context.");
  }

  const players = PLAYER_CONTROLS.map((controls) => ({ ...controls }));
  let width = 0;
  let height = 0;
  let running = false;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#171a25";
    context.fillRect(0, 0, width, height);
    canvas.dataset.player1X = players[0].x.toFixed(4);
    canvas.dataset.player2X = players[1].x.toFixed(4);

    context.setLineDash([5, 9]);
    context.strokeStyle = "#353a4a";
    context.beginPath();
    context.moveTo(width / 2, 18);
    context.lineTo(width / 2, height - 18);
    context.stroke();
    context.setLineDash([]);

    for (const [index, player] of players.entries()) {
      context.beginPath();
      context.arc(player.x * width, player.y * height, PLAYER_RADIUS, 0, Math.PI * 2);
      context.fillStyle = player.color;
      context.fill();
      context.fillStyle = "#11131b";
      context.font = "700 12px system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(`P${index + 1}`, player.x * width, player.y * height);
    }
  }

  function onKeyDown(event) {
    if (!running) return;
    const player = players.find((candidate) =>
      Object.values(candidate.keys).includes(event.code)
    );
    if (!player) return;

    event.preventDefault();
    const pixelStepX = MOVE_STEP / width;
    const pixelStepY = MOVE_STEP / height;
    if (event.code === player.keys.left) player.x -= pixelStepX;
    if (event.code === player.keys.right) player.x += pixelStepX;
    if (event.code === player.keys.up) player.y -= pixelStepY;
    if (event.code === player.keys.down) player.y += pixelStepY;
    player.x = Math.max(0.04, Math.min(0.96, player.x));
    player.y = Math.max(0.08, Math.min(0.92, player.y));
    draw();
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", onKeyDown);

  return {
    start() {
      if (running) return;
      running = true;
      draw();
    }
  };
}
