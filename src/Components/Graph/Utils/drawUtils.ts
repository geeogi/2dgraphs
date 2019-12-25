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
 * Get a method which can be used to configure a vertical gradient
 * @param {*} context
 * @param {*} graphMarginY
 * @param {*} graphDepth
 */
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
