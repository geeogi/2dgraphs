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
 * * Returns a method which will scale and descale linearly between two value ranges
 * @param {*} minPrimaryValue
 * @param {*} maxPrimaryValue
 * @param {*} minSecondaryValue
 * @param {*} maxSecondaryValue
 */
export const getScaleMethods = (
  minPrimaryValue: number,
  maxPrimaryValue: number,
  minSecondaryValue: number,
  maxSecondaryValue: number
) => {
  const primaryValueRange = maxPrimaryValue - minPrimaryValue;
  const secondaryValueRange = maxSecondaryValue - minSecondaryValue;
  return {
    scale: (primaryValue: number) => {
      const normalPrimaryValue = primaryValue - minPrimaryValue;
      const primaryPercentage = normalPrimaryValue / primaryValueRange;
      return minSecondaryValue + primaryPercentage * secondaryValueRange;
    },
    descale: (secondaryValue: number) => {
      const normalSecondaryValue = secondaryValue - minSecondaryValue;
      const secondaryPercentage = normalSecondaryValue / secondaryValueRange;
      return minPrimaryValue + secondaryPercentage * primaryValueRange;
    }
  };
};

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

/**
 * Clips between the given path and the clip floor
 * @param {*} context
 * @param {*} pathPoints
 * @param {*} clipWidth
 * @param {*} clipFloorCanvasY
 */
export const clipPath = (
  context: CanvasRenderingContext2D,
  pathPoints: { canvasX: number; canvasY: number }[],
  clipWidth: number,
  clipFloorCanvasY: number
) => {
  context.beginPath();
  context.moveTo(0, clipFloorCanvasY);
  context.lineTo(0, clipFloorCanvasY);
  pathPoints.forEach(({ canvasX, canvasY }) => {
    context.lineTo(canvasX, canvasY);
  });
  context.lineTo(clipWidth, clipFloorCanvasY);
  context.closePath();
  context.clip();
};

/**
 * Connects each point in the path using lineTo
 * @param {*} context
 * @param {*} pathPoints
 */
export const lineThroughPoints = (
  context: CanvasRenderingContext2D,
  pathPoints: { canvasX: number; canvasY: number }[]
) => {
  pathPoints.forEach(({ canvasX, canvasY }) => {
    context.lineTo(canvasX, canvasY);
  });
};

/**
 * Clamp a value by min/max
 * @param {*} value
 * @param {*} min
 * @param {*} max
 */
export const clamp = (value: number, min: number, max: number) => {
  return value < min ? min : value > max ? max : value;
};

export const getGradientMethod = (
  context: CanvasRenderingContext2D,
  graphMarginY: number,
  graphDepth: number
) => (primaryColor: string, secondaryColor: string) => {
  const top = graphMarginY;
  const bottom = graphMarginY + graphDepth;
  const gradient = context.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, secondaryColor);
  return gradient;
};
