import { createCanvasTest } from "./canvas-test.js";

const canvas = document.querySelector("#game-canvas");
const status = document.querySelector("#test-status");
const startButton = document.querySelector("#start-test");

if (!(canvas instanceof HTMLCanvasElement) ||
    !(status instanceof HTMLElement) ||
    !(startButton instanceof HTMLButtonElement)) {
  throw new Error("The canvas test page is missing a required element.");
}

const test = createCanvasTest(canvas);

startButton.addEventListener("click", () => {
  test.start();
  canvas.focus();
  status.textContent = "Running · move both markers";
  startButton.textContent = "Input test running";
  startButton.disabled = true;
});

status.textContent = "Ready";
