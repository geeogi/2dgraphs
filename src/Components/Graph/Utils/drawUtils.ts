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
 * @param {*} GRAPH_MARGIN_Y
 * @param {*} graphDepth
 */
export const getGradientMethod = (
  context: CanvasRenderingContext2D,
  GRAPH_MARGIN_Y: number,
  graphDepth: number
) => (primaryColor: string, secondaryColor: string) => {
  const top = GRAPH_MARGIN_Y;
  const bottom = GRAPH_MARGIN_Y + graphDepth;
  const gradient = context.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, secondaryColor);
  return gradient;
};

/**
 * Stroke a point path
 * @param context
 * @param pathPoints
 * @param stokeStyle
 * @param lineWidth
 */
export const drawLine = (
  context: CanvasRenderingContext2D,
  pathPoints: { canvasX: number; canvasY: number }[],
  stokeStyle: string | CanvasGradient | CanvasPattern,
  lineWidth = 1
) => {
  context.beginPath();
  context.lineWidth = lineWidth;
  context.lineJoin = "round";
  context.strokeStyle = stokeStyle;
  context.moveTo(pathPoints[0].canvasX, pathPoints[0].canvasY);
  lineThroughPoints(context, pathPoints);
  context.stroke();
};

/**
 * Fill a point path
 * @param context
 * @param pathPoints
 * @param fillStyle
 * @param clip
 */
export const fillPath = (
  context: CanvasRenderingContext2D,
  pathPoints: { canvasX: number; canvasY: number }[],
  fillStyle: string | CanvasGradient | CanvasPattern,
  clip?: () => void
) => {
  context.beginPath();
  context.fillStyle = fillStyle;

  // Save context state before applying clip
  context.save();
  if (clip) {
    clip();
  }

  context.beginPath();
  lineThroughPoints(context, pathPoints);
  context.fill();

  // Reset context state to reset clip
  context.restore();
};
