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
 * Returns a method which will scale and descale linearly between two value ranges
 * @param {*} minValue
 * @param {*} maxValue
 * @param {*} maxScaled
 */
export const getScaleMethods = (
  minPrimaryValue,
  maxPrimaryValue,
  minSecondaryValue,
  maxSecondaryValue
) => {
  const primaryValueRange = maxPrimaryValue - minPrimaryValue;
  const secondaryValueRange = maxSecondaryValue - minSecondaryValue;
  return {
    scale: primaryValue => {
      const normalPrimaryValue = primaryValue - minPrimaryValue;
      const primaryPercentage = normalPrimaryValue / primaryValueRange;
      return minSecondaryValue + primaryPercentage * secondaryValueRange;
    },
    descale: secondaryValue => {
      const normalSecondaryValue = secondaryValue - minSecondaryValue;
      const secondaryPercentage = normalSecondaryValue / secondaryValueRange;
      return minPrimaryValue + secondaryPercentage * primaryValueRange;
    }
  };
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
