/**
 * Returns a method which clears the canvas
 * @param {*} canvasContext
 * @param {*} canvasWidth
 * @param {*} canvasHeight
 */
export const getClearCanvasMethod = (
  canvasContext,
  canvasWidth,
  canvasHeight
) => () => canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

/**
 * Returns a method which will scale a given value range
 * @param {*} minValue
 * @param {*} maxValue
 * @param {*} maxScaled
 */
export const getScaleMethod = (minValue, maxValue, maxScaled) => {
  const normalise = value => value - minValue;
  const getFactor = value => normalise(value) / normalise(maxValue);
  return value => Math.round(getFactor(value) * maxScaled);
};

// Method: Scale canvas resolution for retina displays
export const getScaleCanvasResolutionMethod = (
  canvasContext,
  canvasElement,
  canvasWidth,
  canvasHeight,
  canvasResolutionScale
) => () => {
  canvasElement.style.width = canvasWidth + "px";
  canvasElement.style.height = canvasHeight + "px";
  canvasElement.width = canvasWidth * 4;
  canvasElement.height = canvasHeight * 4;
  canvasContext.scale(canvasResolutionScale, canvasResolutionScale);
};

// Method: descale canvas
export const getDescaleCanvasResolutionMethod = (
  canvasContext,
  canvasResolutionScale
) => () =>
  canvasContext.scale(1 / canvasResolutionScale, 1 / canvasResolutionScale);
