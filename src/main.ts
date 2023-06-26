// draw rectangle as border
const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const app = document.getElementById("app")!;
// Initial scale and translation values
let scale = 1;
let translateX = 0;
let translateY = 0;

const numberOfWorker = 360;

const workerPool = new Array(numberOfWorker).fill(null).map(() => new Worker(new URL("./worker.ts", import.meta.url)))

function updateCanvas() {
  // ctx.setTransform(scale, 0, 0, scale, translateX, translateY);
  drawMultipleCircle();
}

interface TypeWell {
  value: number;
  color: string;
}

// LIB helper

const getRandomIntInclusive = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
};

const ccache = new Map();
const generateWells = (count: number, idx: any) => {
  if (ccache.has(idx)) return ccache.get(idx)
  let res = <TypeWell[]>[];
  const randomInBetween = () => getRandomIntInclusive(0, 255);
  for (let index = 0; index < count; index++) {
    res.push({
      value: 10,
      color: `rgb(${randomInBetween()},${randomInBetween()},${randomInBetween()})`,
    });
  }
  ccache.set(idx, res)
  return res;
};

const drawMultipleCircle = () => {
  ctx.save();
  for (let i = 0; i < numberOfWorker; i++) {
    workerPool[i].postMessage({value: generateWells(380, i)})
  }
};

workerPool.forEach((worker, index) => {
  worker.onmessage = function(message: any) {
    // ctx.save()
    // ctx.clearRect(index * 100, 0, 100, 100);
    // ctx.restore()
    ctx.putImageData(message.data as any, index * 52, 0);
  }
})


// Zoom in or out based on the mousewheel event
function handleMouseWheel(event: any) {
  event.preventDefault();

  var zoomSpeed = 0.1; // Adjust the zoom speed as desired
  var zoomFactor = Math.exp(event.deltaY * -zoomSpeed * 0.01);

  // Calculate the new scale and limit it within a certain range
  var newScale = scale * zoomFactor;
  newScale = Math.min(Math.max(newScale, 0.2), 5); // Adjust the scale limits as desired

  // Calculate the translation adjustments to keep the zoom centered around the mouse position
  var rect = canvas.getBoundingClientRect();
  var offsetX = event.clientX - rect.left;
  var offsetY = event.clientY - rect.top;
  var translateAdjustX = (translateX - offsetX) * (1 - 1 / zoomFactor);
  var translateAdjustY = (translateY - offsetY) * (1 - 1 / zoomFactor);

  // Apply the new scale and translation adjustments
  scale = newScale;
  translateX += translateAdjustX;
  translateY += translateAdjustY;
  canvas.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`
}

// canvas.addEventListener("wheel", handleMouseWheel);

// const renderLoop = () => {
//   requestAnimationFrame(renderLoop)
//   updateCanvas();
// }

// renderLoop();

setInterval(updateCanvas, 1000 / 20)