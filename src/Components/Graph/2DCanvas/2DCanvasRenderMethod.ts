import {
  PRIMARY_COLOR_ALPHA_RGB,
  PRIMARY_COLOR_RGB
} from "../../../Config/colors";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../Universal/constants";
import { drawXAxes, drawYAxes } from "./2DCanvasUtils/axesUtils";
import { getRetinaMethod } from "./2DCanvasUtils/canvasUtils";
import { getParentDimensions } from "./2DCanvasUtils/domUtils";
import {
  drawLine,
  fillPath,
  getGradientMethod
} from "./2DCanvasUtils/drawUtils";

export const get2DCanvasLineGraphRenderMethod = (props: {
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  xGridLines: number[];
  yGridLines: number[];
  points: {
    x: number;
    y: number;
    price: any;
    dateTime: any;
  }[];
}) => {
  const { points, xGridLines, yGridLines, canvasElement, ctx } = props;

  /* RETURN 2D CANVAS RENDER FUNCTION */
  return function render2DCanvasLineGraph() {
    // Fetch the desired canvas height and width
    const { height, width } = getParentDimensions(canvasElement);

    // Clear graph
    ctx.clearRect(0, 0, width, height);

    // Calculate graph dimensions
    const graphDepth = height - 2 * GRAPH_MARGIN_Y;
    const graphWidth = width - 2 * GRAPH_MARGIN_X;

    // Utils to convert from graph coordinates to canvas pixels
    const toCanvasY = (graphY: number) => GRAPH_MARGIN_Y + graphDepth - graphY;
    const toCanvasX = (graphX: number) => GRAPH_MARGIN_X + graphX;

    // Get canvas util methods
    const scaleRetina = getRetinaMethod(ctx, canvasElement, width, height);
    const getGradient = getGradientMethod(
      ctx,
      GRAPH_MARGIN_Y,
      GRAPH_MARGIN_Y + graphDepth
    );

    // Scale points to screen resolution
    const scaledPoints = points.map(point => ({
      canvasX: toCanvasX(((point.x + 1) / 2) * graphWidth),
      canvasY: toCanvasY(((point.y + 1) / 2) * graphDepth),
      dateTime: point.dateTime,
      price: point.price
    }));

    // Scale retina
    scaleRetina();

    // Draw x-axis
    drawXAxes(
      ctx,
      xGridLines,
      clipSpace => toCanvasX(((clipSpace + 1) / 2) * graphWidth),
      graphWidth,
      graphDepth
    );

    // Draw y-axis
    drawYAxes(
      ctx,
      yGridLines,
      clipSpace => toCanvasY(((clipSpace + 1) / 2) * graphDepth),
      graphWidth
    );

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
      getGradient(PRIMARY_COLOR_ALPHA_RGB(0.6), PRIMARY_COLOR_ALPHA_RGB(0))
    );

    // Draw primary line
    drawLine(ctx, scaledPoints, PRIMARY_COLOR_RGB);
  };
};
