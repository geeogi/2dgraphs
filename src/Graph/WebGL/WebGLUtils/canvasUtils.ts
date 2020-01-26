export const resizeGlCanvas = (gl: any, canvasElement: HTMLCanvasElement) => {
  const realToCSSPixels = window.devicePixelRatio;
  const displayWidth = Math.floor(canvasElement.clientWidth * realToCSSPixels);
  const displayHeight = Math.floor(
    canvasElement.clientHeight * realToCSSPixels
  );

  // Check if the canvas is not the same size
  if (
    canvasElement.width !== displayWidth ||
    canvasElement.height !== displayHeight
  ) {
    // Make the canvas the same size
    canvasElement.width = displayWidth;
    canvasElement.height = displayHeight;

    // Set the GL view port
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);
  }
};
