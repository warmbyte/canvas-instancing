interface TypeWell {
  value: number;
  color: string;
}

const size = 50;
var offscreenCanvas = new OffscreenCanvas(size, size);

let cache: any;
self.onmessage = function(event) {
  if (cache) {
    postMessage(cache)
    return 
  }
  // Retrieve the received data
  const ctx = offscreenCanvas.getContext("2d", {willReadFrequently: true})!;
  var value = event.data.value as TypeWell[];
  var centerX = size / 2;
  var centerY = size / 2;

  // Create a new offscreen canvas for rendering

  let radius = size / 2;

  const circleVolume = value.reduce((acc, next) => acc + next.value, 0);

  let sliceAngle = 0;

  value.forEach((val) => {
    const percentage = val.value / circleVolume;
    const sliceSize = percentage * 2 * Math.PI;
    const currentSliceAngle = sliceAngle + sliceSize;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, sliceAngle, currentSliceAngle);
    ctx.closePath();
    ctx.fillStyle = val.color;
    ctx.fill();

    sliceAngle = currentSliceAngle;
  });

  // Transfer the rendered shape data back to the main thread
  var imageData = ctx.getImageData(0, 0, size, size);
  cache = imageData;
};