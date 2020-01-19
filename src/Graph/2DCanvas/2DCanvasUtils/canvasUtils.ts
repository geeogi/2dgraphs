/**
 * Method: Scale canvas resolution for retina displays
 * @param {*} canvasContext
 * @param {*} canvasElement
 * @param {*} canvasWidth
 * @param {*} canvasHeight
 * @param {*} canvasResolutionScale
 */
export const getRetinaMethod = (
  canvasContext: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number
) => () => {
  const canvasResolutionScale = window.devicePixelRatio;
  const displayWidth = canvasWidth * canvasResolutionScale;
  const displayHeight = canvasHeight * canvasResolutionScale;
  if (
    canvasElement.width !== displayWidth ||
    canvasElement.height !== displayHeight
  ) {
    // canvasElement.style.width = canvasWidth + "px";
    // canvasElement.style.height = canvasHeight + "px";
    canvasElement.width = displayWidth;
    canvasElement.height = displayHeight;
    canvasContext.scale(canvasResolutionScale, canvasResolutionScale);
  }
};
