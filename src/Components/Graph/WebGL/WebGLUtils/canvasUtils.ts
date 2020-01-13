export const resizeGlCanvas = (gl: any, canvasElement: HTMLCanvasElement) => {
  var realToCSSPixels = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawing buffer match it in
  // device pixels.
  var displayWidth = Math.floor(canvasElement.clientWidth * realToCSSPixels);
  var displayHeight = Math.floor(canvasElement.clientHeight * realToCSSPixels);

  // Check if the canvas is not the same size.
  if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
    // Make the canvas the same size
    canvasElement.width = displayWidth;
    canvasElement.height = displayHeight;

    // Set the GL view port
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);
  }
};
