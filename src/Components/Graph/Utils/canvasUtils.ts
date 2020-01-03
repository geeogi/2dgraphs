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
  canvasElement.style.width = canvasWidth + "px";
  canvasElement.style.height = canvasHeight + "px";
  canvasElement.width = canvasWidth * canvasResolutionScale;
  canvasElement.height = canvasHeight * canvasResolutionScale;
  canvasContext.scale(canvasResolutionScale, canvasResolutionScale);
};
