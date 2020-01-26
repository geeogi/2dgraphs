import {
  PRIMARY_COLOR_2D_CANVAS,
  PRIMARY_COLOR_ALPHA_2D_CANVAS
} from "../../Config/colors";
import { GraphPoints } from "./../../types";
import {
  drawLine,
  fillPath,
  getGradientMethod
} from "./2DCanvasUtils/drawUtils";

export const get2DCanvasLineGraphRenderMethod = (props: {
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  points: GraphPoints;
}) => {
  const { points, canvasElement, ctx } = props;

  /* RETURN 2D CANVAS RENDER FUNCTION */
  return function render2DCanvasLineGraph() {
    // Fetch the desired canvas height and width
    const height = canvasElement.offsetHeight;
    const width = canvasElement.offsetWidth;

    // Clear graph
    ctx.clearRect(0, 0, width, height);

    // Calculate graph dimensions
    const graphDepth = height;
    const graphWidth = width;

    // Utils to convert from graph coordinates to canvas pixels
    const toCanvasY = (graphY: number) => graphDepth - graphY;
    const toCanvasX = (graphX: number) => graphX;

    // Get canvas util methods
    const getGradient = getGradientMethod(ctx, 0, graphDepth);

    // Scale points to screen resolution
    const scaledPoints = points.map(point => ({
      canvasX: toCanvasX(((point.x + 1) / 2) * graphWidth),
      canvasY: toCanvasY(((point.y + 1) / 2) * graphDepth),
      dateTime: point.dateTime,
      price: point.price
    }));

    // Draw primary block
    fillPath(
      ctx,
      [
        { canvasX: toCanvasX(0), canvasY: toCanvasY(0) },
        ...scaledPoints,
        {
          canvasX: toCanvasX(graphWidth),
          canvasY: toCanvasY(0)
        }
      ],
      getGradient(
        PRIMARY_COLOR_ALPHA_2D_CANVAS(0.6),
        PRIMARY_COLOR_ALPHA_2D_CANVAS(0)
      )
    );

    // Draw primary line
    drawLine(ctx, scaledPoints, PRIMARY_COLOR_2D_CANVAS);
  };
};
