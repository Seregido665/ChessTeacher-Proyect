// worker.js
importScripts('/stockfish.js'); // carga desde /public

// Stockfish expone una función global STOCKFISH()
const engine = STOCKFISH();

onmessage = function (event) {
  engine.postMessage(event.data);
};

engine.onmessage = function (line) {
  postMessage(line);
};
