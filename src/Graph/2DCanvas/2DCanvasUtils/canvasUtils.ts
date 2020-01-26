/**
 * Method: Scale canvas resolution for retina displays
 * @param {*} canvasContext
 * @param {*} canvasElement
 * @param {*} canvasWidth
 * @param {*} canvasHeight
 * @param {*} canvasResolutionScale
 */
export const scale2DCanvas = (
  canvasContext: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement
) => {
  const canvasResolutionScale = window.devicePixelRatio;
  const displayWidth = canvasElement.offsetWidth * canvasResolutionScale;
  const displayHeight = canvasElement.offsetHeight * canvasResolutionScale;
  if (
    canvasElement.width !== displayWidth ||
    canvasElement.height !== displayHeight
  ) {
    canvasElement.width = displayWidth;
    canvasElement.height = displayHeight;
    canvasContext.scale(canvasResolutionScale, canvasResolutionScale);
  }
};
