/**
 * Returns a method which clears the canvas
 * @param {*} canvasContext
 * @param {*} canvasWidth
 * @param {*} canvasHeight
 */
export const getClearCanvasMethod = (
  canvasContext: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => () => canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

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
  const canvasResolutionScale = 4;
  canvasElement.style.width = canvasWidth + "px";
  canvasElement.style.height = canvasHeight + "px";
  canvasElement.width = canvasWidth * canvasResolutionScale;
  canvasElement.height = canvasHeight * canvasResolutionScale;
  canvasContext.scale(canvasResolutionScale, canvasResolutionScale);
};
